'use client'

import { useEffect } from 'react'
import { Loader2, ImageIcon, RefreshCw, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useIPayListing } from '../../hooks'
import type { IPAsset } from '@/lib/types/story'

interface StepSelectIPProps {
  onSelect: (ip: IPAsset) => void
}

export function StepSelectIP({ onSelect }: StepSelectIPProps) {
  const { storyAssets, isLoadingAssets, assetsError, refetchAssets } = useIPayListing()

  // Fetch assets on mount
  useEffect(() => {
    refetchAssets()
  }, [refetchAssets])

  if (isLoadingAssets) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading your Story Protocol IP assets...</p>
      </div>
    )
  }

  if (assetsError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Assets</h3>
        <p className="text-muted-foreground mb-4">{assetsError}</p>
        <Button onClick={() => refetchAssets()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (storyAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Monetizable IP Assets</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          You don&apos;t have any Story Protocol IP assets with commercial licenses.
          Register an IP with commercial terms to create a listing.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchAssets()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <a href="/protocols/story" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Register IP
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Select an IP Asset</h3>
          <p className="text-sm text-muted-foreground">
            Choose from your Story Protocol IP assets with commercial licenses
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchAssets()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {storyAssets.map((asset) => (
          <IPAssetSelectCard key={asset.ipId} asset={asset} onSelect={() => onSelect(asset)} />
        ))}
      </div>
    </div>
  )
}

interface IPAssetSelectCardProps {
  asset: IPAsset
  onSelect: () => void
}

function IPAssetSelectCard({ asset, onSelect }: IPAssetSelectCardProps) {
  const imageUrl =
    asset.nftMetadata?.image?.cachedUrl ||
    asset.nftMetadata?.image?.originalUrl ||
    asset.metadata?.image

  const title =
    asset.nftMetadata?.name || asset.metadata?.name || asset.name || `IP #${asset.tokenId || asset.ipId.slice(0, 8)}`

  const hasCommercialLicense = asset.licenses?.some((l) => l.terms?.commercialUse)
  const hasDerivatives = asset.licenses?.some((l) => l.terms?.derivativesAllowed)

  return (
    <Card
      className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
      onClick={onSelect}
    >
      <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2">
              <Check className="h-4 w-4" />
              Select
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold truncate mb-2">{title}</h4>
        <p className="text-xs text-muted-foreground mb-3 truncate">
          {asset.ipId.slice(0, 10)}...{asset.ipId.slice(-8)}
        </p>
        <div className="flex flex-wrap gap-1">
          {hasCommercialLicense && (
            <Badge variant="secondary" className="text-xs">
              Commercial
            </Badge>
          )}
          {hasDerivatives && (
            <Badge variant="outline" className="text-xs">
              Derivatives
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StepSelectIP
