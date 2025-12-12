'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History, ArrowLeftRight, MessageSquare, Wallet, Loader2, XCircle, Trash2, ExternalLink } from 'lucide-react'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import { CopyButton } from './shared'
import { getChainDisplayName, formatTimestamp } from '../utils'
import type { TrackedMessage, HyperlaneMode } from '../types'

interface HistoryTabProps {
  trackedMessages: TrackedMessage[]
  clearHistory: () => void
  removeFromHistory: (messageId: string) => void
  isPolling: boolean
  hyperlaneMode: HyperlaneMode
}

export function HistoryTab({ trackedMessages, clearHistory, removeFromHistory, isPolling, hyperlaneMode }: HistoryTabProps) {
  const getStatusBadge = (status: TrackedMessage['status'], isPending: boolean) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            {isPolling && isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            Pending
          </Badge>
        )
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  const getTypeIcon = (type: TrackedMessage['type']) => {
    switch (type) {
      case 'bridge': return <ArrowLeftRight className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'ica': return <Wallet className="h-4 w-4" />
    }
  }

  const getTypeName = (type: TrackedMessage['type']) => {
    switch (type) {
      case 'bridge': return 'Bridge'
      case 'message': return 'Message'
      case 'ica': return 'ICA Call'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Transaction History</CardTitle>
            <CardDescription>Your cross-chain activity (persisted in browser)</CardDescription>
          </div>
          {trackedMessages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory} className="gap-2"><Trash2 className="h-4 w-4" />Clear All</Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {trackedMessages.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No transaction history yet</p>
            <p className="text-xs text-muted-foreground mt-1">Your cross-chain transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trackedMessages.map((msg, index) => (
              <div key={`${msg.messageId}-${index}`} className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(msg.type)}
                    <span className="font-medium">{getTypeName(msg.type)}</span>
                    {getStatusBadge(msg.status, msg.status === 'pending')}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFromHistory(msg.messageId)} className="h-8 w-8 p-0">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">{msg.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Time: </span><span>{formatTimestamp(msg.timestamp)}</span></div>
                  <div><span className="text-muted-foreground">Route: </span><span>{getChainDisplayName(msg.originChainId)} → {getChainDisplayName(msg.destinationChainId)}</span></div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {msg.originTxHash && (
                    <a href={`https://explorer.hyperlane.xyz/?search=${msg.originTxHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      Origin Tx <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {msg.messageId && msg.messageId !== '0x' && (
                    <a href={hyperlaneService.getExplorerUrl(msg.messageId)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      Hyperlane Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {msg.destinationTxHash && (
                    <a href={`https://explorer.hyperlane.xyz/?search=${msg.destinationTxHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      Destination Tx <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {msg.messageId && msg.messageId !== '0x' && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">{msg.messageId}</code>
                      <CopyButton text={msg.messageId} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
