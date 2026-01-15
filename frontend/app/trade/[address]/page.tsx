'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { usePool } from '@/hooks/use-pool'
import { CandlestickChart } from '@/components/trade/candlestick-chart'
import { IntervalSelector } from '@/components/trade/interval-selector'
import { SwapForm } from '@/components/trade/swap-form'
import { PoolStats } from '@/components/trade/pool-stats'
import { RecentTrades } from '@/components/trade/recent-trades'

export default function TradePage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address: tokenAddress } = use(params)
  const { data: pool, isLoading } = usePool(tokenAddress)
  const [interval, setInterval] = useState<'1m' | '5m' | '1h' | '1d'>('1h')

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-cream-dark rounded w-1/3" />
          <div className="h-96 bg-cream-dark rounded" />
        </div>
      </div>
    )
  }

  if (!pool) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <p className="font-body text-text-secondary mb-4">POOL NOT FOUND</p>
        <Link href="/trade" className="btn-secondary">
          BACK TO POOLS
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Back Link */}
      <Link
        href="/trade"
        className="inline-flex items-center gap-2 font-body text-sm text-text-secondary hover:text-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        ALL POOLS
      </Link>

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-title text-5xl">{pool.token.name}</h1>
          <p className="font-body text-sm text-text-muted">{pool.token.symbol}/USDT</p>
        </div>
        <PoolStats pool={pool} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <div className="card-premium p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-body text-sm text-text-muted">PRICE CHART</h2>
              <IntervalSelector value={interval} onChange={setInterval} />
            </div>
            <CandlestickChart poolId={pool.id} interval={interval} />
          </div>
        </div>

        {/* Swap Form */}
        <div>
          <SwapForm pool={pool} />
        </div>
      </div>

      {/* Recent Trades */}
      <div className="mt-6">
        <RecentTrades poolId={pool.id} />
      </div>
    </div>
  )
}
