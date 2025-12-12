'use client'

import { Eye, Zap, User, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PriceDisplay } from './price-display'
import { getCategoryLabel, type IPCategory } from './category-filter'

export interface IPAssetListing {
  id: string
  ipId: string
  title: string
  description?: string
  imageUrl?: string
  creator: string
  creatorName?: string
  pricePerUse: bigint
  usageCount: number
  category: IPCategory
  isActive: boolean
}

interface IPAssetCardProps {
  listing: IPAssetListing
  onView?: (listing: IPAssetListing) => void
  onPayAndUse?: (listing: IPAssetListing) => void
}

export function IPAssetCard({ listing, onView, onPayAndUse }: IPAssetCardProps) {
  const truncatedCreator = listing.creatorName
    || `${listing.creator.slice(0, 6)}...${listing.creator.slice(-4)}`

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-video bg-muted relative">
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
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-1 truncate">{listing.title}</h3>

        {/* Creator */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <User className="h-3 w-3" />
          <span className="truncate">{truncatedCreator}</span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Zap className="h-3 w-3" />
            <span>{listing.usageCount} uses</span>
          </div>
          <PriceDisplay
            amount={listing.pricePerUse}
            className="text-primary font-semibold"
          />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView?.(listing)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onPayAndUse?.(listing)}
          disabled={!listing.isActive}
        >
          <Zap className="h-4 w-4 mr-1" />
          Pay & Use
        </Button>
      </CardFooter>
    </Card>
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
        <div className="flex justify-between">
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
          <div className="h-4 bg-muted rounded animate-pulse w-12" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <div className="h-9 bg-muted rounded animate-pulse flex-1" />
        <div className="h-9 bg-muted rounded animate-pulse flex-1" />
      </CardFooter>
    </Card>
  )
}
