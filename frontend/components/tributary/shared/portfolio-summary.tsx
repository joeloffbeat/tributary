'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Wallet, HandCoins, TrendingUp, Percent, LayoutGrid } from 'lucide-react'
import { formatUnits } from 'viem'

interface PortfolioPosition {
  vaultId: string
  vaultName: string
  balance: bigint
  tokenDecimals: number
  value: number
  claimable: number
  apy: number
}

interface PortfolioSummaryProps {
  positions: PortfolioPosition[]
  totalValue: number
  totalClaimable: number
  totalEarned: number
  averageApy: number
  isLoading?: boolean
  onClaimAll?: () => void
  className?: string
}

const formatUsd = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)

function StatCard({ icon, label, value, subtext, highlight }: { icon: React.ReactNode; label: string; value: string; subtext?: string; highlight?: boolean }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <span className={cn('text-2xl md:text-3xl font-bold font-mono tabular-nums', highlight ? 'text-emerald-400' : 'text-slate-100')}>{value}</span>
      {subtext && <span className="text-slate-500 text-xs">{subtext}</span>}
    </div>
  )
}

function PositionRow({ position }: { position: PortfolioPosition }) {
  const balance = parseFloat(formatUnits(position.balance, position.tokenDecimals))
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 px-2 rounded transition-colors">
      <div className="flex flex-col">
        <span className="text-slate-100 font-medium">{position.vaultName}</span>
        <span className="text-slate-500 text-xs">{balance.toLocaleString()} tokens</span>
      </div>
      <div className="flex items-center gap-4 text-right">
        <div className="flex flex-col">
          <span className="font-mono tabular-nums text-slate-100">{formatUsd(position.value)}</span>
          <span className="text-slate-500 text-xs">{position.apy.toFixed(1)}% APY</span>
        </div>
        {position.claimable > 0 && (
          <span className="text-emerald-400 font-mono tabular-nums text-sm">{formatUsd(position.claimable)}</span>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
            <Skeleton className="h-4 w-20 bg-slate-700/50" />
            <Skeleton className="h-8 w-28 bg-slate-700/50" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full bg-slate-700/50" />)}
      </div>
    </div>
  )
}

export function PortfolioSummary({ positions, totalValue, totalClaimable, totalEarned, averageApy, isLoading = false, onClaimAll, className }: PortfolioSummaryProps) {
  if (isLoading) return <div className={className}><LoadingSkeleton /></div>

  const hasPositions = positions.length > 0
  const hasClaimable = totalClaimable > 0

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Wallet className="h-4 w-4" />} label="Total Value" value={formatUsd(totalValue)} />
        <div className="relative">
          <StatCard icon={<HandCoins className="h-4 w-4" />} label="Claimable" value={formatUsd(totalClaimable)} highlight={hasClaimable} />
          {hasClaimable && onClaimAll && (
            <Button onClick={onClaimAll} size="sm" className="absolute bottom-3 right-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xs">
              Claim All
            </Button>
          )}
        </div>
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Earned" value={formatUsd(totalEarned)} subtext="lifetime" />
        <StatCard icon={<Percent className="h-4 w-4" />} label="Avg APY" value={`${averageApy.toFixed(1)}%`} subtext={`across ${positions.length}`} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <LayoutGrid className="h-4 w-4" />
          <span className="font-medium">Your Positions ({positions.length})</span>
        </div>
        {hasPositions ? (
          <ScrollArea className="h-[200px] bg-slate-800/30 rounded-xl border border-slate-700/50">
            <div className="p-2">
              {positions.map(pos => <PositionRow key={pos.vaultId} position={pos} />)}
            </div>
          </ScrollArea>
        ) : (
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-8 text-center">
            <p className="text-slate-500">No positions yet</p>
            <p className="text-slate-600 text-sm mt-1">Invest in vaults to start earning royalties</p>
          </div>
        )}
      </div>
    </div>
  )
}
