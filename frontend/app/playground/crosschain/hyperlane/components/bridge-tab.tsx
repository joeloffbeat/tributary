'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, AlertCircle, ArrowLeftRight, Clock } from 'lucide-react'
import { formatUnits } from 'viem'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import { TransactionDialog } from '@/components/web3/transactions/transaction-dialog'
import { ChainSelect, TokenSelect, CrosschainProgress } from './shared'
import { useHyperlaneBridge } from '../hooks'
import { formatTime } from '../utils'
import type { ChainSelectOption, TrackedMessage, HyperlaneMode } from '../types'

interface BridgeTabProps {
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

export function BridgeTab({
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
}: BridgeTabProps) {
  const {
    selectedToken,
    setSelectedToken,
    amount,
    setAmount,
    balance,
    quote,
    isLoadingQuote,
    quoteError,
    bridgeError,
    txDialogOpen,
    setTxDialogOpen,
    txParams,
    needsApproval,
    canBridge,
    handleBridge,
    handleTxSuccess,
    handleTxError,
    // Progress state
    showProgress,
    progressSteps,
    progressMessageId,
    progressOriginTxHash,
    handleCloseProgress,
    publicClient,
  } = useHyperlaneBridge({ sourceChain, destChain, trackMessage, hyperlaneMode })

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
        onRetry={handleBridge}
        hyperlaneMode={hyperlaneMode}
        publicClient={publicClient}
      />
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Token Bridge
        </CardTitle>
        <CardDescription>Transfer tokens across chains via Hyperlane Warp Routes</CardDescription>
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
                setSelectedToken(null)
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

        {/* Token & Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Amount</label>
            {selectedToken && <span className="text-xs text-muted-foreground">Balance: {parseFloat(balance).toFixed(4)} {selectedToken.symbol}</span>}
          </div>
          <div className="flex gap-2">
            <Input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 text-lg h-14" step="any" min="0" />
            <TokenSelect tokens={sourceChain?.tokens || []} selectedToken={selectedToken} onSelect={setSelectedToken} isLoading={isLoadingChains} />
          </div>
          {selectedToken && parseFloat(amount) > parseFloat(balance) && <p className="text-xs text-destructive">Insufficient balance</p>}
        </div>

        <div className="flex justify-center"><ArrowRight className="h-5 w-5 text-muted-foreground" /></div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium">You receive</label>
          <div className="flex gap-2">
            <div className="flex-1 h-14 px-3 flex items-center bg-muted rounded-md">
              {isLoadingQuote ? <Skeleton className="h-6 w-24" /> : quote ? <span className="text-lg">{parseFloat(formatUnits(quote.outputAmount, quote.token.decimals)).toFixed(6)}</span> : <span className="text-muted-foreground">0.0</span>}
            </div>
            <div className="w-36 h-14 px-3 flex items-center justify-center bg-muted rounded-md"><span className="font-medium">{selectedToken?.symbol || 'Token'}</span></div>
          </div>
        </div>

        {/* Quote Info */}
        {quote && selectedToken && (
          <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Estimated Time</span><span className="text-green-500 font-medium">{formatTime(quote.estimatedTime)}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Interchain Gas</span><span>{hyperlaneService.formatGasFee(quote.interchainGasFee)} ETH</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Exchange Rate</span><span>1:1 (No slippage)</span></div>
          </div>
        )}

        {quoteError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{quoteError}</AlertDescription></Alert>}

        {bridgeError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{bridgeError}</AlertDescription></Alert>}

        {/* Bridge Button */}
        {needsChainSwitch ? (
          <Button className="w-full h-14 text-lg" onClick={() => sourceChain && switchChain?.(sourceChain.chainId)}>Switch to {sourceChain?.name}</Button>
        ) : (
          <Button className="w-full h-14 text-lg" onClick={handleBridge} disabled={!canBridge}>
            {!sourceChain || !destChain ? 'Select chains' : !selectedToken ? 'Select token' : !amount || parseFloat(amount) <= 0 ? 'Enter amount' : parseFloat(amount) > parseFloat(balance) ? 'Insufficient balance' : isLoadingQuote ? 'Fetching quote...' : !quote ? 'Unable to get quote' : needsApproval ? 'Approve & Bridge' : 'Bridge'}
          </Button>
        )}

        {txParams && sourceChain && <TransactionDialog open={txDialogOpen} onOpenChange={setTxDialogOpen} params={txParams} chainId={sourceChain.chainId} onSuccess={handleTxSuccess} onError={handleTxError} />}
      </CardContent>
    </Card>
  )
}
