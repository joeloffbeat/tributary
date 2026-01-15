'use client'

import { useState } from 'react'
import { parseUnits } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, ExternalLink, DollarSign } from 'lucide-react'
import { usePayRoyalty } from '../hooks'
import { STORY_CONTRACTS, STORY_EXPLORER } from '@/constants/protocols/story'
import { ChainGuard } from './chain-guard'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export function PayRoyaltyTab() {
  const { payRoyalty, result, reset, isLoading } = usePayRoyalty()
  const [receiverIpId, setReceiverIpId] = useState('')
  const [amount, setAmount] = useState('')

  const handleSubmit = async () => {
    if (!receiverIpId || !amount) return

    await payRoyalty({
      receiverIpId: receiverIpId as `0x${string}`,
      payerIpId: ZERO_ADDRESS,
      token: STORY_CONTRACTS.WIP_TOKEN,
      amount: parseUnits(amount, 18),
    })
  }

  const canSubmit = receiverIpId && amount && !isLoading

  return (
    <ChainGuard>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pay Royalty
          </CardTitle>
          <CardDescription>
            Pay royalties to an IP Asset using WIP tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receiver">Receiver IP ID</Label>
            <Input
              id="receiver"
              placeholder="0x..."
              value={receiverIpId}
              onChange={(e) => {
                setReceiverIpId(e.target.value)
                if (result.status !== 'idle') reset()
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (WIP)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                if (result.status !== 'idle') reset()
              }}
              step="any"
              min="0"
            />
          </div>

          {result.status === 'success' && result.hash && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-green-700">Royalty paid successfully!</span>
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
                Paying Royalty...
              </>
            ) : (
              'Pay Royalty'
            )}
          </Button>
        </CardContent>
      </Card>
    </ChainGuard>
  )
}
