'use client'

import { X, ExternalLink, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatAddress } from '@/lib/web3/format'
import { getIPAssetImageUrl, getIPAssetDisplayName } from '@/lib/services/story-api-service'
import type { TributaryVault } from '../types'

interface VaultDialogHeaderProps {
  vault: TributaryVault
  onClose: () => void
}

export function VaultDialogHeader({ vault, onClose }: VaultDialogHeaderProps) {
  const imageUrl = vault.ipAsset ? getIPAssetImageUrl(vault.ipAsset) : null
  const displayName = vault.ipAsset ? getIPAssetDisplayName(vault.ipAsset) : vault.tokenName

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-48 bg-river-800 relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={displayName} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-tributary-900 to-river-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-river-900 via-transparent to-transparent" />
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 bg-river-900/80 backdrop-blur-sm hover:bg-river-800"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Title Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end justify-between">
          <div>
            <Badge className="mb-2 bg-tributary-500/20 text-tributary-400 border-tributary-500/30">
              {vault.tokenSymbol}
            </Badge>
            <h2 className="text-2xl font-bold text-white">{displayName}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-river-400">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {vault.creatorName || formatAddress(vault.creator)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(vault.createdAt * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Story Protocol Link */}
          {vault.storyIPId && (
            <a
              href={`https://aeneid.storyscan.xyz/ip/${vault.storyIPId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-tributary-400 hover:text-tributary-300 transition-colors"
            >
              View on Story <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
