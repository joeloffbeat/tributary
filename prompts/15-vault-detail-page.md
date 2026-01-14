# Prompt 15: Vault Detail Page

## Objective
Create the vault detail page with tabs for overview, analytics, holders, and trade history.

## Requirements

### Vault Detail Page
File: `frontend/app/vault/[address]/page.tsx`

```tsx
'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useVaultDetail } from '@/hooks/use-vault-detail'
import { VaultHeader } from './components/vault-header'
import { VaultTabs } from './components/vault-tabs'

export default function VaultDetailPage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = use(params)
  const { data: vault, isLoading, error } = useVaultDetail(address)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="font-body text-text-secondary mt-4">LOADING VAULT...</p>
      </div>
    )
  }

  if (error || !vault) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="font-body text-text-secondary mb-4">VAULT NOT FOUND</p>
        <Link href="/marketplace" className="btn-secondary">
          BACK TO MARKETPLACE
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Back Link */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 font-body text-sm text-text-secondary hover:text-primary mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        BACK TO MARKETPLACE
      </Link>

      {/* Header */}
      <VaultHeader vault={vault} />

      {/* Tabs */}
      <VaultTabs vault={vault} />
    </div>
  )
}
```

### Vault Header Component
File: `frontend/app/vault/[address]/components/vault-header.tsx`

```tsx
'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import { formatNumber, shortenAddress } from '@/lib/utils'

interface VaultHeaderProps {
  vault: any
}

export function VaultHeader({ vault }: VaultHeaderProps) {
  const price = vault.pool
    ? parseFloat(vault.pool.reserveQuote) / 10000
    : vault.initialPrice || 0

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
              className="text-primary hover:text-primary-light inline-flex items-center gap-1"
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
          value={`${(vault.dividendBps / 100).toFixed(1)}%`}
          valueColor="text-primary"
        />
        <StatCard
          label="TRADE FEE"
          value={`${(vault.tradingFeeBps / 100).toFixed(1)}%`}
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
  icon?: any
}) {
  return (
    <div className="card p-4">
      <p className="font-body text-xs text-text-muted mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${valueColor}`} />}
        <p className={`font-stat text-xl ${valueColor}`}>{value}</p>
      </div>
    </div>
  )
}
```

### Vault Tabs Component
File: `frontend/app/vault/[address]/components/vault-tabs.tsx`

```tsx
'use client'

import { useState } from 'react'
import { OverviewTab } from '../tabs/overview-tab'
import { AnalyticsTab } from '../tabs/analytics-tab'
import { HoldersTab } from '../tabs/holders-tab'
import { TradeHistoryTab } from '../tabs/trade-history-tab'

const TABS = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'holders', label: 'HOLDERS' },
  { id: 'history', label: 'TRADE HISTORY' },
]

interface VaultTabsProps {
  vault: any
}

export function VaultTabs({ vault }: VaultTabsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex gap-1 border-b border-cream-dark mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-body text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab vault={vault} />}
        {activeTab === 'analytics' && <AnalyticsTab vault={vault} />}
        {activeTab === 'holders' && <HoldersTab vault={vault} />}
        {activeTab === 'history' && <TradeHistoryTab vault={vault} />}
      </div>
    </div>
  )
}
```

### Overview Tab
File: `frontend/app/vault/[address]/tabs/overview-tab.tsx`

```tsx
'use client'

import { formatNumber, shortenAddress } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export function OverviewTab({ vault }: { vault: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Metrics */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6">
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
        <div className="card p-6">
          <h3 className="font-title text-2xl mb-4">Recent Distributions</h3>
          {vault.distributions?.length === 0 ? (
            <p className="font-body text-text-secondary text-center py-8">
              NO DISTRIBUTIONS YET
            </p>
          ) : (
            <div className="space-y-3">
              {vault.distributions?.slice(0, 5).map((dist: any) => (
                <div
                  key={dist.id}
                  className="flex justify-between items-center py-3 border-b border-cream-dark last:border-0"
                >
                  <div>
                    <p className="font-stat">${formatNumber(dist.amount)}</p>
                    <p className="font-body text-xs text-text-muted">
                      {formatDistanceToNow(dist.timestamp * 1000, { addSuffix: true })}
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
        <div className="card p-6">
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
        <div className="card p-6">
          <h3 className="font-title text-2xl mb-4">Creator</h3>
          <div className="space-y-3">
            <InfoRow
              label="ADDRESS"
              value={shortenAddress(vault.creator)}
              link={`https://sepolia.mantlescan.xyz/address/${vault.creator}`}
            />
            <InfoRow
              label="CREATED"
              value={formatDistanceToNow(vault.createdAt * 1000, { addSuffix: true })}
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
      <p className={`font-stat text-2xl ${highlight ? 'text-primary' : ''}`}>
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
          className="font-stat text-sm text-primary hover:text-primary-light"
        >
          {value}
        </a>
      ) : (
        <span className="font-stat text-sm">{value}</span>
      )}
    </div>
  )
}
```

### Holders Tab
File: `frontend/app/vault/[address]/tabs/holders-tab.tsx`

```tsx
'use client'

import { useVaultHolders } from '@/hooks/use-vault-holders'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatNumber, shortenAddress } from '@/lib/utils'

const COLORS = ['#167a5f', '#1a9e7a', '#0f5c47', '#e5e1d6', '#9a9a9a']

export function HoldersTab({ vault }: { vault: any }) {
  const { data: holders, isLoading } = useVaultHolders(vault.token.id)

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-cream-dark rounded" />
  }

  const chartData = holders?.slice(0, 5).map((h, i) => ({
    name: shortenAddress(h.address),
    value: h.percentage,
  })) || []

  const others = holders?.slice(5).reduce((sum, h) => sum + h.percentage, 0) || 0
  if (others > 0) {
    chartData.push({ name: 'Others', value: others })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="card p-6">
        <h3 className="font-title text-2xl mb-4">Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name} (${value.toFixed(1)}%)`}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="font-body text-xs text-text-muted text-center mt-4">
          {holders?.length || 0} UNIQUE HOLDERS
        </p>
      </div>

      {/* Holders Table */}
      <div className="card p-6">
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
                  className="font-body text-sm text-primary hover:text-primary-light"
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
```

### Vault Detail Hook
File: `frontend/hooks/use-vault-detail.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'
import { gql } from 'graphql-request'

const VAULT_DETAIL_QUERY = gql`
  query VaultDetail($id: ID!) {
    vault(id: $id) {
      id
      token {
        id
        name
        symbol
        totalSupply
        holderCount
      }
      creator
      storyIPId
      dividendBps
      tradingFeeBps
      totalDeposited
      totalDistributed
      pendingDistribution
      distributionCount
      createdAt
      isActive
      distributions(first: 10, orderBy: timestamp, orderDirection: desc) {
        id
        amount
        totalClaimed
        timestamp
      }
      pool {
        id
        reserveToken
        reserveQuote
        volumeQuote
      }
    }
  }
`

export function useVaultDetail(address: string) {
  return useQuery({
    queryKey: ['vaultDetail', address],
    queryFn: async () => {
      const data = await querySubgraph<any>(VAULT_DETAIL_QUERY, {
        id: address.toLowerCase(),
      })
      return data.vault
    },
    enabled: !!address,
  })
}
```

## Verification
- [ ] Vault detail page loads correctly
- [ ] Header shows all stats
- [ ] All tabs work and show data
- [ ] Holders tab shows pie chart + table
- [ ] Trade history tab shows recent trades
- [ ] Links to trade page work
- [ ] Premium styling applied

## Files to Create
- `frontend/app/vault/[address]/page.tsx`
- `frontend/app/vault/[address]/components/vault-header.tsx`
- `frontend/app/vault/[address]/components/vault-tabs.tsx`
- `frontend/app/vault/[address]/tabs/overview-tab.tsx`
- `frontend/app/vault/[address]/tabs/analytics-tab.tsx`
- `frontend/app/vault/[address]/tabs/holders-tab.tsx`
- `frontend/app/vault/[address]/tabs/trade-history-tab.tsx`
- `frontend/hooks/use-vault-detail.ts`
- `frontend/hooks/use-vault-holders.ts`
