'use client'

import Link from 'next/link'
import { formatNumber, shortenAddress } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface VaultCardProps {
  vault: {
    id: string
    token: {
      name: string
      symbol: string
    }
    creator: string
    dividendBps: string
    tradingFeeBps: string
    totalDeposited: string
    pool?: {
      reserveQuote: string
      volumeQuote: string
    }
  }
}

export function VaultCard({ vault }: VaultCardProps) {
  // Calculate price from pool reserves
  const price = vault.pool
    ? parseFloat(vault.pool.reserveQuote) / 10000 // 10K fixed supply
    : null

  // Mock 24h change for now (will be calculated from candles)
  const change24h = Math.random() * 10 - 3 // -3% to +7%

  return (
    <Link href={`/vault/${vault.id}`}>
      <div className="card-premium p-6 h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow">
        {/* Token Info */}
        <div className="mb-6">
          <h3 className="font-title text-3xl text-text-primary mb-1">
            {vault.token.name}
          </h3>
          <p className="font-body text-xs text-text-secondary">
            {vault.token.symbol} • BY {shortenAddress(vault.creator)}
          </p>
        </div>

        {/* Divider */}
        <div className="divider border-t border-cream-dark mb-6" />

        {/* Price & Change */}
        {price && (
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-body text-xs text-text-muted mb-1">PRICE</p>
              <p className="font-stat text-2xl">${price.toFixed(4)}</p>
            </div>
            <div className={`flex items-center gap-1 ${
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
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div>
            <p className="font-body text-xs text-text-muted mb-1">DIVIDEND</p>
            <p className="font-stat text-lg text-tributary">
              {(parseInt(vault.dividendBps) / 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="font-body text-xs text-text-muted mb-1">TRADE FEE</p>
            <p className="font-stat text-lg">
              {(parseInt(vault.tradingFeeBps) / 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* View Button */}
        <button className="btn-secondary w-full mt-6">
          VIEW
        </button>
      </div>
    </Link>
  )
}
