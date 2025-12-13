'use client'

import { useState } from 'react'
import { AlertTriangle, ExternalLink, Loader2, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DISPUTE_TAGS, type DisputeTag } from '../constants'
import { keccak256, toHex } from 'viem'

interface DisputesTabProps {
  address: string | undefined
}

const DISPUTE_TAG_INFO: Record<DisputeTag, { label: string; description: string }> = {
  IMPROPER_REGISTRATION: {
    label: 'Improper Registration',
    description: 'The IP was registered without proper ownership or rights',
  },
  IMPROPER_USAGE: {
    label: 'Improper Usage',
    description: 'The IP is being used in violation of license terms',
  },
  IMPROPER_PAYMENT: {
    label: 'Improper Payment',
    description: 'Royalty or payment obligations are not being met',
  },
  CONTENT_STANDARDS_VIOLATION: {
    label: 'Content Standards Violation',
    description: 'The content violates community or legal standards',
  },
}

export function DisputesTab({ address }: DisputesTabProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [targetIpId, setTargetIpId] = useState('')
  const [disputeTag, setDisputeTag] = useState<DisputeTag | ''>('')
  const [evidence, setEvidence] = useState('')
  const [result, setResult] = useState<{ success: boolean; messageId?: string; error?: string } | null>(null)

  const handleSubmitDispute = async () => {
    if (!address || !targetIpId || !disputeTag || !evidence) return

    setIsSubmitting(true)
    setResult(null)

    try {
      // Generate evidence hash (in production, upload to IPFS first)
      const evidenceHash = keccak256(toHex(evidence))
      const tagHash = keccak256(toHex(disputeTag))

      const response = await fetch('/api/ipay/raise-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetIpId,
          evidenceHash,
          disputeTag: tagHash,
          disputant: address,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({ success: true, messageId: data.messageId })
        // Reset form
        setTargetIpId('')
        setDisputeTag('')
        setEvidence('')
      } else {
        setResult({ success: false, error: data.error })
      }
    } catch (error) {
      setResult({ success: false, error: 'Failed to submit dispute' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!address) {
    return (
      <div className="text-center py-12 rounded-lg border bg-card">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h4 className="text-lg font-medium mb-2">Connect Wallet</h4>
        <p className="text-sm text-muted-foreground">
          Connect your wallet to view and file disputes
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">IP Disputes</h3>
          <p className="text-sm text-muted-foreground">
            File and track disputes against Story Protocol IP Assets
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              File Dispute
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>File a Dispute</DialogTitle>
              <DialogDescription>
                Raise a dispute against an IP Asset via cross-chain messaging
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Target IP ID */}
              <div className="space-y-2">
                <Label htmlFor="targetIpId">Target IP ID</Label>
                <Input
                  id="targetIpId"
                  placeholder="0x..."
                  value={targetIpId}
                  onChange={(e) => setTargetIpId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The IP Asset address on Story Protocol
                </p>
              </div>

              {/* Dispute Type */}
              <div className="space-y-2">
                <Label htmlFor="disputeTag">Dispute Type</Label>
                <Select value={disputeTag} onValueChange={(v) => setDisputeTag(v as DisputeTag)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dispute type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DISPUTE_TAG_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{info.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {disputeTag && (
                  <p className="text-xs text-muted-foreground">
                    {DISPUTE_TAG_INFO[disputeTag].description}
                  </p>
                )}
              </div>

              {/* Evidence */}
              <div className="space-y-2">
                <Label htmlFor="evidence">Evidence Description</Label>
                <Textarea
                  id="evidence"
                  placeholder="Describe the evidence supporting your dispute..."
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This will be hashed and stored on-chain
                </p>
              </div>

              {/* Result */}
              {result && (
                <div
                  className={`p-3 rounded-lg ${
                    result.success
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  {result.success ? (
                    <div className="text-sm text-green-400">
                      <p className="font-medium">Dispute submitted successfully!</p>
                      <p className="text-xs mt-1 font-mono break-all">
                        Message ID: {result.messageId}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-400">{result.error}</p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitDispute}
                disabled={!targetIpId || !disputeTag || !evidence || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Dispute'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search disputes by IP ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-400">
              Cross-Chain Dispute Filing
            </p>
            <p className="text-sm text-amber-400/80">
              Disputes are filed from Avalanche Fuji and processed on Story Aeneid via Hyperlane.
              A bond is required and will be locked until the dispute is resolved.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-12 rounded-lg border bg-card">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h4 className="text-lg font-medium mb-2">No Disputes Found</h4>
        <p className="text-sm text-muted-foreground mb-4">
          You haven&apos;t filed any disputes yet
        </p>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          File Your First Dispute
        </Button>
      </div>

      {/* Dispute Tags Reference */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Dispute Types Reference</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(DISPUTE_TAG_INFO).map(([key, info]) => (
            <div key={key} className="p-3 rounded-lg border bg-card">
              <Badge variant="outline" className="mb-2">
                {info.label}
              </Badge>
              <p className="text-xs text-muted-foreground">{info.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
