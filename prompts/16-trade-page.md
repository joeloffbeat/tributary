# Prompt 16: Trade Page

## Objective
Create the AMM trading interface with candlestick chart, swap form, and trade history.

## Requirements

### Trade Index Page
File: `frontend/app/trade/page.tsx`

```tsx
'use client'

import Link from 'next/link'
import { useAllPools } from '@/hooks/use-all-pools'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

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

function PoolCard({ pool }: { pool: any }) {
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
```

### Trade Interface Page
File: `frontend/app/trade/[address]/page.tsx`

```tsx
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
          <h1 className="font-title text-5xl">{pool.token.symbol}/USDT</h1>
          <p className="font-body text-sm text-text-muted">{pool.token.name}</p>
        </div>
        <PoolStats pool={pool} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <div className="card p-6">
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
```

### Candlestick Chart Component
File: `frontend/components/trade/candlestick-chart.tsx`

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { createChart, IChartApi, ColorType } from 'lightweight-charts'
import { useCandleData } from '@/hooks/use-candle-data'

interface CandlestickChartProps {
  poolId: string
  interval: '1m' | '5m' | '1h' | '1d'
}

const INTERVAL_SECONDS = {
  '1m': 60,
  '5m': 300,
  '1h': 3600,
  '1d': 86400,
}

export function CandlestickChart({ poolId, interval }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const { data: candles, isLoading } = useCandleData(poolId, INTERVAL_SECONDS[interval])

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b6b6b',
      },
      grid: {
        vertLines: { color: '#e5e1d6' },
        horzLines: { color: '#e5e1d6' },
      },
      rightPriceScale: {
        borderColor: '#e5e1d6',
      },
      timeScale: {
        borderColor: '#e5e1d6',
        timeVisible: true,
      },
    })

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#167a5f',
      downColor: '#ef4444',
      borderUpColor: '#167a5f',
      borderDownColor: '#ef4444',
      wickUpColor: '#167a5f',
      wickDownColor: '#ef4444',
    })

    chartRef.current = chart

    if (candles?.length) {
      candlestickSeries.setData(
        candles.map((c: any) => ({
          time: Number(c.timestamp),
          open: parseFloat(c.open),
          high: parseFloat(c.high),
          low: parseFloat(c.low),
          close: parseFloat(c.close),
        }))
      )
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [candles])

  if (isLoading) {
    return <div className="h-[400px] bg-cream-dark rounded animate-pulse" />
  }

  if (!candles?.length) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="font-body text-text-secondary">NO CHART DATA AVAILABLE</p>
      </div>
    )
  }

  return <div ref={chartContainerRef} className="w-full" />
}
```

### Swap Form Component
File: `frontend/components/trade/swap-form.tsx`

```tsx
'use client'

import { useState } from 'react'
import { ArrowDownUp, Loader2 } from 'lucide-react'
import { useAccount, useWalletClient } from '@/lib/web3'
import { useSwapQuote, useSwap } from '@/hooks/use-swap'
import { formatNumber } from '@/lib/utils'

interface SwapFormProps {
  pool: any
}

export function SwapForm({ pool }: SwapFormProps) {
  const { isConnected } = useAccount()
  const [isBuy, setIsBuy] = useState(true)
  const [amount, setAmount] = useState('')

  const { data: quote, isLoading: quoteLoading } = useSwapQuote(
    pool.id,
    isBuy,
    amount
  )
  const { mutate: executeSwap, isPending } = useSwap()

  const handleSwap = () => {
    if (!amount || !quote) return
    executeSwap({
      poolId: pool.id,
      isBuy,
      amount,
      minOut: (parseFloat(quote.amountOut) * 0.95).toString(), // 5% slippage
    })
  }

  const price = parseFloat(pool.reserveQuote) / 10000

  return (
    <div className="card p-6">
      <h2 className="font-title text-2xl mb-6">Swap</h2>

      {/* Toggle */}
      <div className="flex mb-6">
        <button
          onClick={() => setIsBuy(true)}
          className={`flex-1 py-3 font-body text-sm transition-colors ${
            isBuy
              ? 'bg-primary text-white'
              : 'bg-cream-dark text-text-secondary'
          }`}
        >
          BUY
        </button>
        <button
          onClick={() => setIsBuy(false)}
          className={`flex-1 py-3 font-body text-sm transition-colors ${
            !isBuy
              ? 'bg-primary text-white'
              : 'bg-cream-dark text-text-secondary'
          }`}
        >
          SELL
        </button>
      </div>

      {/* Input */}
      <div className="space-y-4">
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            {isBuy ? 'YOU PAY' : 'YOU SELL'}
          </label>
          <div className="flex">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input flex-1 rounded-r-none"
            />
            <div className="bg-cream-dark px-4 flex items-center rounded-r font-body text-sm">
              {isBuy ? 'USDT' : pool.token.symbol}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsBuy(!isBuy)}
            className="p-2 bg-cream-dark rounded-full hover:bg-cream-dark/70"
          >
            <ArrowDownUp className="h-4 w-4 text-text-muted" />
          </button>
        </div>

        {/* Output */}
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            YOU RECEIVE
          </label>
          <div className="flex">
            <div className="input flex-1 rounded-r-none bg-cream-dark/50">
              {quoteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                quote?.amountOut || '0.00'
              )}
            </div>
            <div className="bg-cream-dark px-4 flex items-center rounded-r font-body text-sm">
              {isBuy ? pool.token.symbol : 'USDT'}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      {quote && amount && (
        <div className="mt-4 p-3 bg-cream-dark/50 rounded space-y-2">
          <div className="flex justify-between font-body text-xs">
            <span className="text-text-muted">PRICE</span>
            <span>${price.toFixed(4)}</span>
          </div>
          <div className="flex justify-between font-body text-xs">
            <span className="text-text-muted">FEE ({(pool.vault?.tradingFeeBps / 100 || 1).toFixed(1)}%)</span>
            <span>${formatNumber(quote.fee)}</span>
          </div>
          <div className="flex justify-between font-body text-xs">
            <span className="text-text-muted">PRICE IMPACT</span>
            <span className={quote.priceImpact > 2 ? 'text-red-500' : ''}>
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleSwap}
        disabled={!isConnected || !amount || isPending}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isConnected ? 'CONNECT WALLET' : isPending ? 'SWAPPING...' : 'SWAP'}
      </button>
    </div>
  )
}
```

### Pool Stats Component
File: `frontend/components/trade/pool-stats.tsx`

```tsx
'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export function PoolStats({ pool }: { pool: any }) {
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
```

### Hooks
Create these hooks in `frontend/hooks/`:
- `use-all-pools.ts` - Fetch all AMM pools
- `use-pool.ts` - Fetch single pool by token address
- `use-candle-data.ts` - Fetch OHLCV candles from subgraph
- `use-swap.ts` - Execute swap and get quotes
- `use-recent-trades.ts` - Fetch recent trades for a pool

## Verification
- [ ] Trade index shows all pools
- [ ] Pool cards show price + volume
- [ ] Candlestick chart renders
- [ ] Interval selector works
- [ ] Swap form calculates quotes
- [ ] Swap execution works
- [ ] Recent trades display
- [ ] Premium styling applied

## Files to Create
- `frontend/app/trade/page.tsx`
- `frontend/app/trade/[address]/page.tsx`
- `frontend/components/trade/candlestick-chart.tsx`
- `frontend/components/trade/interval-selector.tsx`
- `frontend/components/trade/swap-form.tsx`
- `frontend/components/trade/pool-stats.tsx`
- `frontend/components/trade/recent-trades.tsx`
- `frontend/hooks/use-all-pools.ts`
- `frontend/hooks/use-pool.ts`
- `frontend/hooks/use-candle-data.ts`
- `frontend/hooks/use-swap.ts`

## Dependencies
```bash
npm install lightweight-charts
```
