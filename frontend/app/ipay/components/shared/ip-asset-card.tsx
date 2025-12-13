'use client'

import { User, Image as ImageIcon, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PriceDisplay } from './price-display'
import { getCategoryLabel, type IPCategory } from './category-filter'
import type { EnrichedIPAsset } from '@/lib/services/story-api-service'

export interface IPAssetListing {
  id: string
  ipId: string
  title: string
  description?: string
  imageUrl?: string
  creator: string
  creatorName?: string
  mintPrice: bigint
  floorPrice: bigint | null
  usageCount: number
  category: IPCategory
  isActive: boolean
  // Enriched data from Story Protocol API (populated on expand)
  enrichedData?: EnrichedIPAsset
}

interface IPAssetCardProps {
  listing: IPAssetListing
  layoutId: string
  onClick: () => void
}

export function IPAssetCard({ listing, layoutId, onClick }: IPAssetCardProps) {
  const truncatedCreator = listing.creatorName
    || `${listing.creator.slice(0, 6)}...${listing.creator.slice(-4)}`

  return (
    <motion.div
      layoutId={`card-${listing.id}-${layoutId}`}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <motion.div
          layoutId={`image-${listing.id}-${layoutId}`}
          className="aspect-video bg-muted relative"
        >
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
          >
            {getCategoryLabel(listing.category)}
          </Badge>
        </motion.div>

        <CardContent className="p-4">
          {/* Title */}
          <motion.h3
            layoutId={`title-${listing.id}-${layoutId}`}
            className="font-semibold text-lg mb-1 truncate"
          >
            {listing.title}
          </motion.h3>

          {/* Creator */}
          <motion.div
            layoutId={`creator-${listing.id}-${layoutId}`}
            className="flex items-center gap-1 text-sm text-muted-foreground mb-3"
          >
            <User className="h-3 w-3" />
            <span className="truncate">{truncatedCreator}</span>
          </motion.div>

          {/* Prices */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mint Price</span>
              <PriceDisplay amount={listing.mintPrice} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Floor Price</span>
              {listing.floorPrice !== null ? (
                <div className="flex items-center gap-1">
                  {listing.floorPrice < listing.mintPrice && (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  )}
                  <PriceDisplay amount={listing.floorPrice} />
                </div>
              ) : (
                <span className="text-muted-foreground">No listings</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Loading skeleton for the card
export function IPAssetCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardContent className="p-4">
        <div className="h-6 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-3" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded animate-pulse w-20" />
            <div className="h-4 bg-muted rounded animate-pulse w-24" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded animate-pulse w-20" />
            <div className="h-4 bg-muted rounded animate-pulse w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
