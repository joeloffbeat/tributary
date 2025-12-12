'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, AlertCircle, ArrowLeftRight, MessageSquare, Send, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import { TransactionDialog } from '@/components/web3/transactions/transaction-dialog'
import { ChainSelect, CopyButton, CrosschainProgress } from './shared'
import { useHyperlaneMessage } from '../hooks'
import type { ChainSelectOption, TrackedMessage, HyperlaneMode } from '../types'

interface MessageTabProps {
  supportedChains: ChainSelectOption[]
  sourceChain: ChainSelectOption | null
  destChain: ChainSelectOption | null
  setSourceChain: (chain: ChainSelectOption | null) => void
  setDestChain: (chain: ChainSelectOption | null) => void
  isLoadingChains: boolean
  handleSwapChains: () => void
  needsChainSwitch: boolean
  switchChain?: (chainId: number) => void
  trackMessage: (message: TrackedMessage) => void
  hyperlaneMode: HyperlaneMode
}

export function MessageTab({
  supportedChains,
  sourceChain,
  destChain,
  setSourceChain,
  setDestChain,
  isLoadingChains,
  handleSwapChains,
  needsChainSwitch,
  switchChain,
  trackMessage,
  hyperlaneMode,
}: MessageTabProps) {
  const {
    message,
    setMessage,
    isSending,
    sendError,
    gasFee,
    isLoadingFee,
    lastReceived,
    isLoadingReceived,
    loadLastReceived,
    txDialogOpen,
    setTxDialogOpen,
    txParams,
    testRecipientAddress,
    canSend,
    handleSend,
    handleTxSuccess,
    handleTxError,
    // Progress state
    showProgress,
    progressSteps,
    progressMessageId,
    progressOriginTxHash,
    handleCloseProgress,
    publicClient,
  } = useHyperlaneMessage({ sourceChain, destChain, trackMessage, hyperlaneMode })

  // If progress is showing, render the progress UI
  if (showProgress && sourceChain && destChain) {
    return (
      <CrosschainProgress
        originChainId={sourceChain.chainId}
        destinationChainId={destChain.chainId}
        messageId={progressMessageId}
        originTxHash={progressOriginTxHash}
        steps={progressSteps}
        onClose={handleCloseProgress}
        onRetry={handleSend}
        hyperlaneMode={hyperlaneMode}
        publicClient={publicClient}
      />
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Cross-Chain Messaging
        </CardTitle>
        <CardDescription>Send arbitrary messages between chains via Hyperlane Mailbox</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chain Selection */}
        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">From</label>
            <ChainSelect
              chains={supportedChains}
              selectedChain={sourceChain}
              onSelect={(chain) => {
                setSourceChain(chain)
                switchChain?.(chain.chainId)
              }}
              isLoading={isLoadingChains}
              excludeChainId={destChain?.chainId}
            />
          </div>
          <div className="pt-6">
            <Button variant="ghost" size="icon" onClick={handleSwapChains} className="rounded-full border" disabled={!sourceChain || !destChain}>
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">To</label>
            <ChainSelect chains={supportedChains} selectedChain={destChain} onSelect={setDestChain} isLoading={isLoadingChains} excludeChainId={sourceChain?.chainId} />
          </div>
        </div>

        {/* Recipient Info */}
        {testRecipientAddress && (
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recipient (TestRecipient)</span>
              <CopyButton text={testRecipientAddress} />
            </div>
            <code className="text-xs break-all">{testRecipientAddress}</code>
          </div>
        )}

        {!testRecipientAddress && destChain && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No TestRecipient deployed on {destChain.name}</AlertDescription>
          </Alert>
        )}

        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <Textarea placeholder="Enter your cross-chain message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
        </div>

        {/* Fee Info */}
        {gasFee !== null && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Interchain Gas Fee</span>
              {isLoadingFee ? <Skeleton className="h-4 w-20" /> : gasFee === 0n ? <span className="text-green-500">Free (MerkleTreeHook)</span> : <span>{hyperlaneService.formatGasFee(gasFee)} ETH</span>}
            </div>
          </div>
        )}

        {sendError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{sendError}</AlertDescription></Alert>}

        {/* Send Button */}
        {needsChainSwitch ? (
          <Button className="w-full h-12" onClick={() => sourceChain && switchChain?.(sourceChain.chainId)}>Switch to {sourceChain?.name}</Button>
        ) : (
          <Button className="w-full h-12" onClick={handleSend} disabled={!canSend || isSending}>
            {isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : <><Send className="mr-2 h-4 w-4" />Send Message</>}
          </Button>
        )}

        {/* Last Received */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Last Received on {destChain?.name || 'Destination'}</h4>
            <Button variant="ghost" size="sm" onClick={loadLastReceived} disabled={isLoadingReceived || !destChain}>
              <RefreshCw className={cn('h-4 w-4', isLoadingReceived && 'animate-spin')} />
            </Button>
          </div>
          {lastReceived ? (
            <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
              <div><span className="text-muted-foreground">Sender: </span><code className="text-xs">{lastReceived.sender.slice(0, 20)}...</code></div>
              <div><span className="text-muted-foreground">Message: </span><span>{lastReceived.data || '(empty)'}</span></div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click refresh to load the last received message.</p>
          )}
        </div>

        {txParams && sourceChain && <TransactionDialog open={txDialogOpen} onOpenChange={setTxDialogOpen} params={txParams} chainId={sourceChain.chainId} onSuccess={handleTxSuccess} onError={handleTxError} />}
      </CardContent>
    </Card>
  )
}
