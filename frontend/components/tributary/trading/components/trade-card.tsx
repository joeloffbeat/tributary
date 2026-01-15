'use client'

import Image from 'next/image'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Vault } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import type { PoolData } from '@/hooks/use-all-pools'

interface TradeCardProps {
  pool: PoolData
}

function formatBps(bps: string | undefined): string {
  if (!bps) return '0%'
  return `${(parseInt(bps) / 100).toFixed(1)}%`
}

export function TradeCard({ pool }: TradeCardProps) {
  const price = parseFloat(pool.reserveQuote) / 10000
  const change24h = pool.change24h || 0
  const liquidity = parseFloat(pool.reserveQuote) * 2

  return (
    <Link href={`/trade/${pool.token.id}`}>
      <div className="group flex h-[140px] hover:bg-muted/30 transition-all cursor-pointer">
        {/* Image Section - Square */}
        <div className="relative aspect-square h-full overflow-hidden">
          {pool.imageUrl ? (
            <Image
              src={pool.imageUrl}
              alt={pool.ipName || pool.token.name}
              fill
              className="object-cover"
              sizes="150px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/20">
              <Vault className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Info Section - Right side */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Top: Name, Symbol, Change */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-2">
              <h3 className="font-title text-2xl truncate group-hover:text-primary transition-colors">
                {pool.ipName || pool.token.name}
              </h3>
              <p className="font-body text-xs text-text-muted">
                ${pool.token.symbol.toUpperCase()}/USDT
              </p>
            </div>
            <div className={`flex items-center gap-1 shrink-0 ${
              change24h >= 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {change24h >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-stat text-sm">
                {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Middle: Price (prominent) */}
          <p className="font-stat text-2xl">${price.toFixed(4)}</p>

          {/* Bottom: Volume and Liquidity */}
          <div className="flex items-center gap-4 font-body text-xs text-text-muted">
            <div>
              <span className="uppercase">VOL </span>
              <span className="font-stat text-text-primary">${formatNumber(pool.volumeQuote)}</span>
            </div>
            <div>
              <span className="uppercase">LIQ </span>
              <span className="font-stat text-text-primary">${formatNumber(liquidity.toString())}</span>
            </div>
            {pool.vault?.dividendBps && (
              <div>
                <span className="uppercase">DIV </span>
                <span className="font-stat text-tributary">{formatBps(pool.vault.dividendBps)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
