'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, Calendar, Hash, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { StoryIPAsset } from '@/lib/services/story-api-service'
import { STORY_EXPLORER } from '@/constants/protocols/story'

interface IPAssetOverviewTabProps {
  asset: StoryIPAsset
}

export function IPAssetOverviewTab({ asset }: IPAssetOverviewTabProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const description = asset.description || asset.nftMetadata?.description
  const createdAt = asset.createdAt || asset.registrationDate

  return (
    <div className="space-y-6">
      {/* Description */}
      {description && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
          <p className="text-sm leading-relaxed">{description}</p>
        </div>
      )}

      {/* Key Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          icon={<Hash className="h-4 w-4" />}
          label="IP ID"
          value={`${asset.ipId.slice(0, 8)}...${asset.ipId.slice(-6)}`}
          fullValue={asset.ipId}
          onCopy={() => copyToClipboard(asset.ipId, 'ipId')}
          copied={copiedField === 'ipId'}
        />
        <InfoCard
          icon={<Hash className="h-4 w-4" />}
          label="Token ID"
          value={`#${asset.tokenId}`}
        />
        {asset.ownerAddress && (
          <InfoCard
            icon={<User className="h-4 w-4" />}
            label="Owner"
            value={`${asset.ownerAddress.slice(0, 6)}...${asset.ownerAddress.slice(-4)}`}
            fullValue={asset.ownerAddress}
            onCopy={() => copyToClipboard(asset.ownerAddress, 'owner')}
            copied={copiedField === 'owner'}
          />
        )}
        {createdAt && (
          <InfoCard
            icon={<Calendar className="h-4 w-4" />}
            label="Created"
            value={formatTimestamp(createdAt)}
          />
        )}
      </div>

      {/* License Summary */}
      {asset.licenses && asset.licenses.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">License Terms Attached</p>
                <p className="text-xs text-muted-foreground">
                  View details in the License tab
                </p>
              </div>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                {asset.licenses.length} {asset.licenses.length === 1 ? 'License' : 'Licenses'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NFT Details */}
      {asset.tokenContract && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">NFT Details</h4>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Contract</span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono">
                  {asset.tokenContract.slice(0, 8)}...
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(asset.tokenContract, 'contract')}
                >
                  {copiedField === 'contract' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Token ID</span>
              <span>{asset.tokenId}</span>
            </div>
            {asset.nftMetadata?.collection?.name && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Collection</span>
                <span>{asset.nftMetadata.collection.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Story Explorer Link */}
      <div className="pt-2">
        <Button variant="outline" className="w-full" asChild>
          <a
            href={`${STORY_EXPLORER}/ipa/${asset.ipId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Story Explorer
          </a>
        </Button>
      </div>
    </div>
  )
}

// Info card component
function InfoCard({
  icon,
  label,
  value,
  fullValue,
  onCopy,
  copied,
}: {
  icon: React.ReactNode
  label: string
  value: string
  fullValue?: string
  onCopy?: () => void
  copied?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              {icon}
              {label}
            </p>
            <p className="text-sm font-medium truncate">{value}</p>
          </div>
          {onCopy && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 shrink-0"
              onClick={onCopy}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return timestamp
  }
}
