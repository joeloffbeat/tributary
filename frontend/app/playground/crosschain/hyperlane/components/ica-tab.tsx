'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, AlertCircle, ArrowRight, Wallet } from 'lucide-react'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import { TransactionDialog } from '@/components/web3/transactions/transaction-dialog'
import { ChainSelect, CopyButton, AvailableICANetworks, CrosschainProgress } from './shared'
import { useHyperlaneICA } from '../hooks'
import type { ChainSelectOption, TrackedMessage, HyperlaneMode } from '../types'

interface ICATabProps {
  supportedChains: ChainSelectOption[]
  sourceChain: ChainSelectOption | null
  destChain: ChainSelectOption | null
  setSourceChain: (chain: ChainSelectOption | null) => void
  setDestChain: (chain: ChainSelectOption | null) => void
  isLoadingChains: boolean
  needsChainSwitch: boolean
  switchChain?: (chainId: number) => void
  trackMessage: (message: TrackedMessage) => void
  hyperlaneMode: HyperlaneMode
}

export function ICATab({
  supportedChains,
  sourceChain,
  destChain,
  setSourceChain,
  setDestChain,
  isLoadingChains,
  needsChainSwitch,
  switchChain,
  trackMessage,
  hyperlaneMode,
}: ICATabProps) {
  const {
    remoteICA,
    isLoadingICA,
    targetAddress,
    setTargetAddress,
    callData,
    setCallData,
    callValue,
    setCallValue,
    isExecuting,
    executeError,
    gasFee,
    hasICARouter,
    txDialogOpen,
    setTxDialogOpen,
    txParams,
    canExecute,
    handleExecute,
    handleTxSuccess,
    handleTxError,
    // Progress state
    showProgress,
    progressSteps,
    progressMessageId,
    progressOriginTxHash,
    handleCloseProgress,
    publicClient,
  } = useHyperlaneICA({ sourceChain, destChain, trackMessage, hyperlaneMode })

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
        onRetry={handleExecute}
        hyperlaneMode={hyperlaneMode}
        publicClient={publicClient}
      />
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Interchain Accounts
        </CardTitle>
        <CardDescription>Execute transactions on remote chains using your Interchain Account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chain Selection */}
        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Execute From</label>
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
          <div className="pt-6"><ArrowRight className="h-4 w-4 text-muted-foreground" /></div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">On Chain</label>
            <ChainSelect chains={supportedChains} selectedChain={destChain} onSelect={setDestChain} isLoading={isLoadingChains} excludeChainId={sourceChain?.chainId} />
          </div>
        </div>

        {!hasICARouter && sourceChain && (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No ICA Router deployed on {sourceChain.name}</AlertDescription>
            </Alert>

            {/* Available ICA Networks */}
            <AvailableICANetworks
              hyperlaneMode={hyperlaneMode}
              currentChainId={sourceChain.chainId}
              switchChain={switchChain}
            />
          </>
        )}

        {/* ICA Address */}
        {hasICARouter && (
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your ICA on {destChain?.name || '...'}</span>
              {remoteICA && <CopyButton text={remoteICA} />}
            </div>
            {isLoadingICA ? (
              <Skeleton className="h-4 w-full" />
            ) : remoteICA ? (
              <code className="text-xs break-all">{remoteICA}</code>
            ) : sourceChain && destChain ? (
              <span className="text-xs text-amber-500">ICA route not available between these chains</span>
            ) : (
              <span className="text-xs text-muted-foreground">Select destination chain</span>
            )}
          </div>
        )}

        {hasICARouter && sourceChain && destChain && !isLoadingICA && !remoteICA && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>ICA route not configured between {sourceChain.name} and {destChain.name}.</AlertDescription>
          </Alert>
        )}

        {/* Call Parameters */}
        {hasICARouter && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Contract Address</label>
              <Input placeholder="0x..." value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Call Data (hex, optional)</label>
              <Input placeholder="0x..." value={callData} onChange={(e) => setCallData(e.target.value)} />
              <p className="text-xs text-muted-foreground">Leave empty for simple value transfer</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Value (ETH, optional)</label>
              <Input type="number" placeholder="0.0" value={callValue} onChange={(e) => setCallValue(e.target.value)} step="any" min="0" />
            </div>

            {gasFee && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Interchain Gas Fee</span>
                  <span>{hyperlaneService.formatGasFee(gasFee)} ETH</span>
                </div>
              </div>
            )}
          </>
        )}

        {executeError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{executeError}</AlertDescription></Alert>}

        {/* Execute Button */}
        {needsChainSwitch ? (
          <Button className="w-full h-12" onClick={() => sourceChain && switchChain?.(sourceChain.chainId)}>Switch to {sourceChain?.name}</Button>
        ) : (
          <Button className="w-full h-12" onClick={handleExecute} disabled={!canExecute || isExecuting}>
            {isExecuting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Executing...</> : 'Execute Remote Call'}
          </Button>
        )}

        {txParams && sourceChain && <TransactionDialog open={txDialogOpen} onOpenChange={setTxDialogOpen} params={txParams} chainId={sourceChain.chainId} onSuccess={handleTxSuccess} onError={handleTxError} />}
      </CardContent>
    </Card>
  )
}
