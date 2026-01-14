# Prompt 13: Profile Page

## Objective
Create the profile page showing user's IPs from Story Protocol, holdings, and managed vaults.

## Requirements

### Profile Page
File: `frontend/app/profile/page.tsx`

```tsx
'use client'

import { useAccount, ConnectButton } from '@/lib/web3'
import { useUserIPs } from '@/hooks/use-user-ips'
import { useUserHoldings } from '@/hooks/use-user-holdings'
import { useUserVaults } from '@/hooks/use-user-vaults'
import { IPCard } from '@/components/profile/ip-card'
import { HoldingRow } from '@/components/profile/holding-row'
import { ManagedVaultRow } from '@/components/profile/managed-vault-row'
import { PortfolioStats } from '@/components/profile/portfolio-stats'
import { formatNumber, shortenAddress } from '@/lib/utils'
import Link from 'next/link'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="font-title text-6xl mb-6">Profile</h1>
        <p className="font-body text-text-secondary mb-8">
          CONNECT YOUR WALLET TO VIEW YOUR PROFILE
        </p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-title text-6xl mb-2">Profile</h1>
          <p className="font-body text-text-secondary">
            {shortenAddress(address!)}
          </p>
        </div>
      </div>

      {/* Portfolio Stats */}
      <PortfolioStats address={address!} />

      {/* My IPs Section */}
      <MyIPsSection address={address!} />

      {/* My Holdings Section */}
      <MyHoldingsSection address={address!} />

      {/* My Vaults Section (Creator) */}
      <MyVaultsSection address={address!} />
    </div>
  )
}

function MyIPsSection({ address }: { address: string }) {
  const { data: ips, isLoading } = useUserIPs(address)

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-title text-4xl mb-1">My IPs</h2>
          <p className="font-body text-xs text-text-secondary">
            YOUR STORY PROTOCOL INTELLECTUAL PROPERTIES
          </p>
        </div>
        <Link href="/create" className="btn-primary">
          CREATE VAULT
        </Link>
      </div>

      <div className="divider mb-6" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-20 bg-cream-dark rounded" />
            </div>
          ))}
        </div>
      ) : ips?.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-body text-text-secondary mb-4">
            NO IPS FOUND ON STORY PROTOCOL
          </p>
          <a
            href="https://app.story.foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-primary hover:text-primary-light"
          >
            REGISTER YOUR IP →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ips?.map((ip) => (
            <IPCard key={ip.id} ip={ip} />
          ))}
        </div>
      )}
    </section>
  )
}

function MyHoldingsSection({ address }: { address: string }) {
  const { data: holdings, isLoading } = useUserHoldings(address)

  const totalPending = holdings?.reduce(
    (sum, h) => sum + parseFloat(h.pendingRewards || '0'),
    0
  ) || 0

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-title text-4xl mb-1">My Holdings</h2>
          <p className="font-body text-xs text-text-secondary">
            ROYALTY TOKENS YOU OWN
          </p>
        </div>
        {totalPending > 0 && (
          <button className="btn-primary">
            CLAIM ALL (${formatNumber(totalPending)})
          </button>
        )}
      </div>

      <div className="divider mb-6" />

      {isLoading ? (
        <div className="card">
          <div className="animate-pulse p-6">
            <div className="h-12 bg-cream-dark rounded mb-4" />
            <div className="h-12 bg-cream-dark rounded mb-4" />
            <div className="h-12 bg-cream-dark rounded" />
          </div>
        </div>
      ) : holdings?.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-body text-text-secondary mb-4">
            YOU DON'T OWN ANY ROYALTY TOKENS YET
          </p>
          <Link href="/marketplace" className="btn-secondary">
            BROWSE MARKETPLACE
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 p-4 bg-cream-dark/50 font-body text-xs text-text-muted">
            <div className="col-span-2">TOKEN</div>
            <div className="text-right">BALANCE</div>
            <div className="text-right">VALUE</div>
            <div className="text-right">PENDING</div>
            <div className="text-right">ACTIONS</div>
          </div>

          {/* Rows */}
          {holdings?.map((holding) => (
            <HoldingRow key={holding.id} holding={holding} />
          ))}
        </div>
      )}
    </section>
  )
}

function MyVaultsSection({ address }: { address: string }) {
  const { data: vaults, isLoading } = useUserVaults(address)

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-title text-4xl mb-1">My Vaults</h2>
          <p className="font-body text-xs text-text-secondary">
            VAULTS YOU CREATED
          </p>
        </div>
      </div>

      <div className="divider mb-6" />

      {isLoading ? (
        <div className="card animate-pulse p-6">
          <div className="h-16 bg-cream-dark rounded" />
        </div>
      ) : vaults?.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-body text-text-secondary">
            YOU HAVEN'T CREATED ANY VAULTS YET
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 p-4 bg-cream-dark/50 font-body text-xs text-text-muted">
            <div className="col-span-2">VAULT</div>
            <div className="text-right">REVENUE</div>
            <div className="text-right">DISTRIBUTED</div>
            <div className="text-right">PENDING</div>
            <div className="text-right">ACTIONS</div>
          </div>

          {/* Rows */}
          {vaults?.map((vault) => (
            <ManagedVaultRow key={vault.id} vault={vault} />
          ))}
        </div>
      )}
    </section>
  )
}
```

### Portfolio Stats Component
File: `frontend/components/profile/portfolio-stats.tsx`

```tsx
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
    <div className="card p-6">
      <p className="font-body text-xs text-text-muted mb-2">{label}</p>
      <p className={`font-stat text-3xl ${highlight ? 'text-primary' : ''}`}>
        {value}
      </p>
    </div>
  )
}
```

### IP Card Component
File: `frontend/components/profile/ip-card.tsx`

```tsx
'use client'

import Link from 'next/link'
import { CheckCircle, PlusCircle } from 'lucide-react'

interface IPCardProps {
  ip: {
    id: string
    name: string
    type: string
    hasVault: boolean
    vaultAddress?: string
  }
}

export function IPCard({ ip }: IPCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-title text-2xl mb-1">{ip.name}</h3>
          <p className="font-body text-xs text-text-muted">{ip.type}</p>
        </div>
        {ip.hasVault ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : null}
      </div>

      {ip.hasVault ? (
        <Link
          href={`/vault/${ip.vaultAddress}`}
          className="btn-secondary w-full text-center"
        >
          MANAGE VAULT
        </Link>
      ) : (
        <Link
          href={`/create?ip=${ip.id}`}
          className="btn-primary w-full text-center flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          CREATE VAULT
        </Link>
      )}
    </div>
  )
}
```

### Holding Row Component
File: `frontend/components/profile/holding-row.tsx`

```tsx
'use client'

import Link from 'next/link'
import { formatNumber } from '@/lib/utils'

interface HoldingRowProps {
  holding: {
    id: string
    token: {
      id: string
      name: string
      symbol: string
    }
    balance: string
    value: number
    pendingRewards: string
  }
}

export function HoldingRow({ holding }: HoldingRowProps) {
  const hasPending = parseFloat(holding.pendingRewards) > 0

  return (
    <div className="grid grid-cols-6 gap-4 p-4 border-t border-cream-dark items-center">
      <div className="col-span-2">
        <p className="font-title text-xl">{holding.token.name}</p>
        <p className="font-body text-xs text-text-muted">{holding.token.symbol}</p>
      </div>
      <div className="text-right">
        <p className="font-stat">{formatNumber(holding.balance)}</p>
      </div>
      <div className="text-right">
        <p className="font-stat">${formatNumber(holding.value)}</p>
      </div>
      <div className="text-right">
        <p className={`font-stat ${hasPending ? 'text-primary' : ''}`}>
          ${formatNumber(holding.pendingRewards)}
        </p>
      </div>
      <div className="text-right flex gap-2 justify-end">
        {hasPending && (
          <button className="btn-primary py-2 px-3 text-xs">
            CLAIM
          </button>
        )}
        <Link
          href={`/trade/${holding.token.id}`}
          className="btn-secondary py-2 px-3 text-xs"
        >
          TRADE
        </Link>
      </div>
    </div>
  )
}
```

### User IPs Hook (Story Protocol)
File: `frontend/hooks/use-user-ips.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { getStoryProtocolIPs } from '@/lib/services/story-protocol'
import { querySubgraph } from '@/lib/services/subgraph'
import { gql } from 'graphql-request'

// Query to check which IPs already have vaults
const VAULTS_BY_CREATOR_QUERY = gql`
  query VaultsByCreator($creator: String!) {
    vaults(where: { creator: $creator }) {
      id
      storyIPId
    }
  }
`

export function useUserIPs(address: string) {
  return useQuery({
    queryKey: ['userIPs', address],
    queryFn: async () => {
      // Get IPs from Story Protocol
      const ips = await getStoryProtocolIPs(address)

      // Get existing vaults for this creator
      const { vaults } = await querySubgraph<any>(VAULTS_BY_CREATOR_QUERY, {
        creator: address.toLowerCase(),
      })

      // Map vaults to IPs
      const vaultMap = new Map(vaults.map((v: any) => [v.storyIPId, v.id]))

      return ips.map((ip: any) => ({
        id: ip.id,
        name: ip.title || ip.name || `IP #${ip.id.slice(0, 8)}`,
        type: ip.ipType || 'IP Asset',
        hasVault: vaultMap.has(ip.id),
        vaultAddress: vaultMap.get(ip.id),
      }))
    },
    enabled: !!address,
  })
}
```

### User Holdings Hook
File: `frontend/hooks/use-user-holdings.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'
import { gql } from 'graphql-request'

const USER_HOLDINGS_QUERY = gql`
  query UserHoldings($holder: String!) {
    tokenHolders(where: { holder: $holder, balance_gt: "0" }) {
      id
      token {
        id
        name
        symbol
        vault {
          id
          pool {
            reserveQuote
          }
        }
      }
      balance
      totalClaimed
    }
  }
`

export function useUserHoldings(address: string) {
  return useQuery({
    queryKey: ['userHoldings', address],
    queryFn: async () => {
      const data = await querySubgraph<any>(USER_HOLDINGS_QUERY, {
        holder: address.toLowerCase(),
      })

      return data.tokenHolders.map((h: any) => {
        // Calculate value from pool price
        const price = h.token.vault?.pool
          ? parseFloat(h.token.vault.pool.reserveQuote) / 10000
          : 0
        const value = parseFloat(h.balance) * price

        return {
          id: h.id,
          token: h.token,
          balance: h.balance,
          value,
          pendingRewards: '0', // TODO: Calculate from contract
        }
      })
    },
    enabled: !!address,
  })
}
```

## Verification
- [ ] Profile page shows user's IPs from Story Protocol
- [ ] Holdings table displays correctly
- [ ] Managed vaults section works
- [ ] Create Vault button links with IP pre-selected
- [ ] Claim functionality works
- [ ] Premium styling applied

## Files to Create
- `frontend/app/profile/page.tsx`
- `frontend/components/profile/portfolio-stats.tsx`
- `frontend/components/profile/ip-card.tsx`
- `frontend/components/profile/holding-row.tsx`
- `frontend/components/profile/managed-vault-row.tsx`
- `frontend/hooks/use-user-ips.ts`
- `frontend/hooks/use-user-holdings.ts`
- `frontend/hooks/use-user-vaults.ts`
- `frontend/hooks/use-user-portfolio-stats.ts`
- `frontend/lib/services/story-protocol.ts`
