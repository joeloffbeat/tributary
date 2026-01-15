'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAllPools, type PoolData } from '@/hooks/use-all-pools'
import { TrendingUp, TrendingDown, LayoutGrid, List, Vault } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { TradeCard } from '@/components/tributary/trading/components/trade-card'

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
            <TradeCard key={pool.id} pool={pool} />
          ))}
        </div>
      ) : (
        <PoolTable pools={pools || []} />
      )}
    </div>
  )
}

function PoolGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex h-[140px] animate-pulse">
          <div className="w-[35%] bg-muted/20" />
          <div className="flex-1 p-4 space-y-3">
            <div className="h-6 bg-muted/30 rounded w-1/2" />
            <div className="h-8 bg-muted/30 rounded w-1/3" />
            <div className="h-4 bg-muted/30 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PoolTable({ pools }: { pools: PoolData[] }) {
  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-muted">
            <th className="text-left p-4 font-body text-xs text-text-muted w-16"></th>
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

function PoolTableRow({ pool }: { pool: PoolData }) {
  const router = useRouter()
  const price = parseFloat(pool.reserveQuote) / 10000
  const change24h = pool.change24h || 0

  return (
    <tr
      className="hover:bg-muted/30 transition-all cursor-pointer"
      onClick={() => router.push(`/trade/${pool.token.id}`)}
    >
      {/* Image Column */}
      <td className="p-2 w-16">
        <div className="relative w-12 h-12 overflow-hidden">
          {pool.imageUrl ? (
            <Image
              src={pool.imageUrl}
              alt={pool.ipName || pool.token.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/20">
              <Vault className="h-5 w-5 text-muted-foreground/30" />
            </div>
          )}
        </div>
      </td>
      <td className="p-4">
        <div>
          <p className="font-title text-xl">{pool.ipName || pool.token.name}</p>
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
  )
}

function PoolTableSkeleton() {
  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-muted">
            <th className="text-left p-4 font-body text-xs text-text-muted w-16"></th>
            <th className="text-left p-4 font-body text-xs text-text-muted">TOKEN</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">PRICE</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">24H CHANGE</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">VOLUME 24H</th>
            <th className="text-right p-4 font-body text-xs text-text-muted">LIQUIDITY</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="p-2 w-16"><div className="h-12 w-12 bg-muted/30" /></td>
              <td className="p-4">
                <div className="h-6 bg-muted/30 rounded w-32 mb-1" />
                <div className="h-4 bg-muted/30 rounded w-20" />
              </td>
              <td className="p-4"><div className="h-6 bg-muted/30 rounded w-20 ml-auto" /></td>
              <td className="p-4"><div className="h-6 bg-muted/30 rounded w-16 ml-auto" /></td>
              <td className="p-4"><div className="h-6 bg-muted/30 rounded w-24 ml-auto" /></td>
              <td className="p-4"><div className="h-6 bg-muted/30 rounded w-24 ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
