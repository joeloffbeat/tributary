'use client'

import { motion } from 'framer-motion'
import { ArrowRightLeft, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTokenAmount, formatUSDC, formatAddress } from '@/lib/utils'
import { useRecentTrades } from '../hooks/use-recent-trades'
import type { TradingFilterState } from './trading-filters'

interface RecentTradesProps {
  filters: TradingFilterState
}

export function RecentTrades({ filters }: RecentTradesProps) {
  const { trades, isLoading } = useRecentTrades(filters)

  if (isLoading) return <TradesSkeleton />

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <ArrowRightLeft className="h-12 w-12 text-river-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Recent Trades</h3>
        <p className="text-river-500 text-sm">Trading activity will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {trades.map((trade, idx) => (
        <motion.div
          key={trade.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.03 }}
          className="flex items-center gap-4 p-4 bg-river-800/30 rounded-xl border border-river-700"
        >
          <div className="p-2 bg-tributary-500/10 rounded-lg">
            <ArrowRightLeft className="h-5 w-5 text-tributary-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{trade.tokenSymbol}</Badge>
              <span className="text-sm font-mono">{formatTokenAmount(trade.amount)} tokens</span>
            </div>
            <p className="text-xs text-river-500 mt-1">
              {formatAddress(trade.seller)} → {formatAddress(trade.buyer)}
            </p>
          </div>

          <div className="text-right">
            <p className="font-mono font-medium text-tributary-400">{formatUSDC(trade.totalValue)}</p>
            <p className="text-xs text-river-500">@ {formatUSDC(trade.pricePerToken)}/token</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-river-500">{formatTime(trade.timestamp)}</span>
            <a
              href={`https://sepolia.mantlescan.xyz/tx/${trade.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-river-700/50 rounded transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-river-500" />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function formatTime(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function TradesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  )
}
