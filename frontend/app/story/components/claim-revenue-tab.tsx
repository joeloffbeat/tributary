'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, ExternalLink, Coins } from 'lucide-react'
import { useAccount } from '@/lib/web3'
import { useClaimRevenue } from '../hooks'
import { STORY_CONTRACTS, STORY_EXPLORER } from '@/constants/protocols/story'
import { ChainGuard } from './chain-guard'

export function ClaimRevenueTab() {
  const { address } = useAccount()
  const { claimRevenue, result, reset, isLoading } = useClaimRevenue()
  const [ancestorIpId, setAncestorIpId] = useState('')
  const [childIpIds, setChildIpIds] = useState('')

  const handleSubmit = async () => {
    if (!ancestorIpId || !address) return

    // Parse child IP IDs (comma separated)
    const childIds = childIpIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0) as `0x${string}`[]

    await claimRevenue({
      ancestorIpId: ancestorIpId as `0x${string}`,
      claimer: address,
      currencyTokens: [STORY_CONTRACTS.WIP_TOKEN],
      childIpIds: childIds,
    })
  }

  const canSubmit = ancestorIpId && address && !isLoading

  return (
    <ChainGuard>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Claim Revenue
          </CardTitle>
          <CardDescription>
            Claim accumulated royalty revenue from your IP Assets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ancestor">Your IP ID (Ancestor)</Label>
            <Input
              id="ancestor"
              placeholder="0x..."
              value={ancestorIpId}
              onChange={(e) => {
                setAncestorIpId(e.target.value)
                if (result.status !== 'idle') reset()
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="children">Child IP IDs (optional, comma separated)</Label>
            <Input
              id="children"
              placeholder="0x..., 0x..."
              value={childIpIds}
              onChange={(e) => {
                setChildIpIds(e.target.value)
                if (result.status !== 'idle') reset()
              }}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to claim from all child IPs
            </p>
          </div>

          {result.status === 'success' && result.hash && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-green-700">Revenue claimed successfully!</span>
                <a
                  href={`${STORY_EXPLORER}/tx/${result.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-700 hover:text-green-800"
                >
                  View TX <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          )}

          {result.status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming Revenue...
              </>
            ) : (
              'Claim Revenue'
            )}
          </Button>
        </CardContent>
      </Card>
    </ChainGuard>
  )
}
