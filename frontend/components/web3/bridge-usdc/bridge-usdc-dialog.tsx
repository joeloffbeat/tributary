'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatUnits, parseUnits } from 'viem'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  ArrowRight,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeftRight,
  Circle,
} from 'lucide-react'
import { useSwitchChain } from '@/lib/web3'
import { useBridgeUsdc } from './hooks/use-bridge-usdc'
import { USDC_CHAINS, CIRCLE_FAUCET_URL, getDestinationChains, getUsdcChainConfig } from './constants'
import type { UsdcChainConfig, BridgeStep } from './types'
import { BRIDGE_STEPS } from './types'

interface BridgeUsdcDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BridgeUsdcDialog({ open, onOpenChange }: BridgeUsdcDialogProps) {
  const {
    bridgeState,
    quote,
    isLoadingQuote,
    currentChainId,
    address,
    getUsdcBalance,
    formatUsdcBalance,
    getQuote,
    executeBridge,
    resetBridge,
  } = useBridgeUsdc()

  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()

  // Form state
  const [sourceChain, setSourceChain] = useState<UsdcChainConfig | null>(null)
  const [destChain, setDestChain] = useState<UsdcChainConfig | null>(null)
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState<bigint>(0n)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Auto-select source chain based on connected chain
  useEffect(() => {
    if (currentChainId && open) {
      const chain = USDC_CHAINS.find((c) => c.chainId === currentChainId)
      if (chain) {
        setSourceChain(chain)
        // Auto-select first destination
        const destinations = getDestinationChains(currentChainId)
        if (destinations.length > 0 && !destChain) {
          setDestChain(destinations[0])
        }
      }
    }
  }, [currentChainId, open, destChain])

  // Handle source chain selection - switch network automatically
  const handleSourceChainSelect = useCallback(async (chainId: number) => {
    const chain = USDC_CHAINS.find((c) => c.chainId === chainId)
    if (!chain) return

    setSourceChain(chain)

    // Switch network if different from current
    if (currentChainId !== chainId) {
      try {
        await switchChain(chainId)
      } catch (error) {
        console.error('Failed to switch chain:', error)
      }
    }

    // Update destination if same as new source
    if (destChain?.chainId === chainId) {
      const destinations = getDestinationChains(chainId)
      if (destinations.length > 0) {
        setDestChain(destinations[0])
      }
    }
  }, [currentChainId, destChain, switchChain])

  // Load balance when source chain changes
  useEffect(() => {
    const loadBalance = async () => {
      if (!sourceChain || !address) {
        setBalance(0n)
        return
      }
      setIsLoadingBalance(true)
      const bal = await getUsdcBalance(sourceChain.chainId, address)
      setBalance(bal)
      setIsLoadingBalance(false)
    }
    loadBalance()
  }, [sourceChain, address, getUsdcBalance])

  // Fetch quote when amount/chains change
  useEffect(() => {
    if (sourceChain && destChain && amount && parseFloat(amount) > 0) {
      getQuote(sourceChain.chainId, destChain.chainId, amount)
    }
  }, [sourceChain, destChain, amount, getQuote])

  // Handle swap chains - also switches network
  const handleSwapChains = useCallback(async () => {
    if (sourceChain && destChain) {
      const newSource = destChain
      const newDest = sourceChain
      setSourceChain(newSource)
      setDestChain(newDest)

      // Switch network to new source
      if (currentChainId !== newSource.chainId) {
        try {
          await switchChain(newSource.chainId)
        } catch (error) {
          console.error('Failed to switch chain:', error)
        }
      }
    }
  }, [sourceChain, destChain, currentChainId, switchChain])

  // Handle max button
  const handleMax = useCallback(() => {
    setAmount(formatUsdcBalance(balance))
  }, [balance, formatUsdcBalance])

  // Handle bridge
  const handleBridge = async () => {
    if (!sourceChain || !destChain || !amount) return
    await executeBridge(sourceChain.chainId, destChain.chainId, amount)
  }

  // Reset on close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetBridge()
      setAmount('')
    }
    onOpenChange(newOpen)
  }

  // Check if user is on Sepolia without USDC
  const isOnSepoliaWithoutUsdc =
    sourceChain?.chainId === 11155111 && balance === 0n

  // Validation
  const amountBigInt = amount ? parseUnits(amount, 6) : 0n
  const hasInsufficientBalance = amountBigInt > balance
  const isBridging = bridgeState.step !== 'idle' && bridgeState.step !== 'complete' && bridgeState.step !== 'error'
  const canBridge =
    sourceChain &&
    destChain &&
    amount &&
    parseFloat(amount) > 0 &&
    !hasInsufficientBalance &&
    currentChainId === sourceChain.chainId &&
    bridgeState.step === 'idle'

  // Get status message
  const getStatusMessage = (): string => {
    switch (bridgeState.step) {
      case 'approving':
        return 'Approving USDC spend...'
      case 'sending':
        return 'Sending to bridge...'
      case 'confirming':
        return 'Confirming source transaction...'
      case 'waiting_relay':
        return 'Waiting for relay (auto-fallback in 15s)...'
      case 'processing':
        return 'Processing on destination chain...'
      case 'confirming_dest':
        return 'Confirming destination transaction...'
      case 'complete':
        return 'Bridge complete! USDC received.'
      case 'error':
        return bridgeState.error || 'Bridge failed'
      default:
        return ''
    }
  }

  // Get progress percentage
  const getProgressPercent = (): number => {
    if (bridgeState.step === 'idle') return 0
    if (bridgeState.step === 'complete') return 100
    if (bridgeState.step === 'error') return 0
    return (bridgeState.currentStepIndex / bridgeState.totalSteps) * 100
  }

  // Get destination chain explorer URL for dest tx
  const getDestExplorerUrl = (): string | null => {
    if (!destChain || !bridgeState.destTxHash) return null
    return `${destChain.explorerUrl}/tx/${bridgeState.destTxHash}`
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Bridge USDC
          </DialogTitle>
          <DialogDescription>
            Bridge USDC between testnets using Hyperlane
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Chain Selection */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
            <div className="space-y-2">
              <Label>From</Label>
              <Select
                value={sourceChain?.chainId.toString()}
                onValueChange={(val) => handleSourceChainSelect(parseInt(val))}
                disabled={isSwitchingChain}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {USDC_CHAINS.map((chain) => (
                    <SelectItem
                      key={chain.chainId}
                      value={chain.chainId.toString()}
                      disabled={chain.chainId === destChain?.chainId}
                    >
                      {chain.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapChains}
              className="mb-0.5"
              disabled={!sourceChain || !destChain || isSwitchingChain}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <Label>To</Label>
              <Select
                value={destChain?.chainId.toString()}
                onValueChange={(val) => {
                  const chain = USDC_CHAINS.find((c) => c.chainId === parseInt(val))
                  setDestChain(chain || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {USDC_CHAINS.filter((c) => c.chainId !== sourceChain?.chainId).map(
                    (chain) => (
                      <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
                        {chain.displayName}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Amount</Label>
              <div className="text-sm text-muted-foreground">
                Balance:{' '}
                {isLoadingBalance ? (
                  <Skeleton className="inline-block h-4 w-16" />
                ) : (
                  <span className="font-mono">
                    {parseFloat(formatUsdcBalance(balance)).toFixed(2)} USDC
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono"
              />
              <Button variant="outline" size="sm" onClick={handleMax}>
                Max
              </Button>
            </div>
            {hasInsufficientBalance && amount && (
              <p className="text-sm text-destructive">Insufficient balance</p>
            )}
          </div>

          {/* Faucet Alert for Sepolia */}
          {isOnSepoliaWithoutUsdc && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Get testnet USDC from Circle faucet</span>
                <Button variant="link" size="sm" asChild className="p-0 h-auto">
                  <a
                    href={CIRCLE_FAUCET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Get USDC <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Quote Display */}
          {isLoadingQuote && (
            <div className="p-4 border rounded-lg space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          )}

          {quote && !isLoadingQuote && (
            <div className="p-4 border rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">You receive</span>
                <span className="font-mono font-medium">
                  {formatUnits(quote.outputAmount, 6)} USDC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interchain gas</span>
                <span className="font-mono">
                  {quote.interchainGasFee === 0n
                    ? 'Free'
                    : `${formatUnits(quote.interchainGasFee, 18)} ETH`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. time</span>
                <span>~{quote.estimatedTime}s</span>
              </div>
            </div>
          )}

          {/* Multi-Step Progress Display */}
          {bridgeState.step !== 'idle' && (
            <div className="space-y-4 p-4 border rounded-lg">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {bridgeState.step === 'complete' ? 'Complete' : bridgeState.step === 'error' ? 'Failed' : `Step ${bridgeState.currentStepIndex}/${bridgeState.totalSteps}`}
                  </span>
                </div>
                <Progress value={getProgressPercent()} className="h-2" />
              </div>

              {/* Step indicators */}
              <div className="space-y-2">
                {BRIDGE_STEPS.map((s, i) => {
                  const stepIndex = i + 1
                  const isActive = bridgeState.step === s.step
                  const isCompleted = bridgeState.currentStepIndex > stepIndex || bridgeState.step === 'complete'
                  const isPending = bridgeState.currentStepIndex < stepIndex && bridgeState.step !== 'complete' && bridgeState.step !== 'error'

                  return (
                    <div key={s.step} className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={`text-sm ${isActive ? 'font-medium text-foreground' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Current status message */}
              <Alert variant={bridgeState.step === 'error' ? 'destructive' : bridgeState.step === 'complete' ? 'default' : 'default'}>
                {bridgeState.step === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : bridgeState.step === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <AlertDescription>
                  <div className="flex flex-col gap-2">
                    <span>{getStatusMessage()}</span>
                    <div className="flex flex-wrap gap-2">
                      {bridgeState.sourceTxHash && sourceChain && (
                        <a
                          href={`${sourceChain.explorerUrl}/tx/${bridgeState.sourceTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Source TX <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {bridgeState.destTxHash && destChain && (
                        <a
                          href={`${destChain.explorerUrl}/tx/${bridgeState.destTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Dest TX <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Chain Switching Indicator */}
          {isSwitchingChain && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Switching to {sourceChain?.displayName}...
              </AlertDescription>
            </Alert>
          )}

          {/* Wrong Network Warning */}
          {sourceChain && currentChainId !== sourceChain.chainId && !isSwitchingChain && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Please switch to {sourceChain.displayName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => switchChain(sourceChain.chainId)}
                  className="ml-2"
                >
                  Switch Network
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Bridge Button */}
          <Button
            className="w-full"
            onClick={bridgeState.step === 'complete' || bridgeState.step === 'error' ? resetBridge : handleBridge}
            disabled={!canBridge && bridgeState.step !== 'complete' && bridgeState.step !== 'error'}
            variant={bridgeState.step === 'error' ? 'outline' : 'default'}
          >
            {isBridging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bridging...
              </>
            ) : bridgeState.step === 'complete' ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Bridge Again
              </>
            ) : bridgeState.step === 'error' ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Try Again
              </>
            ) : (
              <>
                Bridge USDC
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
