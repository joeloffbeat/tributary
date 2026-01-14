'use client'

import { formatUnits } from 'viem'
import { Users, TrendingUp, Vault } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface VaultCardProps {
  vault: {
    id: string
    name: string
    symbol: string
    imageUrl?: string
    totalValue: bigint
    tokenDecimals: number
    apy: number
    holderCount: number
    creatorAddress: string
  }
  onClick?: () => void
  className?: string
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatValue(value: bigint, decimals: number): string {
  const formatted = formatUnits(value, decimals)
  const num = parseFloat(formatted)
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`
  }
  return `$${num.toFixed(2)}`
}

export function VaultCard({ vault, onClick, className }: VaultCardProps) {
  const { name, symbol, imageUrl, totalValue, tokenDecimals, apy, holderCount, creatorAddress } = vault

  return (
    <Card
      onClick={onClick}
      className={cn(
        // Base styles
        'relative overflow-hidden cursor-pointer',
        'bg-gradient-to-b from-slate-800/80 to-slate-900/90',
        'border border-slate-700/50 rounded-2xl',
        'backdrop-blur-sm',
        // Transition and hover effects
        'transition-all duration-300',
        'hover:border-teal-500/30 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)]',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {/* Vault Image */}
          <Avatar className="h-14 w-14 rounded-xl">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt={name} className="object-cover rounded-xl" />
            ) : null}
            <AvatarFallback className="rounded-xl bg-gradient-to-br from-tributary-600 to-tributary-800">
              <Vault className="h-6 w-6 text-white" />
            </AvatarFallback>
          </Avatar>

          {/* Name and Symbol */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <Badge variant="secondary" className="mt-1 bg-slate-700/60 text-slate-300 font-mono text-xs">
              {symbol}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total Value */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Value</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-foreground">
            {formatValue(totalValue, tokenDecimals)}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          {/* APY */}
          <div className="flex items-center gap-1.5">
            <TrendingUp className={cn('h-4 w-4', apy >= 0 ? 'text-emerald-500' : 'text-red-500')} />
            <span className={cn('font-mono tabular-nums text-sm font-medium', apy >= 0 ? 'text-emerald-500' : 'text-red-500')}>
              {apy >= 0 ? '+' : ''}{apy.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">APY</span>
          </div>

          {/* Holder Count */}
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono tabular-nums text-sm text-muted-foreground">
              {holderCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Creator */}
        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-xs text-muted-foreground">
            Created by{' '}
            <span className="font-mono text-slate-300">{truncateAddress(creatorAddress)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
