'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PriceDisplayProps {
  price: number
  change24h?: number
  change7d?: number
  high24h?: number
  low24h?: number
  size?: 'sm' | 'md' | 'lg'
  showRange?: boolean
  className?: string
}

const formatPrice = (price: number) => {
  if (price < 1) return `$${price.toFixed(4)}`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)
}

const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`

const getChangeColor = (change?: number) => {
  if (!change || change === 0) return 'text-slate-400'
  return change > 0 ? 'text-emerald-500' : 'text-red-500'
}

const getChangeIcon = (change?: number) => {
  if (!change || change === 0) return <Minus className="h-3 w-3" />
  return change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
}

function RangeBar({ price, low, high }: { price: number; low: number; high: number }) {
  const range = high - low
  const position = range > 0 ? ((price - low) / range) * 100 : 50
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-teal-500 to-slate-600" style={{ opacity: 0.5 }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-teal-400 rounded-full border border-teal-300 transition-all duration-300" style={{ left: `calc(${Math.min(Math.max(position, 5), 95)}% - 4px)` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatPrice(low)}</span>
        <span>{formatPrice(high)}</span>
      </div>
    </div>
  )
}

function ChangeIndicator({ change, label, size }: { change?: number; label?: string; size: 'sm' | 'md' | 'lg' }) {
  if (change === undefined) return null
  const color = getChangeColor(change)
  return (
    <span className={cn('inline-flex items-center gap-0.5', color, size === 'sm' ? 'text-xs' : 'text-sm')}>
      {getChangeIcon(change)}
      {size !== 'sm' && <span>{formatChange(change)}</span>}
      {label && size === 'lg' && <span className="text-slate-500 ml-0.5">({label})</span>}
    </span>
  )
}

export function PriceDisplay({ price, change24h, change7d, high24h, low24h, size = 'md', showRange = false, className }: PriceDisplayProps) {
  const priceSize = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }[size]

  if (size === 'sm') {
    return (
      <div className={cn('inline-flex items-center gap-1', className)}>
        <span className={cn('font-mono tabular-nums text-slate-100', priceSize)}>{formatPrice(price)}</span>
        <ChangeIndicator change={change24h} size={size} />
      </div>
    )
  }

  if (size === 'md') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <span className={cn('font-mono tabular-nums text-slate-100', priceSize)}>{formatPrice(price)}</span>
        <ChangeIndicator change={change24h} size={size} />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className={cn('font-mono tabular-nums text-slate-100 transition-all duration-300', priceSize)}>{formatPrice(price)}</span>
      <div className="flex items-center gap-4">
        <ChangeIndicator change={change24h} label="24h" size={size} />
        <ChangeIndicator change={change7d} label="7d" size={size} />
      </div>
      {showRange && high24h !== undefined && low24h !== undefined && (
        <RangeBar price={price} low={low24h} high={high24h} />
      )}
    </div>
  )
}
