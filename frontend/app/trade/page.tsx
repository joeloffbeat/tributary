'use client'

import Link from 'next/link'
import { useAllPools } from '@/hooks/use-all-pools'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface Pool {
  id: string
  token: {
    id: string
    name: string
    symbol: string
  }
  reserveQuote: string
  volumeQuote: string
  change24h?: number
}

export default function TradeIndexPage() {
  const { data: pools, isLoading } = useAllPools()

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="font-title text-6xl mb-4">Trade</h1>
        <p className="font-body text-text-secondary">
          BUY AND SELL ROYALTY TOKENS
        </p>
      </div>

      {isLoading ? (
        <PoolGridSkeleton />
      ) : pools?.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-body text-text-secondary">NO TRADING POOLS AVAILABLE</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools?.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>
      )}
    </div>
  )
}

function PoolCard({ pool }: { pool: Pool }) {
  const price = parseFloat(pool.reserveQuote) / 10000
  const change24h = pool.change24h || Math.random() * 10 - 3

  return (
    <Link href={`/trade/${pool.token.id}`}>
      <div className="card-hover p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-title text-2xl">{pool.token.symbol}/USDT</h3>
            <p className="font-body text-xs text-text-muted">{pool.token.name}</p>
          </div>
          <div className={`flex items-center gap-1 ${
            change24h >= 0 ? 'text-green-600' : 'text-red-500'
          }`}>
            {change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="font-stat text-sm">
              {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        <p className="font-stat text-3xl mb-4">${price.toFixed(4)}</p>

        <div className="divider mb-4" />

        <div className="flex justify-between font-body text-xs text-text-muted">
          <div>
            <p>VOLUME 24H</p>
            <p className="font-stat text-sm text-text-primary">
              ${formatNumber(pool.volumeQuote)}
            </p>
          </div>
          <div className="text-right">
            <p>LIQUIDITY</p>
            <p className="font-stat text-sm text-text-primary">
              ${formatNumber(parseFloat(pool.reserveQuote) * 2)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

function PoolGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-6 animate-pulse">
          <div className="h-8 bg-cream-dark rounded w-1/2 mb-4" />
          <div className="h-12 bg-cream-dark rounded w-1/3 mb-4" />
          <div className="h-16 bg-cream-dark rounded" />
        </div>
      ))}
    </div>
  )
}
