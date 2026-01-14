'use client'

import { useState } from 'react'
import { formatUnits } from 'viem'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Users, Crown, Copy, ExternalLink, Check } from 'lucide-react'
import { formatAddress, getExplorerLink } from '@/lib/web3'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface Holder { address: string; balance: bigint; percentage: number; isCreator?: boolean; ensName?: string }

interface HoldersListProps {
  holders: Holder[]; totalSupply: bigint; tokenDecimals: number; tokenSymbol: string; chainId: number
  isLoading?: boolean; maxItems?: number; onViewAll?: () => void; className?: string
}

function HolderRow({ holder, rank, tokenDecimals, tokenSymbol, chainId }: {
  holder: Holder; rank: number; tokenDecimals: number; tokenSymbol: string; chainId: number
}) {
  const [copied, setCopied] = useState(false)
  const displayName = holder.ensName || formatAddress(holder.address)
  const balance = parseFloat(formatUnits(holder.balance, tokenDecimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })
  const explorerLink = getExplorerLink(chainId, holder.address, 'address')
  const handleCopy = async () => { await navigator.clipboard.writeText(holder.address); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div className="p-3 hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-6 text-slate-600 text-sm font-medium">{rank}</span>
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-slate-700 text-xs">{holder.address.slice(2, 4)}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-mono text-slate-300 text-sm truncate">{displayName}</span>
            </TooltipTrigger>
            <TooltipContent>{holder.address}</TooltipContent>
          </Tooltip>
          {holder.isCreator && (
            <span className="bg-teal-500/20 text-teal-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Crown className="h-3 w-3" />Creator
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          {explorerLink && (
            <a href={explorerLink} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-500 hover:text-cyan-400 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <span className="font-mono tabular-nums text-sm w-16 text-right">{holder.percentage.toFixed(1)}%</span>
      </div>
      <div className="ml-9 flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" style={{ width: `${Math.min(holder.percentage, 100)}%` }} />
        </div>
        <span className="text-xs text-slate-500 w-24 text-right">{balance} {tokenSymbol}</span>
      </div>
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className="space-y-3 p-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-2">
        <div className="flex items-center gap-3"><Skeleton className="h-4 w-6" /><Skeleton className="h-7 w-7 rounded-full" /><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-12 ml-auto" /></div>
        <Skeleton className="h-2 w-full ml-9" />
      </div>
    ))}
  </div>
)

export function HoldersList({ holders, totalSupply, tokenDecimals, tokenSymbol, chainId, isLoading, maxItems = 5, onViewAll, className }: HoldersListProps) {
  const items = holders.slice(0, maxItems), hasMore = holders.length > maxItems
  if (isLoading) return <div className={cn('rounded-lg bg-card', className)}><LoadingSkeleton /></div>

  return (
    <TooltipProvider>
      <div className={cn('rounded-lg bg-card', className)}>
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Users className="h-4 w-4 text-teal-500" />Token Holders ({holders.length})</h3>
        </div>
        <div className="divide-y divide-border">
          {items.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No holders yet</div>
          ) : items.map((h, i) => <HolderRow key={h.address} holder={h} rank={i + 1} tokenDecimals={tokenDecimals} tokenSymbol={tokenSymbol} chainId={chainId} />)}
        </div>
        {hasMore && onViewAll && (
          <div className="p-3 border-t border-border">
            <Button variant="ghost" onClick={onViewAll} className="w-full text-teal-500 hover:text-teal-400">View All {holders.length} Holders</Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
