'use client'

import { useState } from 'react'
import { ArrowDownUp, Loader2 } from 'lucide-react'
import { useAccount } from '@/lib/web3'
import { useSwapQuote, useSwap } from '@/hooks/use-swap'
import { formatNumber } from '@/lib/utils'
import { Pool } from '@/hooks/use-pool'

interface SwapFormProps {
  pool: Pool
}

export function SwapForm({ pool }: SwapFormProps) {
  const { isConnected } = useAccount()
  const [isBuy, setIsBuy] = useState(true)
  const [amount, setAmount] = useState('')

  const { data: quote, isLoading: quoteLoading } = useSwapQuote(
    pool.id,
    isBuy,
    amount
  )
  const { mutate: executeSwap, isPending } = useSwap()

  const handleSwap = () => {
    if (!amount || !quote) return
    executeSwap({
      poolId: pool.id,
      isBuy,
      amount,
      minOut: (parseFloat(quote.amountOut) * 0.95).toString(), // 5% slippage
    })
  }

  const price = parseFloat(pool.reserveQuote) / 10000

  return (
    <div className="card-premium p-6">
      <h2 className="font-title text-2xl mb-6">Swap</h2>

      {/* Toggle */}
      <div className="flex mb-6">
        <button
          onClick={() => setIsBuy(true)}
          className={`flex-1 py-3 font-body text-sm transition-colors rounded-l ${
            isBuy
              ? 'bg-tributary text-white'
              : 'bg-cream-dark text-text-secondary'
          }`}
        >
          BUY
        </button>
        <button
          onClick={() => setIsBuy(false)}
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
              onChange={(e) => setAmount(e.target.value)}
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

      {/* Button */}
      <button
        onClick={handleSwap}
        disabled={!isConnected || !amount || isPending}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isConnected ? 'CONNECT WALLET' : isPending ? 'SWAPPING...' : 'SWAP'}
      </button>
    </div>
  )
}
