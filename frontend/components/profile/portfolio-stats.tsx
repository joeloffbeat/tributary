'use client'

import { useUserPortfolioStats } from '@/hooks/use-user-portfolio-stats'
import { formatNumber } from '@/lib/utils'

export function PortfolioStats({ address }: { address: string }) {
  const { data: stats } = useUserPortfolioStats(address)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
      <StatCard
        label="PORTFOLIO VALUE"
        value={`$${formatNumber(stats?.portfolioValue || 0)}`}
      />
      <StatCard
        label="TOTAL INVESTED"
        value={`$${formatNumber(stats?.totalInvested || 0)}`}
      />
      <StatCard
        label="PENDING DIVIDENDS"
        value={`$${formatNumber(stats?.pendingDividends || 0)}`}
        highlight
      />
      <StatCard
        label="TOTAL CLAIMED"
        value={`$${formatNumber(stats?.totalClaimed || 0)}`}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="card-premium p-6">
      <p className="font-body text-xs text-text-muted mb-2">{label}</p>
      <p className={`font-stat text-3xl ${highlight ? 'text-tributary' : ''}`}>
        {value}
      </p>
    </div>
  )
}
