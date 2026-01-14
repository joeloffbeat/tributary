'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import { formatNumber, shortenAddress } from '@/lib/utils'
import { VaultDetail } from '@/hooks/use-vault-detail'

interface VaultHeaderProps {
  vault: VaultDetail
}

export function VaultHeader({ vault }: VaultHeaderProps) {
  const price = vault.pool
    ? parseFloat(vault.pool.reserveQuote) / 10000
    : 0

  // Mock 24h change (calculate from candles in production)
  const change24h = 5.2

  return (
    <div className="mb-8">
      {/* Title Row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-title text-5xl mb-2">{vault.token.name}</h1>
          <div className="flex items-center gap-4 font-body text-sm text-text-secondary">
            <span>{vault.token.symbol}</span>
            <span>•</span>
            <span>BY {shortenAddress(vault.creator)}</span>
            <a
              href={`https://app.story.foundation/ip/${vault.storyIPId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tributary hover:text-tributary-light inline-flex items-center gap-1"
            >
              VIEW ON STORY <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href={`/trade/${vault.token.id}`} className="btn-primary">
            TRADE
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="PRICE" value={`$${price.toFixed(4)}`} />
        <StatCard
          label="24H CHANGE"
          value={`${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`}
          valueColor={change24h >= 0 ? 'text-green-600' : 'text-red-500'}
          icon={change24h >= 0 ? TrendingUp : TrendingDown}
        />
        <StatCard
          label="MARKET CAP"
          value={`$${formatNumber(price * 10000)}`}
        />
        <StatCard
          label="DIVIDEND RATE"
          value={`${(parseInt(vault.dividendBps) / 100).toFixed(1)}%`}
          valueColor="text-tributary"
        />
        <StatCard
          label="TRADE FEE"
          value={`${(parseInt(vault.tradingFeeBps) / 100).toFixed(1)}%`}
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  valueColor = '',
  icon: Icon,
}: {
  label: string
  value: string
  valueColor?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="card-premium p-4">
      <p className="font-body text-xs text-text-muted mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${valueColor}`} />}
        <p className={`font-stat text-xl ${valueColor}`}>{value}</p>
      </div>
    </div>
  )
}
