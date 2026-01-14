'use client'

import { formatNumber } from '@/lib/utils'
import { VaultDetail } from '@/hooks/use-vault-detail'

interface AnalyticsTabProps {
  vault: VaultDetail
}

export function AnalyticsTab({ vault }: AnalyticsTabProps) {
  const price = vault.pool
    ? parseFloat(vault.pool.reserveQuote) / 10000
    : 0

  const marketCap = price * 10000
  const volume24h = vault.pool ? parseFloat(vault.pool.volumeQuote) : 0

  return (
    <div className="space-y-6">
      {/* Price Chart Placeholder */}
      <div className="card-premium p-6">
        <h3 className="font-title text-2xl mb-4">Price History</h3>
        <div className="h-64 flex items-center justify-center bg-cream-dark/30 rounded">
          <p className="font-body text-text-secondary">
            PRICE CHART COMING SOON
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card-premium p-6">
          <h4 className="font-body text-xs text-text-muted mb-2">MARKET CAP</h4>
          <p className="font-stat text-3xl">${formatNumber(marketCap)}</p>
        </div>

        <div className="card-premium p-6">
          <h4 className="font-body text-xs text-text-muted mb-2">24H VOLUME</h4>
          <p className="font-stat text-3xl">${formatNumber(volume24h)}</p>
        </div>

        <div className="card-premium p-6">
          <h4 className="font-body text-xs text-text-muted mb-2">TOTAL DISTRIBUTED</h4>
          <p className="font-stat text-3xl text-tributary">${formatNumber(vault.totalDistributed)}</p>
        </div>

        <div className="card-premium p-6">
          <h4 className="font-body text-xs text-text-muted mb-2">AVG DIVIDEND PER HOLDER</h4>
          <p className="font-stat text-3xl">
            ${formatNumber(parseFloat(vault.totalDistributed) / Math.max(parseInt(vault.token.holderCount), 1))}
          </p>
        </div>

        <div className="card-premium p-6">
          <h4 className="font-body text-xs text-text-muted mb-2">DIVIDEND YIELD</h4>
          <p className="font-stat text-3xl">
            {marketCap > 0 ? ((parseFloat(vault.totalDistributed) / marketCap) * 100).toFixed(2) : '0.00'}%
          </p>
        </div>

        <div className="card-premium p-6">
          <h4 className="font-body text-xs text-text-muted mb-2">HOLDERS</h4>
          <p className="font-stat text-3xl">{vault.token.holderCount || '0'}</p>
        </div>
      </div>
    </div>
  )
}
