'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, RefreshCw, AlertCircle, ExternalLink, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { STORY_EXPLORER, STORY_API_PROXY } from '@/constants/protocols/story'
import type { IPAsset } from '@/lib/types/story'
import { getAssetDisplayName, getAssetImageUrl } from '@/lib/services/story-service'
import { ipayService } from '@/lib/services/ipay-service'

interface MyIPAssetsTabProps {
  address: string | undefined
}

export function MyIPAssetsTab({ address }: MyIPAssetsTabProps) {
  const router = useRouter()
  const [assets, setAssets] = useState<IPAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listedIpIds, setListedIpIds] = useState<Set<string>>(new Set())
  const [checkingListings, setCheckingListings] = useState(false)

  // Fetch IP assets from Story API (works regardless of connected chain)
  const fetchAssets = useCallback(async () => {
    if (!address) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(STORY_API_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/assets',
          where: { ownerAddress: address },
          includeLicenses: true,
          pagination: { limit: 100, offset: 0 },
        }),
      })
      if (!response.ok) throw new Error('Failed to fetch IP assets')
      const data = await response.json()
      setAssets(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [address])

  // Check which assets are already listed on IPay
  const checkListedAssets = useCallback(async () => {
    if (!address || assets.length === 0) return
    setCheckingListings(true)
    try {
      const listings = await ipayService.getListingsByCreator(address)
      const listedIds = new Set(listings.map(l => l.storyIPId.toLowerCase()))
      setListedIpIds(listedIds)
    } catch (err) {
      console.error('Failed to check listings:', err)
    } finally {
      setCheckingListings(false)
    }
  }, [address, assets])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  useEffect(() => {
    checkListedAssets()
  }, [checkListedAssets])

  const isListed = (ipId: string) => listedIpIds.has(ipId.toLowerCase())

  const handleListOnIPay = (asset: IPAsset) => {
    // Navigate to create listing page with pre-selected asset
    const params = new URLSearchParams({
      ipId: asset.ipId,
      name: getAssetDisplayName(asset),
      image: getAssetImageUrl(asset) || '',
    })
    router.push(`/ipay/create?${params.toString()}`)
  }

  if (!address) {
    return (
      <div className="text-center py-12 rounded-lg border bg-card">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h4 className="text-lg font-medium mb-2">Connect Wallet</h4>
        <p className="text-sm text-muted-foreground">Connect your wallet to view your IP assets</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Story Protocol IP Assets</h3>
          <p className="text-sm text-muted-foreground">
            Select an IP asset to list for pay-per-use licensing
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAssets} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-500">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 rounded-lg border bg-card">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-medium mb-2">No IP Assets Found</h4>
          <p className="text-sm text-muted-foreground mb-4">
            You don&apos;t have any IP assets registered on Story Protocol yet.
          </p>
          <Button variant="outline" onClick={() => router.push('/playground/protocols/story')}>
            Register IP on Story Protocol
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const imageUrl = getAssetImageUrl(asset)
            const name = getAssetDisplayName(asset)
            const listed = isListed(asset.ipId)
            const hasLicenses = asset.licenses && asset.licenses.length > 0

            return (
              <div key={asset.ipId} className="rounded-lg border bg-card overflow-hidden">
                {/* Image */}
                {imageUrl ? (
                  <div className="aspect-square bg-muted">
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-medium truncate mb-2">{name}</h4>

                  <div className="space-y-1 text-xs mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">IP ID:</span>
                      <span className="font-mono">{asset.ipId.slice(0, 8)}...{asset.ipId.slice(-6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Licenses:</span>
                      {hasLicenses ? (
                        <Badge className="bg-green-500/10 text-green-500 text-xs">
                          {asset.licenses!.length} attached
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">None</Badge>
                      )}
                    </div>
                    {listed && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">IPay Status:</span>
                        <Badge className="bg-blue-500/10 text-blue-500 text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Listed
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {listed ? (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        <Check className="h-4 w-4 mr-2" />
                        Already Listed
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleListOnIPay(asset)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        List on IPay
                      </Button>
                    )}
                    <a
                      href={`${STORY_EXPLORER}/ipa/${asset.ipId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on Story
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info Banner */}
      {assets.length > 0 && !loading && (
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-400">
            <strong>Note:</strong> Listing your IP on IPay allows anyone to pay for a license using USDC on Avalanche.
            You&apos;ll receive payments directly to your wallet.
          </p>
        </div>
      )}
    </div>
  )
}

export default MyIPAssetsTab
