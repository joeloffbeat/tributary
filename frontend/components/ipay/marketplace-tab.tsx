'use client'

import { useState, useMemo, useId, useCallback, useEffect } from 'react'
import { Search, Store, RefreshCw, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IPAssetCard, IPAssetCardSkeleton, type IPAssetListing } from './shared/ip-asset-card'
import { ExpandedCardDialog } from './shared/expanded-card-dialog'
import { ipayService } from '@/lib/services/ipay-service'
import { getEnrichedIPAsset, wipToUsdcEstimate } from '@/lib/services/story-api-service'
import type { IPListing } from '@/lib/types/ipay'
import type { IPCategory as CardCategory } from './shared/category-filter'

interface MarketplaceTabProps {
  address?: string
}

// Convert subgraph listing to card listing format
function mapToCardListing(listing: IPListing): IPAssetListing {
  // Map from IPListing category to card category
  const categoryMap: Record<string, CardCategory> = {
    images: 'image',
    music: 'music',
    code: 'code',
    data: 'data',
    templates: 'design',
    other: 'all',
  }

  return {
    id: listing.id,
    ipId: listing.storyIPId,
    title: listing.title || `IP Asset #${listing.id}`,
    description: listing.description,
    imageUrl: listing.imageUrl,
    creator: listing.creator,
    mintPrice: listing.pricePerUse,
    floorPrice: null, // Will be populated from secondary market
    usageCount: listing.totalUses,
    category: (categoryMap[listing.category] || 'all') as CardCategory,
    isActive: listing.isActive,
  }
}

export function MarketplaceTab({ address }: MarketplaceTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [listings, setListings] = useState<IPAssetListing[]>([])
  const [active, setActive] = useState<IPAssetListing | null>(null)
  const [enrichingId, setEnrichingId] = useState<string | null>(null)
  const layoutId = useId()

  // Fetch listings from subgraph
  const fetchListings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const subgraphListings = await ipayService.getListings({ isActive: true })

      if (subgraphListings.length > 0) {
        // Map subgraph listings to card format
        const cardListings = subgraphListings.map(mapToCardListing)
        setListings(cardListings)
      } else {
        // If no subgraph data, show empty state
        setListings([])
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load listings')
      setListings([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Filter listings based on search
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      return (
        searchQuery === '' ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [listings, searchQuery])

  // Handle card click - enrich data before opening dialog
  const handleCardClick = async (listing: IPAssetListing) => {
    setActive(listing)
    setEnrichingId(listing.id)

    try {
      // Fetch enriched data from Story Protocol API
      const enrichedData = await getEnrichedIPAsset(listing.ipId)

      // Calculate mint price from license terms
      let mintPrice = listing.mintPrice
      const commercialLicense = enrichedData.licenseTerms.find((t) => t.commercialUse)
      if (commercialLicense?.defaultMintingFee) {
        mintPrice = wipToUsdcEstimate(commercialLicense.defaultMintingFee)
      }

      // Update the active listing with enriched data
      setActive((prev) =>
        prev
          ? {
              ...prev,
              enrichedData,
              mintPrice,
              title:
                enrichedData.ipAsset?.nftMetadata?.name ||
                enrichedData.ipAsset?.metadata?.name ||
                prev.title,
              imageUrl:
                enrichedData.ipAsset?.nftMetadata?.image?.cachedUrl ||
                enrichedData.ipAsset?.metadata?.image ||
                prev.imageUrl,
              description:
                enrichedData.ipAsset?.metadata?.description || prev.description,
            }
          : prev
      )
    } catch (err) {
      console.error('Failed to enrich listing:', err)
      // Keep the dialog open with non-enriched data
    } finally {
      setEnrichingId(null)
    }
  }

  const handleRefresh = async () => {
    await fetchListings()
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      {/* Expanded Card Dialog */}
      <AnimatePresence>
        {active && (
          <ExpandedCardDialog
            listing={active}
            layoutId={layoutId}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search IP assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg border bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
              Retry
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!error && (
          <div className="text-sm text-muted-foreground">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
          </div>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <IPAssetCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12 rounded-lg border bg-card">
            <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-medium mb-2">No Listings Found</h4>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'No IP assets are currently listed'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <IPAssetCard
                key={listing.id}
                listing={listing}
                layoutId={layoutId}
                onClick={() => handleCardClick(listing)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
