'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { Pool } from '@/hooks/use-pool'

interface PoolStatsProps {
  pool: Pool
}

export function PoolStats({ pool }: PoolStatsProps) {
  const price = parseFloat(pool.reserveQuote) / 10000
  const change24h = pool.change24h || 5.2

  return (
    <div className="flex gap-8">
      <div>
        <p className="font-body text-xs text-text-muted">PRICE</p>
        <p className="font-stat text-2xl">${price.toFixed(4)}</p>
      </div>
      <div>
        <p className="font-body text-xs text-text-muted">24H CHANGE</p>
        <div className={`flex items-center gap-1 ${
          change24h >= 0 ? 'text-green-600' : 'text-red-500'
        }`}>
          {change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="font-stat text-xl">
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </span>
        </div>
      </div>
      <div>
        <p className="font-body text-xs text-text-muted">VOLUME 24H</p>
        <p className="font-stat text-xl">${formatNumber(pool.volumeQuote)}</p>
      </div>
    </div>
  )
}
