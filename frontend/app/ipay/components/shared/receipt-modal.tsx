'use client'

import { useState } from 'react'
import { CheckCircle, Copy, ExternalLink, Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { PriceDisplay } from './price-display'
import type { UsageReceipt, IPListing } from '../../types'

interface ReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: UsageReceipt | null
  listing: IPListing | null
}

export function ReceiptModal({ open, onOpenChange, receipt, listing }: ReceiptModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!receipt || !listing) return null

  const ipfsUrl = `https://ipfs.io/ipfs/${listing.assetIpfsHash}`
  const txUrl = `https://testnet.snowtrace.io/tx/${receipt.paymentTxHash}`

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <DialogTitle className="text-center">Payment Successful!</DialogTitle>
          <DialogDescription className="text-center">
            You now have access to this IP asset
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Asset Info */}
          <div className="p-4 rounded-lg bg-muted">
            <h4 className="font-medium mb-2">{listing.title}</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <PriceDisplay amount={receipt.amount} className="text-green-500" />
            </div>
          </div>

          {/* IPFS Asset URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Asset URL</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 rounded bg-muted text-xs font-mono truncate">
                {ipfsUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copyToClipboard(ipfsUrl, 'ipfs')}
              >
                {copiedField === 'ipfs' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => window.open(ipfsUrl, '_blank')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Hash</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 rounded bg-muted text-xs font-mono truncate">
                {receipt.paymentTxHash}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copyToClipboard(receipt.paymentTxHash, 'tx')}
              >
                {copiedField === 'tx' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => window.open(txUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Receipt ID */}
          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Receipt ID</span>
            <span className="font-mono">{receipt.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span>{new Date(receipt.timestamp * 1000).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            className="flex-1"
            onClick={() => window.open(ipfsUrl, '_blank')}
          >
            <Download className="mr-2 h-4 w-4" />
            Access Asset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReceiptModal
