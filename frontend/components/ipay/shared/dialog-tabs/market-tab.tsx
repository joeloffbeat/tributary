'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { Zap, Tag, TrendingDown, Loader2, Coins, AlertCircle, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PriceDisplay } from '../price-display'
import { useIPayPayment } from '@/hooks/ipay/use-ipay-payment'
import { useAccount } from '@/lib/web3'
import { isChainSupported } from '@/constants/ipay'
import { SELF_HOSTED_DEPLOYMENTS } from '@/constants/hyperlane/self-hosted'
import type { IPAssetListing } from '../ip-asset-card'
import type { EnrichedIPAsset, StoryLicenseToken } from '@/lib/services/story-api-service'
import { wipToUsdcEstimate } from '@/lib/services/story-api-service'
import { ipayService, type LicenseListing } from '@/lib/services/ipay-service'
import type { IPListing } from '@/lib/types/ipay'

interface MarketTabProps {
  listing: IPAssetListing
  enrichedData: EnrichedIPAsset | null
}

export function MarketTab({ listing, enrichedData }: MarketTabProps) {
  const { address } = useAccount()
  const {
    isPaying,
    selectedChainId,
    selectedChain,
    payForIP,
    currentStep,
  } = useIPayPayment()

  // Check if connected chain is supported
  const isConnectedChainSupported = isChainSupported(selectedChainId) && !!SELF_HOSTED_DEPLOYMENTS[selectedChainId]

  // State for license listings from subgraph
  const [licenseListings, setLicenseListings] = useState<LicenseListing[]>([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  // Fetch license listings from subgraph
  const fetchLicenseListings = useCallback(async () => {
    setLoadingListings(true)
    try {
      const listings = await ipayService.getActiveLicenseListings()
      // Filter for listings related to this IP asset's license tokens
      const ipTokenIds = enrichedData?.licenseTokens?.map((t) => t.tokenId) || []
      const relevantListings = listings.filter((l) =>
        ipTokenIds.some((id) => id === l.licenseTokenId.toString())
      )
      setLicenseListings(relevantListings)
    } catch (err) {
      console.error('Failed to fetch license listings:', err)
    } finally {
      setLoadingListings(false)
    }
  }, [enrichedData])

  useEffect(() => {
    if (enrichedData) {
      fetchLicenseListings()
    }
  }, [enrichedData, fetchLicenseListings])

  // Get primary mint price from license terms
  const primaryMintPrice = useMemo(() => {
    if (!enrichedData?.licenseTerms?.length) return listing.mintPrice

    const commercialLicense = enrichedData.licenseTerms.find((t) => t.commercialUse)
    if (commercialLicense?.defaultMintingFee) {
      return wipToUsdcEstimate(commercialLicense.defaultMintingFee)
    }
    return listing.mintPrice
  }, [enrichedData, listing.mintPrice])

  // Get floor price from subgraph license listings
  const floorPrice = useMemo(() => {
    if (licenseListings.length === 0) return null
    const prices = licenseListings.map((l) => l.price)
    return prices.reduce((min, p) => (p < min ? p : min), prices[0])
  }, [licenseListings])

  const handlePrimaryMint = async () => {
    // Convert listing to IPListing type for payment hook
    const ipListing: IPListing = {
      id: listing.id,
      storyIPId: listing.ipId as `0x${string}`,
      creator: listing.creator as `0x${string}`,
      title: listing.title,
      description: listing.description || '',
      imageUrl: listing.imageUrl || '',
      category: 'other',
      pricePerUse: primaryMintPrice,
      assetIpfsHash: '',
      metadataUri: '',
      totalUses: listing.usageCount,
      totalRevenue: 0n,
      isActive: listing.isActive,
      createdAt: 0,
    }
    await payForIP(ipListing)
  }

  // Handle purchasing a license listing
  const handlePurchaseListing = async (licenseListing: LicenseListing) => {
    if (!address) return

    setPurchasingId(licenseListing.id)
    try {
      const response = await fetch(
        `/api/ipay/license-listing/purchase?listingId=${licenseListing.id}&buyer=${address}&sourceChain=${selectedChainId}`,
        {
          method: 'GET',
          headers: {
            'x-source-chain': selectedChainId.toString(),
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to purchase license listing')
      }

      // Refresh listings after purchase
      await fetchLicenseListings()
    } catch (err) {
      console.error('Failed to purchase license listing:', err)
    } finally {
      setPurchasingId(null)
    }
  }

  const isBelowMint = floorPrice !== null && floorPrice < primaryMintPrice

  return (
    <div className="space-y-6">
      {/* Primary Market - Mint New License */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Primary Market
          </CardTitle>
          <CardDescription>Mint a new license directly from the IP owner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mint Price</span>
            <PriceDisplay amount={primaryMintPrice} className="text-lg" />
          </div>

          <Separator />

          {/* Connected Chain Info */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Pay from</p>
            <div className="p-3 rounded-lg border bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Connected Chain:</span>
                <span className="font-medium">
                  {selectedChain?.displayName || `Chain ${selectedChainId}`}
                </span>
              </div>
            </div>
          </div>

          {/* Chain Not Supported Warning */}
          {!isConnectedChainSupported && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please switch to Avalanche Fuji, Sepolia, or Polygon Amoy to make payments.
              </AlertDescription>
            </Alert>
          )}

          {/* Mint button */}
          <Button
            onClick={handlePrimaryMint}
            disabled={isPaying || !listing.isActive || !isConnectedChainSupported}
            className="w-full"
          >
            {isPaying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {currentStep?.label || 'Processing...'}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Mint License
              </>
            )}
          </Button>

          {!listing.isActive && (
            <div className="flex items-center gap-2 text-sm text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              This listing is currently inactive
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary Market - Token Listings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Secondary Market
              </CardTitle>
              <CardDescription>
                Buy from existing license holders
              </CardDescription>
            </div>
            {floorPrice !== null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Floor Price</p>
                <div className="flex items-center gap-1">
                  {isBelowMint && <TrendingDown className="h-4 w-4 text-green-500" />}
                  <PriceDisplay amount={floorPrice} />
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingListings ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : licenseListings.length === 0 ? (
            <div className="text-center py-6">
              <Tag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No secondary listings available
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Be the first to list your license after minting!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {isBelowMint && (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Floor below mint price!
                </Badge>
              )}

              {licenseListings.slice(0, 5).map((licenseListing) => (
                <LicenseListingRow
                  key={licenseListing.id}
                  listing={licenseListing}
                  onBuy={() => handlePurchaseListing(licenseListing)}
                  isPurchasing={purchasingId === licenseListing.id}
                  disabled={isPaying || purchasingId !== null}
                />
              ))}

              {licenseListings.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{licenseListings.length - 5} more listings
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function LicenseListingRow({
  listing,
  onBuy,
  isPurchasing,
  disabled,
}: {
  listing: LicenseListing
  onBuy: () => void
  isPurchasing: boolean
  disabled: boolean
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Token #{listing.licenseTokenId.toString()}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
        </p>
        <PriceDisplay amount={listing.price} className="text-sm" />
      </div>
      <Button size="sm" onClick={onBuy} disabled={disabled || isPurchasing}>
        {isPurchasing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <ShoppingCart className="h-3 w-3 mr-1" />
            Buy
          </>
        )}
      </Button>
    </div>
  )
}
