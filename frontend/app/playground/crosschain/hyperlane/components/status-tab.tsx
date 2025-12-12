'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Activity, ArrowLeftRight, MessageSquare, Wallet, RefreshCw, ExternalLink, Radio, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import { getChainDisplayName, formatTimestamp, formatTimeAgo } from '../utils'
import type { TrackedMessage } from '../types'

interface StatusTabProps {
  trackedMessages: TrackedMessage[]
  refreshStatuses: () => Promise<void>
  addManualMessage: (messageId: string) => void
  isPolling?: boolean
}

export function StatusTab({ trackedMessages, refreshStatuses, addManualMessage, isPolling }: StatusTabProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [manualMessageId, setManualMessageId] = useState('')
  const pendingCount = trackedMessages.filter(m => m.status === 'pending').length

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshStatuses()
    setIsRefreshing(false)
  }

  const handleAddManual = () => {
    addManualMessage(manualMessageId)
    setManualMessageId('')
  }

  const getStatusBadge = (status: TrackedMessage['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>
      case 'delivered': return <Badge className="bg-green-500">Delivered</Badge>
      case 'failed': return <Badge variant="destructive">Failed</Badge>
    }
  }

  const getTypeIcon = (type: TrackedMessage['type']) => {
    switch (type) {
      case 'bridge': return <ArrowLeftRight className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'ica': return <Wallet className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Message Status</CardTitle>
            <CardDescription className="flex items-center gap-2">
              Track cross-chain message delivery
              {isPolling && pendingCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-orange-500 animate-pulse">
                  <Radio className="h-3 w-3" />
                  Live ({pendingCount} pending)
                </span>
              )}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manual Message ID Input */}
        <div className="flex gap-2">
          <Input placeholder="Enter message ID (0x...)" value={manualMessageId} onChange={(e) => setManualMessageId(e.target.value)} />
          <Button onClick={handleAddManual} disabled={!manualMessageId}>Track</Button>
        </div>

        {/* Messages List */}
        {trackedMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No messages tracked yet</p>
            <p className="text-sm">Bridge tokens, send messages, or execute ICA calls to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trackedMessages.map((msg, idx) => (
              <div key={`${msg.messageId}-${idx}`} className={cn("p-3 bg-muted rounded-lg space-y-2", msg.status === 'pending' && isPolling && "ring-1 ring-orange-500/30")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(msg.type)}
                    <span className="text-sm font-medium">{msg.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {msg.status === 'pending' && isPolling && (
                      <RefreshCw className="h-3 w-3 animate-spin text-orange-500" />
                    )}
                    {getStatusBadge(msg.status)}
                  </div>
                </div>
                {msg.body && (
                  <div className="p-2 bg-background rounded text-sm">
                    <span className="text-muted-foreground text-xs">Message: </span>
                    <span className="break-all">{msg.body}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Message ID:</span>
                    <code className="truncate max-w-[200px]">{msg.messageId.slice(0, 20)}...</code>
                  </div>
                  {msg.originChainId > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Route:</span>
                      <span>{getChainDisplayName(msg.originChainId)} → {getChainDisplayName(msg.destinationChainId)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Sent:</span>
                    <span>{formatTimestamp(msg.timestamp)}</span>
                  </div>
                  {msg.lastChecked && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Last checked:</span>
                      <span>{formatTimeAgo(msg.lastChecked)}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  {msg.originTxHash && (
                    <a href={hyperlaneService.getExplorerUrl(msg.messageId)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      Hyperlane Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {msg.destinationTxHash && (
                    <span className="text-xs text-green-500">Delivered</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
