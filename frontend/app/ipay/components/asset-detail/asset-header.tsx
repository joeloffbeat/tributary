'use client'

import { User, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCategoryInfo } from '../../constants'
import type { IPListing } from '../../types'

interface AssetHeaderProps {
  listing: IPListing
}

export function AssetHeader({ listing }: AssetHeaderProps) {
  const categoryInfo = getCategoryInfo(listing.category)
  const truncatedCreator = `${listing.creator.slice(0, 6)}...${listing.creator.slice(-4)}`

  return (
    <div className="space-y-6">
      {/* Image */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-24 w-24 text-muted-foreground" />
          </div>
        )}

        {/* Category Badge */}
        <Badge
          variant="secondary"
          className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-base px-3 py-1"
        >
          {categoryInfo?.icon} {categoryInfo?.label || listing.category}
        </Badge>
      </div>

      {/* Title & Description */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
        {listing.description && (
          <p className="text-muted-foreground text-lg">{listing.description}</p>
        )}
      </div>

      {/* Creator */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Created by</p>
          <div className="flex items-center gap-2">
            <span className="font-medium">{truncatedCreator}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => window.open(`https://snowtrace.io/address/${listing.creator}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Total Uses</span>
          <p className="font-semibold text-lg">{listing.totalUses}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Status</span>
          <p className="font-semibold text-lg">
            {listing.isActive ? (
              <span className="text-green-500">Active</span>
            ) : (
              <span className="text-red-500">Inactive</span>
            )}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Listed</span>
          <p className="font-semibold text-lg">
            {new Date(listing.createdAt * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AssetHeader
