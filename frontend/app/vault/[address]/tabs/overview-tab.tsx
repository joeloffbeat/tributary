'use client'

import { formatNumber, shortenAddress } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { VaultDetail } from '@/hooks/use-vault-detail'

interface OverviewTabProps {
  vault: VaultDetail
}

export function OverviewTab({ vault }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Metrics */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card-premium p-6">
          <h3 className="font-title text-2xl mb-4">Key Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="TOTAL REVENUE"
              value={`$${formatNumber(vault.totalDeposited)}`}
            />
            <MetricCard
              label="DISTRIBUTED"
              value={`$${formatNumber(vault.totalDistributed)}`}
            />
            <MetricCard
              label="PENDING"
              value={`$${formatNumber(vault.pendingDistribution)}`}
              highlight
            />
            <MetricCard
              label="DISTRIBUTIONS"
              value={vault.distributionCount}
            />
          </div>
        </div>

        {/* Recent Distributions */}
        <div className="card-premium p-6">
          <h3 className="font-title text-2xl mb-4">Recent Distributions</h3>
          {!vault.distributions?.length ? (
            <p className="font-body text-text-secondary text-center py-8">
              NO DISTRIBUTIONS YET
            </p>
          ) : (
            <div className="space-y-3">
              {vault.distributions?.slice(0, 5).map((dist) => (
                <div
                  key={dist.id}
                  className="flex justify-between items-center py-3 border-b border-cream-dark last:border-0"
                >
                  <div>
                    <p className="font-stat">${formatNumber(dist.amount)}</p>
                    <p className="font-body text-xs text-text-muted">
                      {formatDistanceToNow(parseInt(dist.timestamp) * 1000, { addSuffix: true })}
                    </p>
                  </div>
                  <p className="font-body text-xs text-text-muted">
                    {((parseFloat(dist.totalClaimed) / parseFloat(dist.amount)) * 100).toFixed(0)}% CLAIMED
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Token Info */}
        <div className="card-premium p-6">
          <h3 className="font-title text-2xl mb-4">Token Info</h3>
          <div className="space-y-3">
            <InfoRow label="SYMBOL" value={vault.token.symbol} />
            <InfoRow label="SUPPLY" value="10,000" />
            <InfoRow label="HOLDERS" value={vault.token.holderCount || '0'} />
            <InfoRow
              label="CONTRACT"
              value={shortenAddress(vault.token.id)}
              link={`https://sepolia.mantlescan.xyz/address/${vault.token.id}`}
            />
          </div>
        </div>

        {/* Creator Info */}
        <div className="card-premium p-6">
          <h3 className="font-title text-2xl mb-4">Creator</h3>
          <div className="space-y-3">
            <InfoRow
              label="ADDRESS"
              value={shortenAddress(vault.creator)}
              link={`https://sepolia.mantlescan.xyz/address/${vault.creator}`}
            />
            <InfoRow
              label="CREATED"
              value={formatDistanceToNow(parseInt(vault.createdAt) * 1000, { addSuffix: true })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <p className="font-body text-xs text-text-muted mb-1">{label}</p>
      <p className={`font-stat text-2xl ${highlight ? 'text-tributary' : ''}`}>
        {value}
      </p>
    </div>
  )
}

function InfoRow({
  label,
  value,
  link,
}: {
  label: string
  value: string
  link?: string
}) {
  return (
    <div className="flex justify-between">
      <span className="font-body text-xs text-text-muted">{label}</span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-stat text-sm text-tributary hover:text-tributary-light"
        >
          {value}
        </a>
      ) : (
        <span className="font-stat text-sm">{value}</span>
      )}
    </div>
  )
}
