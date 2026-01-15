'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle, XCircle, ExternalLink, AlertTriangle } from 'lucide-react'
import { useRaiseDispute } from '../hooks'
import { STORY_EXPLORER, DISPUTE_TAGS } from '@/constants/protocols/story'
import { ChainGuard } from './chain-guard'

export function RaiseDisputeTab() {
  const { raiseDispute, result, reset, isLoading, tagToBytes32, cidToBytes32 } = useRaiseDispute()
  const [targetIpId, setTargetIpId] = useState('')
  const [evidenceCid, setEvidenceCid] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  const handleSubmit = async () => {
    if (!targetIpId || !evidenceCid || !selectedTag) return

    await raiseDispute({
      targetIpId: targetIpId as `0x${string}`,
      disputeEvidenceHash: cidToBytes32(evidenceCid),
      targetTag: tagToBytes32(selectedTag),
      data: '0x' as `0x${string}`,
    })
  }

  const canSubmit = targetIpId && evidenceCid && selectedTag && !isLoading

  return (
    <ChainGuard>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Raise Dispute
          </CardTitle>
          <CardDescription>
            File a dispute against an IP Asset for infringement or violations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">Target IP ID</Label>
            <Input
              id="target"
              placeholder="0x..."
              value={targetIpId}
              onChange={(e) => {
                setTargetIpId(e.target.value)
                if (result.status !== 'idle') reset()
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Dispute Category</Label>
            <Select
              value={selectedTag}
              onValueChange={(value) => {
                setSelectedTag(value)
                if (result.status !== 'idle') reset()
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dispute type" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_TAGS.map((tag) => (
                  <SelectItem key={tag.value} value={tag.value}>
                    <div>
                      <div className="font-medium">{tag.label}</div>
                      <div className="text-xs text-muted-foreground">{tag.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence IPFS CID</Label>
            <Input
              id="evidence"
              placeholder="QmYourEvidenceCID..."
              value={evidenceCid}
              onChange={(e) => {
                setEvidenceCid(e.target.value)
                if (result.status !== 'idle') reset()
              }}
            />
            <p className="text-xs text-muted-foreground">
              Upload evidence to IPFS and provide the CID
            </p>
          </div>

          {result.status === 'success' && result.hash && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-green-700">Dispute raised successfully!</span>
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
                Raising Dispute...
              </>
            ) : (
              'Raise Dispute'
            )}
          </Button>
        </CardContent>
      </Card>
    </ChainGuard>
  )
}
