'use client'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react'
import { formatUnits } from 'viem'

interface Trade {
  id: string
  type: 'buy' | 'sell'
  tokenAmount: bigint
  tokenDecimals: number
  pricePerToken: number
  totalValue: number
  trader: string
  timestamp: number
  txHash: string
}

interface TradeHistoryProps {
  trades: Trade[]
  tokenSymbol: string
  isLoading?: boolean
  maxItems?: number
  showPagination?: boolean
  onViewAll?: () => void
  className?: string
}

const formatRelativeTime = (timestamp: number) => {
  const diff = Math.floor((Date.now() - timestamp * 1000) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const formatUsd = (value: number) => value < 1000 ? `$${value.toFixed(2)}` : `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

function TypeBadge({ type }: { type: 'buy' | 'sell' }) {
  const isBuy = type === 'buy'
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
      {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {type.toUpperCase()}
    </span>
  )
}

function TradeRow({ trade, tokenSymbol }: { trade: Trade; tokenSymbol: string }) {
  const amount = parseFloat(formatUnits(trade.tokenAmount, trade.tokenDecimals))
  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
      <td className="py-3 px-2"><TypeBadge type={trade.type} /></td>
      <td className="py-3 px-2 font-mono tabular-nums text-slate-100">{amount.toLocaleString()} {tokenSymbol}</td>
      <td className="py-3 px-2 font-mono tabular-nums text-slate-400">{formatUsd(trade.pricePerToken)}</td>
      <td className="py-3 px-2 font-mono tabular-nums text-slate-100">{formatUsd(trade.totalValue)}</td>
      <td className="py-3 px-2 text-slate-500 text-sm">{formatRelativeTime(trade.timestamp)}</td>
      <td className="py-3 px-2">
        <a href={`https://explorer.story.foundation/tx/${trade.txHash}`} target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-400">
          <ExternalLink className="h-4 w-4" />
        </a>
      </td>
    </tr>
  )
}

function TradeCard({ trade, tokenSymbol }: { trade: Trade; tokenSymbol: string }) {
  const amount = parseFloat(formatUnits(trade.tokenAmount, trade.tokenDecimals))
  return (
    <div className="bg-slate-800/30 rounded-lg p-3 flex flex-col gap-2 animate-fade-in">
      <div className="flex justify-between items-center">
        <TypeBadge type={trade.type} />
        <span className="text-slate-500 text-xs">{formatRelativeTime(trade.timestamp)}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-mono tabular-nums text-slate-100">{amount.toLocaleString()} {tokenSymbol}</span>
        <span className="font-mono tabular-nums text-slate-100">{formatUsd(trade.totalValue)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">@ {formatUsd(trade.pricePerToken)}</span>
        <a href={`https://explorer.story.foundation/tx/${trade.txHash}`} target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-400 inline-flex items-center gap-1">
          View <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="flex gap-4 p-3"><Skeleton className="h-6 w-16 bg-slate-700/50" /><Skeleton className="h-6 w-24 bg-slate-700/50" /><Skeleton className="h-6 w-16 bg-slate-700/50" /><Skeleton className="h-6 w-20 bg-slate-700/50" /></div>
  ))
}

export function TradeHistory({ trades, tokenSymbol, isLoading = false, maxItems = 15, onViewAll, className }: TradeHistoryProps) {
  const displayedTrades = trades.slice(0, maxItems)

  if (isLoading) return <div className={cn('flex flex-col gap-2', className)}><LoadingSkeleton /></div>

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-slate-100 font-medium">Recent Trades</h3>
        {onViewAll && <button onClick={onViewAll} className="text-teal-500 hover:text-teal-400 text-sm">View All</button>}
      </div>
      <ScrollArea className="h-[400px]">
        <table className="w-full hidden md:table">
          <thead><tr className="text-slate-500 text-sm text-left border-b border-slate-700">
            <th className="py-2 px-2 font-medium">Type</th><th className="py-2 px-2 font-medium">Amount</th><th className="py-2 px-2 font-medium">Price</th><th className="py-2 px-2 font-medium">Total</th><th className="py-2 px-2 font-medium">Time</th><th className="py-2 px-2 font-medium"></th>
          </tr></thead>
          <tbody>{displayedTrades.map(trade => <TradeRow key={trade.id} trade={trade} tokenSymbol={tokenSymbol} />)}</tbody>
        </table>
        <div className="flex flex-col gap-2 md:hidden">
          {displayedTrades.map(trade => <TradeCard key={trade.id} trade={trade} tokenSymbol={tokenSymbol} />)}
        </div>
        {displayedTrades.length === 0 && <p className="text-slate-500 text-center py-8">No trades yet</p>}
      </ScrollArea>
    </div>
  )
}
