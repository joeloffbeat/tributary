'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTokenAmount, formatUSDC } from '@/lib/utils'
import { useOrderBook } from './hooks/use-order-book'
import type { Address } from 'viem'
import type { OrderBookEntry } from './types'

interface OrderBookProps {
  tokenAddress: Address
  onPriceClick?: (price: bigint, side: 'buy' | 'sell') => void
}

export function OrderBook({ tokenAddress, onPriceClick }: OrderBookProps) {
  const { asks, bids, midPrice, spread, isLoading } = useOrderBook(tokenAddress)

  // Calculate max depth for bar scaling
  const maxDepth = useMemo(() => {
    const allAmounts = [...asks, ...bids].map((e) => e.totalAmount)
    return allAmounts.length > 0 ? allAmounts.reduce((a, b) => (a > b ? a : b)) : 1n
  }, [asks, bids])

  if (isLoading) {
    return <OrderBookSkeleton />
  }

  return (
    <Card className="bg-river-800/50 border-river-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-tributary-400" />
            Order Book
          </CardTitle>
          {midPrice && (
            <div className="text-right">
              <p className="text-xs text-river-400">Mid Price</p>
              <p className="font-mono font-medium text-tributary-400">
                {formatUSDC(midPrice)}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {/* Column Headers */}
        <div className="grid grid-cols-3 text-xs text-river-500 pb-2 border-b border-river-700">
          <span>Price (USDC)</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks (Sell Orders) - Sorted high to low */}
        <div className="space-y-0.5 max-h-40 overflow-y-auto">
          {asks
            .slice(0, 8)
            .reverse()
            .map((entry, idx) => (
              <OrderBookRow
                key={`ask-${idx}`}
                entry={entry}
                side="sell"
                maxDepth={maxDepth}
                onClick={() => onPriceClick?.(entry.price, 'buy')}
              />
            ))}
        </div>

        {/* Spread Indicator */}
        {spread !== undefined && midPrice !== undefined && (
          <div className="py-2 border-y border-river-700 flex items-center justify-center gap-2">
            <span className="text-xs text-river-500">Spread:</span>
            <span className="text-xs font-mono text-river-300">
              {formatUSDC(spread)} (
              {((Number(spread) / Number(midPrice || 1n)) * 100).toFixed(2)}%)
            </span>
          </div>
        )}

        {/* Bids (Buy Orders) - Sorted high to low */}
        <div className="space-y-0.5 max-h-40 overflow-y-auto">
          {bids.slice(0, 8).map((entry, idx) => (
            <OrderBookRow
              key={`bid-${idx}`}
              entry={entry}
              side="buy"
              maxDepth={maxDepth}
              onClick={() => onPriceClick?.(entry.price, 'sell')}
            />
          ))}
        </div>

        {/* Empty State */}
        {asks.length === 0 && bids.length === 0 && (
          <div className="text-center py-8 text-river-500">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No orders yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface OrderBookRowProps {
  entry: OrderBookEntry
  side: 'buy' | 'sell'
  maxDepth: bigint
  onClick?: () => void
}

function OrderBookRow({ entry, side, maxDepth, onClick }: OrderBookRowProps) {
  const depthPercentage = Number((entry.totalAmount * 100n) / maxDepth)
  const isBuy = side === 'buy'

  return (
    <motion.div
      initial={{ opacity: 0, x: isBuy ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative grid grid-cols-3 text-sm py-1.5 cursor-pointer hover:bg-river-700/30 rounded transition-colors"
      onClick={onClick}
    >
      {/* Depth Bar Background */}
      <div
        className={`absolute inset-y-0 ${isBuy ? 'left-0' : 'right-0'} ${
          isBuy ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}
        style={{ width: `${Math.min(depthPercentage, 100)}%` }}
      />

      {/* Content */}
      <span className={`relative font-mono ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
        {formatUSDC(entry.price)}
      </span>
      <span className="relative text-right font-mono text-river-300">
        {formatTokenAmount(entry.totalAmount)}
      </span>
      <span className="relative text-right font-mono text-river-400">
        {formatUSDC((entry.totalAmount * entry.price) / BigInt(1e18))}
      </span>
    </motion.div>
  )
}

function OrderBookSkeleton() {
  return (
    <Card className="bg-river-800/50 border-river-700">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}
