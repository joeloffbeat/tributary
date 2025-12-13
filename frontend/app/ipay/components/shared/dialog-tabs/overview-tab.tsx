'use client'

import { User, Zap, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PriceDisplay } from '../price-display'
import { getCategoryLabel } from '../category-filter'
import type { IPAssetListing } from '../ip-asset-card'
import type { EnrichedIPAsset } from '@/lib/services/story-api-service'
import { STORY_EXPLORER } from '@/constants/protocols/story'

interface OverviewTabProps {
  listing: IPAssetListing
  enrichedData: EnrichedIPAsset | null
}

export function OverviewTab({ listing, enrichedData }: OverviewTabProps) {
  const [copied, setCopied] = useState(false)

  const truncatedCreator = listing.creatorName ||
    `${listing.creator.slice(0, 6)}...${listing.creator.slice(-4)}`

  const copyIpId = async () => {
    await navigator.clipboard.writeText(listing.ipId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const explorerUrl = `${STORY_EXPLORER}/ipa/${listing.ipId}`

  return (
    <div className="space-y-6">
      {/* Description */}
      {listing.description && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
          <p className="text-sm">{listing.description}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          label="Category"
          value={getCategoryLabel(listing.category)}
          icon={<Badge variant="secondary">{getCategoryLabel(listing.category)}</Badge>}
        />
        <StatsCard
          label="Total Uses"
          value={listing.usageCount.toString()}
          icon={<Zap className="h-4 w-4 text-yellow-500" />}
        />
        <StatsCard
          label="Mint Price"
          value={<PriceDisplay amount={listing.mintPrice} />}
        />
        <StatsCard
          label="Floor Price"
          value={
            listing.floorPrice !== null ? (
              <PriceDisplay amount={listing.floorPrice} />
            ) : (
              <span className="text-muted-foreground">No listings</span>
            )
          }
        />
      </div>

      {/* Creator Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{truncatedCreator}</p>
                <p className="text-xs text-muted-foreground">Creator</p>
              </div>
            </div>
            <Badge variant={listing.isActive ? 'default' : 'secondary'}>
              {listing.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* IP ID with copy and explorer link */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Story Protocol IP ID</p>
            <code className="text-sm font-mono">
              {listing.ipId.slice(0, 10)}...{listing.ipId.slice(-8)}
            </code>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={copyIpId}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* NFT Metadata (if available) */}
      {enrichedData?.ipAsset?.nftMetadata && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">NFT Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {enrichedData.ipAsset.tokenContract && (
              <div>
                <span className="text-muted-foreground">Contract:</span>{' '}
                <code className="text-xs">
                  {enrichedData.ipAsset.tokenContract.slice(0, 8)}...
                </code>
              </div>
            )}
            {enrichedData.ipAsset.tokenId && (
              <div>
                <span className="text-muted-foreground">Token ID:</span>{' '}
                <span>#{enrichedData.ipAsset.tokenId}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Stats card component
function StatsCard({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{value}</span>
        </div>
      </CardContent>
    </Card>
  )
}
