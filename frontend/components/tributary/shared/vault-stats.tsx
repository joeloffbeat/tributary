'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, Coins, Users, TrendingUp, Calendar, RefreshCw } from 'lucide-react'
import { formatUnits } from 'viem'

interface VaultStatsProps {
  stats: {
    totalValue: bigint
    totalDistributed: bigint
    tokenDecimals: number
    holderCount: number
    apy: number
    createdAt: number
    lastDistribution?: number
  }
  tokenSymbol: string
  isLoading?: boolean
  columns?: 2 | 3 | 4
  className?: string
}

const formatCurrency = (value: bigint, decimals: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(formatUnits(value, decimals)))

const formatRelativeDate = (timestamp: number) => {
  const days = Math.floor((Date.now() - timestamp * 1000) / (1000 * 60 * 60 * 24))
  if (days < 1) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subtext?: string
  isLoading?: boolean
  valueColor?: string
}

function StatCard({ icon, label, value, subtext, isLoading, valueColor }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-teal-500">{icon}</span>
        <span className="text-slate-500 text-sm">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-7 w-24 bg-slate-700/50" />
      ) : (
        <span className={cn('font-mono tabular-nums text-lg', valueColor || 'text-slate-100')}>
          {value}
        </span>
      )}
      {subtext && !isLoading && <span className="text-slate-600 text-xs">{subtext}</span>}
    </div>
  )
}

const gridColsMap = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function VaultStats({ stats, tokenSymbol, isLoading = false, columns = 3, className }: VaultStatsProps) {
  const apyColor = stats.apy >= 10 ? 'text-emerald-400' : stats.apy >= 5 ? 'text-teal-400' : 'text-slate-100'

  const statItems = [
    { icon: <DollarSign className="h-4 w-4" />, label: 'Total Value Locked', value: formatCurrency(stats.totalValue, stats.tokenDecimals) },
    { icon: <Coins className="h-4 w-4" />, label: 'Total Distributed', value: formatCurrency(stats.totalDistributed, stats.tokenDecimals), subtext: 'lifetime' },
    { icon: <Users className="h-4 w-4" />, label: 'Token Holders', value: stats.holderCount.toLocaleString() },
    { icon: <TrendingUp className="h-4 w-4" />, label: 'Current APY', value: `${stats.apy.toFixed(1)}%`, valueColor: apyColor },
    { icon: <Calendar className="h-4 w-4" />, label: 'Created', value: formatRelativeDate(stats.createdAt) },
    { icon: <RefreshCw className="h-4 w-4" />, label: 'Last Distribution', value: stats.lastDistribution ? formatRelativeDate(stats.lastDistribution) : 'Never' },
  ]

  return (
    <div className={cn('grid gap-4', gridColsMap[columns], className)}>
      {statItems.map((item) => (
        <StatCard key={item.label} {...item} isLoading={isLoading} />
      ))}
    </div>
  )
}
