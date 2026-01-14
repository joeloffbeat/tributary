'use client'

import { formatUnits } from 'viem'
import { cn } from '@/lib/utils'

export interface TokenBalanceProps {
  balance: bigint
  decimals: number
  symbol: string
  usdPrice?: number
  showUsd?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function formatTokenAmount(value: bigint, decimals: number): string {
  const formatted = formatUnits(value, decimals)
  const num = parseFloat(formatted)

  // Format with max 6 decimals, trim trailing zeros
  const precision = Math.min(6, decimals)
  const fixed = num.toFixed(precision)
  const trimmed = fixed.replace(/\.?0+$/, '')

  // Add thousand separators
  const [integer, decimal] = trimmed.split('.')
  const withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return decimal ? `${withCommas}.${decimal}` : withCommas
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const sizeStyles = {
  sm: {
    amount: 'text-sm',
    symbol: 'text-sm',
    usd: 'text-xs',
  },
  md: {
    amount: 'text-base',
    symbol: 'text-base',
    usd: 'text-sm',
  },
  lg: {
    amount: 'text-2xl font-bold',
    symbol: 'text-xl',
    usd: 'text-base',
  },
}

export function TokenBalance({
  balance,
  decimals,
  symbol,
  usdPrice,
  showUsd = true,
  size = 'md',
  className,
}: TokenBalanceProps) {
  const formattedAmount = formatTokenAmount(balance, decimals)
  const styles = sizeStyles[size]

  const usdValue = usdPrice !== undefined
    ? parseFloat(formatUnits(balance, decimals)) * usdPrice
    : undefined

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-mono tabular-nums text-slate-100',
            styles.amount,
            size === 'lg' && 'bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent'
          )}
        >
          {formattedAmount}
        </span>
        <span className={cn('text-slate-400', styles.symbol)}>
          {symbol}
        </span>
      </div>

      {showUsd && usdValue !== undefined && (
        <span className={cn('font-mono tabular-nums text-slate-500', styles.usd)}>
          {formatUsd(usdValue)}
        </span>
      )}
    </div>
  )
}
