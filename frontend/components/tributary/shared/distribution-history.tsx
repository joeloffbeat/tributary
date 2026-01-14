'use client'

import { formatUnits } from 'viem'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Coins, ExternalLink, History } from 'lucide-react'
import { getExplorerLink } from '@/lib/config/chains'
import { cn } from '@/lib/utils'

interface Distribution {
  id: string
  amount: bigint
  tokenDecimals: number
  tokenSymbol: string
  timestamp: number
  txHash: string
  distributor: string
}

interface DistributionHistoryProps {
  distributions: Distribution[]
  chainId: number
  isLoading?: boolean
  emptyMessage?: string
  maxItems?: number
  onViewAll?: () => void
  className?: string
}

function formatRelativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts * 1000) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min${m !== 1 ? 's' : ''} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h !== 1 ? 's' : ''} ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} day${d !== 1 ? 's' : ''} ago`
  return `${Math.floor(d / 30)} month${Math.floor(d / 30) !== 1 ? 's' : ''} ago`
}

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
)

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
    <History className="h-10 w-10 mb-2 opacity-50" />
    <p className="text-sm">{message}</p>
  </div>
)

export function DistributionHistory({
  distributions, chainId, isLoading, emptyMessage = 'No distributions yet',
  maxItems = 10, onViewAll, className,
}: DistributionHistoryProps) {
  const items = distributions.slice(0, maxItems)
  const hasMore = distributions.length > maxItems
  const wrapperClass = cn('rounded-lg bg-card', className)

  if (isLoading) return <div className={cn(wrapperClass, 'p-4')}><LoadingSkeleton /></div>
  if (!distributions.length) return <div className={cn(wrapperClass, 'p-4')}><EmptyState message={emptyMessage} /></div>

  return (
    <TooltipProvider>
      <div className={wrapperClass}>
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Coins className="h-4 w-4 text-teal-500" />Distribution History
          </h3>
        </div>
        <ScrollArea className="h-[280px]">
          <div className="divide-y divide-border">
            {items.map((d) => {
              const amt = parseFloat(formatUnits(d.amount, d.tokenDecimals)).toLocaleString(undefined, {
                minimumFractionDigits: 2, maximumFractionDigits: 2,
              })
              const link = getExplorerLink(chainId, d.txHash, 'tx')
              return (
                <div key={d.id} className="flex items-center justify-between p-3 hover:bg-accent/50 hover:border-l-2 hover:border-l-teal-500 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Coins className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="font-mono tabular-nums text-emerald-500 font-medium">+${amt}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-slate-500 text-sm cursor-default">{formatRelativeTime(d.timestamp)}</span>
                      </TooltipTrigger>
                      <TooltipContent>{new Date(d.timestamp * 1000).toLocaleString()}</TooltipContent>
                    </Tooltip>
                    {link && (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
        {hasMore && onViewAll && (
          <div className="p-3 border-t border-border">
            <Button variant="ghost" onClick={onViewAll} className="w-full text-teal-500 hover:text-teal-400">View All Distributions</Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
