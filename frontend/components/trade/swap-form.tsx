'use client'

import { useState } from 'react'
import { ArrowDownUp, Loader2, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { useAccount } from '@/lib/web3'
import { useSwapQuote, useSwap, SwapResult } from '@/hooks/use-swap'
import { formatNumber } from '@/lib/utils'
import { Pool } from '@/hooks/use-pool'

interface SwapFormProps {
  pool: Pool
}

type SwapStatus =
  | { type: 'idle' }
  | { type: 'success'; hash: string }
  | { type: 'error'; message: string }

export function SwapForm({ pool }: SwapFormProps) {
  const { isConnected } = useAccount()
  const [isBuy, setIsBuy] = useState(true)
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<SwapStatus>({ type: 'idle' })

  const { data: quote, isLoading: quoteLoading } = useSwapQuote(
    pool.id,
    isBuy,
    amount
  )
  const { mutate: executeSwap, isPending } = useSwap()

  const handleSwap = () => {
    if (!amount || !quote) return
    setStatus({ type: 'idle' })

    executeSwap(
      {
        poolId: pool.id,
        isBuy,
        amount,
        minOut: (parseFloat(quote.amountOut) * 0.95).toString(), // 5% slippage
      },
      {
        onSuccess: (result: SwapResult) => {
          setStatus({ type: 'success', hash: result.hash! })
          setAmount('')
        },
        onError: (error: Error) => {
          // Parse error message to be more user-friendly
          let message = error.message
          if (message.includes('User rejected')) {
            message = 'Transaction rejected by user'
          } else if (message.includes('insufficient funds')) {
            message = 'Insufficient balance for transaction'
          } else if (message.includes('execution reverted')) {
            message = 'Transaction failed: insufficient liquidity or slippage too low'
          } else if (message.length > 100) {
            message = message.slice(0, 100) + '...'
          }
          setStatus({ type: 'error', message })
        },
      }
    )
  }

  const price = parseFloat(pool.reserveQuote) / 10000
  const explorerUrl = `https://sepolia.mantlescan.xyz/tx/`

  return (
    <div className="card-premium p-6">
      <h2 className="font-title text-2xl mb-6">Swap</h2>

      {/* Toggle */}
      <div className="flex mb-6">
        <button
          onClick={() => {
            setIsBuy(true)
            setStatus({ type: 'idle' })
          }}
          className={`flex-1 py-3 font-body text-sm transition-colors rounded-l ${
            isBuy
              ? 'bg-tributary text-white'
              : 'bg-cream-dark text-text-secondary'
          }`}
        >
          BUY
        </button>
        <button
          onClick={() => {
            setIsBuy(false)
            setStatus({ type: 'idle' })
          }}
          className={`flex-1 py-3 font-body text-sm transition-colors rounded-r ${
            !isBuy
              ? 'bg-tributary text-white'
              : 'bg-cream-dark text-text-secondary'
          }`}
        >
          SELL
        </button>
      </div>

      {/* Input */}
      <div className="space-y-4">
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            {isBuy ? 'YOU PAY' : 'YOU SELL'}
          </label>
          <div className="flex">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setStatus({ type: 'idle' })
              }}
              className="input-premium flex-1 rounded-r-none"
            />
            <div className="bg-cream-dark px-4 flex items-center rounded-r font-body text-sm">
              {isBuy ? 'USDT' : pool.token.symbol}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsBuy(!isBuy)}
            className="p-2 bg-cream-dark rounded-full hover:bg-cream-dark/70"
          >
            <ArrowDownUp className="h-4 w-4 text-text-muted" />
          </button>
        </div>

        {/* Output */}
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            YOU RECEIVE
          </label>
          <div className="flex">
            <div className="input-premium flex-1 rounded-r-none bg-cream-dark/50 flex items-center">
              {quoteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                quote?.amountOut || '0.00'
              )}
            </div>
            <div className="bg-cream-dark px-4 flex items-center rounded-r font-body text-sm">
              {isBuy ? pool.token.symbol : 'USDT'}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      {quote && amount && (
        <div className="mt-4 p-3 bg-cream-dark/50 rounded space-y-2">
          <div className="flex justify-between font-body text-xs">
            <span className="text-text-muted">PRICE</span>
            <span>${price.toFixed(4)}</span>
          </div>
          <div className="flex justify-between font-body text-xs">
            <span className="text-text-muted">FEE ({(parseInt(pool.vault?.tradingFeeBps || '100') / 100).toFixed(1)}%)</span>
            <span>${formatNumber(quote.fee)}</span>
          </div>
          <div className="flex justify-between font-body text-xs">
            <span className="text-text-muted">PRICE IMPACT</span>
            <span className={quote.priceImpact > 2 ? 'text-red-500' : ''}>
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Status Message */}
      {status.type === 'success' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="font-body text-sm">Swap successful!</span>
          </div>
          <a
            href={`${explorerUrl}${status.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-green-700 hover:text-green-800 font-body text-sm"
          >
            View TX
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {status.type === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="font-body text-sm text-red-700">{status.message}</span>
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleSwap}
        disabled={!isConnected || !amount || isPending || !quote}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isConnected ? 'CONNECT WALLET' : isPending ? 'SWAPPING...' : 'SWAP'}
      </button>
    </div>
  )
}
