'use client'

import { useMemo } from 'react'
import { Zap, Tag, TrendingDown, Loader2, Coins, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PriceDisplay } from '../price-display'
import { ChainSelector } from '../chain-selector'
import { useIPayPayment } from '@/app/ipay/hooks/use-ipay-payment'
import type { IPAssetListing } from '../ip-asset-card'
import type { EnrichedIPAsset, StoryLicenseToken } from '@/lib/services/story-api-service'
import { wipToUsdcEstimate } from '@/lib/services/story-api-service'
import type { IPListing } from '@/app/ipay/types'

interface MarketTabProps {
  listing: IPAssetListing
  enrichedData: EnrichedIPAsset | null
}

export function MarketTab({ listing, enrichedData }: MarketTabProps) {
  const {
    isPaying,
    selectedChainId,
    setSelectedChainId,
    payForIP,
    currentStep,
  } = useIPayPayment()

  // Get primary mint price from license terms
  const primaryMintPrice = useMemo(() => {
    if (!enrichedData?.licenseTerms?.length) return listing.mintPrice

    const commercialLicense = enrichedData.licenseTerms.find((t) => t.commercialUse)
    if (commercialLicense?.defaultMintingFee) {
      return wipToUsdcEstimate(commercialLicense.defaultMintingFee)
    }
    return listing.mintPrice
  }, [enrichedData, listing.mintPrice])

  // Get floor price from secondary listings (license tokens)
  const { floorPrice, secondaryListings } = useMemo(() => {
    const tokens = enrichedData?.licenseTokens || []
    // In a real implementation, these would have listing prices from the subgraph
    // For now, we'll simulate with the listing's floor price
    if (tokens.length === 0 || listing.floorPrice === null) {
      return { floorPrice: null, secondaryListings: [] }
    }
    return { floorPrice: listing.floorPrice, secondaryListings: tokens }
  }, [enrichedData, listing.floorPrice])

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

          {/* Chain selector */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Pay from</p>
            <ChainSelector
              value={selectedChainId}
              onChange={setSelectedChainId}
              disabled={isPaying}
              className="w-full"
            />
          </div>

          {/* Mint button */}
          <Button
            onClick={handlePrimaryMint}
            disabled={isPaying || !listing.isActive}
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
          {secondaryListings.length === 0 ? (
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

              {secondaryListings.slice(0, 5).map((token) => (
                <SecondaryListingRow
                  key={token.tokenId}
                  token={token}
                  onBuy={() => {
                    // Handle secondary purchase
                  }}
                  isPaying={isPaying}
                />
              ))}

              {secondaryListings.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{secondaryListings.length - 5} more listings
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SecondaryListingRow({
  token,
  onBuy,
  isPaying,
}: {
  token: StoryLicenseToken
  onBuy: () => void
  isPaying: boolean
}) {
  // In a real implementation, the price would come from the subgraph
  // For now, we'll show a placeholder
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Token #{token.tokenId}
          </Badge>
          {token.transferable && (
            <Badge className="bg-green-500/10 text-green-500 text-xs">
              Transferable
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Seller: {token.ownerAddress.slice(0, 6)}...{token.ownerAddress.slice(-4)}
        </p>
      </div>
      <Button size="sm" onClick={onBuy} disabled={isPaying}>
        Buy
      </Button>
    </div>
  )
}
