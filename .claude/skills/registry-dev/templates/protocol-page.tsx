// ============================================================================
// TEMPLATE: Protocol Swap Page
// Replace: PROTOCOL_NAME, imports, service calls
// ============================================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { parseUnits, formatUnits, Address } from 'viem'
// CRITICAL: Always import from abstraction layer, NEVER from wagmi
import {
  useAccount,
  useWalletClient,
  usePublicClient,
  ConnectButton,
} from '@/lib/web3'
import { protocolNameService } from '@/lib/services/PROTOCOL_NAME-service'
import { ROUTER_ADDRESS, DEFAULT_SLIPPAGE } from '@/constants/protocols/PROTOCOL_NAME'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowDown, Loader2 } from 'lucide-react'

export default function ProtocolNameSwapPage() {
  // Wallet state from abstraction layer
  const { address, isConnected, chainId } = useAccount()
  const walletClient = useWalletClient()
  const publicClient = usePublicClient()

  // Form state
  const [tokenIn, setTokenIn] = useState<Address | undefined>()
  const [tokenOut, setTokenOut] = useState<Address | undefined>()
  const [amountIn, setAmountIn] = useState('')
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)

  // Quote state
  const [quote, setQuote] = useState<{
    amountOut: bigint
    estimatedGas: bigint
    priceImpact: number
  } | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  // Transaction state
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

  // Fetch quote with debounce
  const fetchQuote = useCallback(async () => {
    if (!tokenIn || !tokenOut || !amountIn || !chainId) {
      setQuote(null)
      return
    }

    const parsedAmount = parseUnits(amountIn, 18) // TODO: Get actual decimals
    if (parsedAmount === 0n) {
      setQuote(null)
      return
    }

    setQuoteLoading(true)
    setQuoteError(null)

    try {
      const result = await protocolNameService.getQuote({
        tokenIn,
        tokenOut,
        amountIn: parsedAmount,
        chainId,
      })
      setQuote(result)
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : 'Failed to get quote')
      setQuote(null)
    } finally {
      setQuoteLoading(false)
    }
  }, [tokenIn, tokenOut, amountIn, chainId])

  // Debounced quote fetch
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [fetchQuote])

  // Execute swap
  const handleSwap = async () => {
    if (!walletClient || !publicClient || !address || !chainId || !quote) return
    if (!tokenIn || !tokenOut || !amountIn) return

    setTxLoading(true)
    setTxError(null)

    try {
      // 1. Get swap transaction data
      const swapData = await protocolNameService.getSwap({
        tokenIn,
        tokenOut,
        amountIn: parseUnits(amountIn, 18),
        recipient: address,
        slippage,
        chainId,
      })

      // 2. Execute transaction
      const hash = await walletClient.sendTransaction({
        to: swapData.to,
        data: swapData.data,
        value: swapData.value,
      })

      // 3. Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash })

      // 4. Reset form
      setAmountIn('')
      setQuote(null)
    } catch (error) {
      console.error('Swap failed:', error)
      setTxError(error instanceof Error ? error.message : 'Swap failed')
    } finally {
      setTxLoading(false)
    }
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <p className="text-muted-foreground">Connect wallet to swap</p>
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>Swap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token In */}
          <div className="space-y-2">
            <label className="text-sm font-medium">You pay</label>
            <Input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
            />
            {/* TODO: Add token selector */}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Token Out */}
          <div className="space-y-2">
            <label className="text-sm font-medium">You receive</label>
            {quoteLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                type="text"
                placeholder="0.0"
                value={quote ? formatUnits(quote.amountOut, 18) : ''}
                disabled
              />
            )}
            {/* TODO: Add token selector */}
          </div>

          {/* Quote Info */}
          {quote && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span>{quote.priceImpact.toFixed(2)}%</span>
              </div>
            </div>
          )}

          {/* Errors */}
          {(quoteError || txError) && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {quoteError || txError}
            </div>
          )}

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={!quote || txLoading || quoteLoading}
            className="w-full"
          >
            {txLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : quoteLoading ? (
              'Fetching quote...'
            ) : !quote ? (
              'Enter amount'
            ) : (
              'Swap'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
