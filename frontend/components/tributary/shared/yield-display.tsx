'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface YieldDisplayProps {
  apy: number
  change?: number
  period?: '24h' | '7d' | '30d'
  size?: 'sm' | 'md' | 'lg'
  showTrend?: boolean
  className?: string
}

function getApyColor(apy: number): string {
  if (apy > 0) return 'text-emerald-500'
  if (apy < 0) return 'text-red-500'
  return 'text-slate-400'
}

function TrendIcon({ apy, className }: { apy: number; className?: string }) {
  if (apy > 0) return <TrendingUp className={className} />
  if (apy < 0) return <TrendingDown className={className} />
  return <Minus className={className} />
}

const sizeStyles = {
  sm: { text: 'text-sm', icon: 'h-3 w-3' },
  md: { text: 'text-base', icon: 'h-4 w-4' },
  lg: { text: 'text-2xl font-bold', icon: 'h-5 w-5' },
}

export function YieldDisplay({
  apy,
  change,
  period = '30d',
  size = 'md',
  showTrend = true,
  className,
}: YieldDisplayProps) {
  const styles = sizeStyles[size]
  const color = getApyColor(apy)
  const showChange = size === 'lg' && change !== undefined

  const content = (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'font-mono tabular-nums',
            styles.text,
            color,
            size === 'lg' && 'bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent'
          )}
        >
          {apy >= 0 ? '+' : ''}{apy.toFixed(1)}%
        </span>
        {size === 'lg' && <span className="text-slate-400 text-lg">APY</span>}
        {showTrend && size !== 'sm' && (
          <TrendIcon apy={apy} className={cn(styles.icon, color)} />
        )}
      </div>

      {showChange && (
        <span className={cn(
          'font-mono tabular-nums text-sm',
          change && change >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'
        )}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}% ({period})
        </span>
      )}
    </div>
  )

  if (change !== undefined && size !== 'lg') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% change ({period})
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}
