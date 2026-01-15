'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAllPools } from '@/hooks/use-all-pools'
import { TrendingUp, TrendingDown, LayoutGrid, List } from 'lucide-react'
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

type ViewMode = 'grid' | 'table'

export default function TradeIndexPage() {
  const { data: pools, isLoading } = useAllPools()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="font-title text-6xl mb-4">Trade</h1>
          <p className="font-body text-text-secondary">
            BUY AND SELL ROYALTY TOKENS
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 border-2 transition-all ${
              viewMode === 'grid'
                ? 'border-primary bg-primary text-white'
                : 'border-muted bg-transparent text-muted-foreground hover:border-primary hover:text-primary'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-3 border-2 transition-all ${
              viewMode === 'table'
                ? 'border-primary bg-primary text-white'
                : 'border-muted bg-transparent text-muted-foreground hover:border-primary hover:text-primary'
            }`}
            aria-label="Table view"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        viewMode === 'grid' ? <PoolGridSkeleton /> : <PoolTableSkeleton />
      ) : pools?.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-body text-text-secondary">NO TRADING POOLS AVAILABLE</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools?.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>
      ) : (
        <PoolTable pools={pools || []} />
      )}
    </div>
  )
}

function PoolCard({ pool }: { pool: Pool }) {
  const price = parseFloat(pool.reserveQuote) / 10000
  const change24h = pool.change24h || Math.random() * 10 - 3

  return (
    <Link href={`/trade/${pool.token.id}`}>
      <div className="p-6 hover:bg-muted/30 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-title text-3xl">{pool.token.name}</h3>
            <p className="font-body text-xs text-text-muted">{pool.token.symbol.toUpperCase()}/USDT</p>
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

function PoolTable({ pools }: { pools: Pool[] }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="text-left p-4 font-body text-xs text-text-muted">TOKEN</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">PRICE</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">24H CHANGE</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">VOLUME 24H</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">LIQUIDITY</th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <PoolTableRow key={pool.id} pool={pool} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PoolTableRow({ pool }: { pool: Pool }) {
  const price = parseFloat(pool.reserveQuote) / 10000
  const change24h = pool.change24h || Math.random() * 10 - 3

  return (
    <Link href={`/trade/${pool.token.id}`} className="contents">
      <tr className="border-b border-ink/20 hover:bg-muted/30 transition-all cursor-pointer">
        <td className="p-4">
          <div>
            <p className="font-title text-2xl">{pool.token.name}</p>
            <p className="font-body text-[10px] text-text-muted">{pool.token.symbol.toUpperCase()}/USDT</p>
          </div>
        </td>
        <td className="p-4 text-right align-middle">
          <p className="font-stat text-lg">${price.toFixed(4)}</p>
        </td>
        <td className="p-4 text-right align-middle">
          <div className={`flex items-center justify-end gap-1 ${
            change24h >= 0 ? 'text-green-600' : 'text-red-500'
          }`}>
            {change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="font-stat">
              {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
            </span>
          </div>
        </td>
        <td className="p-4 text-right align-middle">
          <p className="font-stat">${formatNumber(pool.volumeQuote)}</p>
        </td>
        <td className="p-4 text-right align-middle">
          <p className="font-stat">${formatNumber(parseFloat(pool.reserveQuote) * 2)}</p>
        </td>
      </tr>
    </Link>
  )
}

function PoolTableSkeleton() {
  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="text-left p-4 font-body text-xs text-text-muted">TOKEN</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">PRICE</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">24H CHANGE</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">VOLUME 24H</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">LIQUIDITY</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-b border-ink/20 animate-pulse">
              <td className="p-4">
                <div className="h-6 bg-cream-dark rounded w-32 mb-1" />
                <div className="h-4 bg-cream-dark rounded w-20" />
              </td>
              <td className="p-4"><div className="h-6 bg-cream-dark rounded w-20 ml-auto" /></td>
              <td className="p-4"><div className="h-6 bg-cream-dark rounded w-16 ml-auto" /></td>
              <td className="p-4"><div className="h-6 bg-cream-dark rounded w-24 ml-auto" /></td>
              <td className="p-4"><div className="h-6 bg-cream-dark rounded w-24 ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
