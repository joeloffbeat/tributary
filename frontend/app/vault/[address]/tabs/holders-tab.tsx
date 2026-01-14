'use client'

import { useVaultHolders } from '@/hooks/use-vault-holders'
import { formatNumber, shortenAddress } from '@/lib/utils'
import { VaultDetail } from '@/hooks/use-vault-detail'

const COLORS = ['#167a5f', '#1a9e7a', '#0f5c47', '#e5e1d6', '#9a9a9a']

interface HoldersTabProps {
  vault: VaultDetail
}

export function HoldersTab({ vault }: HoldersTabProps) {
  const { data: holders, isLoading } = useVaultHolders(vault.token.id)

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-cream-dark rounded" />
  }

  const chartData = holders?.slice(0, 5).map((h, i) => ({
    name: shortenAddress(h.address),
    value: h.percentage,
    color: COLORS[i % COLORS.length],
  })) || []

  const others = holders?.slice(5).reduce((sum, h) => sum + h.percentage, 0) || 0
  if (others > 0) {
    chartData.push({ name: 'Others', value: others, color: COLORS[5 % COLORS.length] })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distribution Chart */}
      <div className="card-premium p-6">
        <h3 className="font-title text-2xl mb-4">Distribution</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full relative">
            {/* Simple pie visualization */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {chartData.reduce((acc, item, index) => {
                const previousTotal = chartData.slice(0, index).reduce((sum, d) => sum + d.value, 0)
                const offset = (previousTotal / 100) * 100
                const percentage = (item.value / 100) * 100
                acc.push(
                  <circle
                    key={item.name}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={`${percentage} ${100 - percentage}`}
                    strokeDashoffset={-offset}
                  />
                )
                return acc
              }, [] as JSX.Element[])}
            </svg>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-body text-xs">{item.name}</span>
            </div>
          ))}
        </div>
        <p className="font-body text-xs text-text-muted text-center mt-4">
          {holders?.length || 0} UNIQUE HOLDERS
        </p>
      </div>

      {/* Holders Table */}
      <div className="card-premium p-6">
        <h3 className="font-title text-2xl mb-4">Top Holders</h3>
        <div className="space-y-3">
          {holders?.slice(0, 10).map((holder, index) => (
            <div
              key={holder.address}
              className="flex items-center justify-between py-2 border-b border-cream-dark last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="font-stat text-sm text-text-muted w-6">
                  #{index + 1}
                </span>
                <a
                  href={`https://sepolia.mantlescan.xyz/address/${holder.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-tributary hover:text-tributary-light"
                >
                  {shortenAddress(holder.address)}
                </a>
              </div>
              <div className="text-right">
                <p className="font-stat text-sm">{formatNumber(holder.balance)}</p>
                <p className="font-body text-xs text-text-muted">
                  {holder.percentage.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
