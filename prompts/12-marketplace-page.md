# Prompt 12: Marketplace Page

## Objective
Create the marketplace page to browse all royalty token vaults.

## Requirements

### Marketplace Page
File: `frontend/app/marketplace/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useAllVaults } from '@/hooks/use-all-vaults'
import { VaultCard } from '@/components/vault-card'
import { MarketplaceFilters, FilterState } from '@/components/marketplace/filters'
import { Search } from 'lucide-react'

export default function MarketplacePage() {
  const [filters, setFilters] = useState<FilterState>({})
  const [search, setSearch] = useState('')
  const { data: vaults, isLoading } = useAllVaults(filters)

  const filteredVaults = vaults?.filter((vault) =>
    vault.token.name.toLowerCase().includes(search.toLowerCase()) ||
    vault.token.symbol.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-title text-6xl mb-4">Marketplace</h1>
        <p className="font-body text-text-secondary">
          DISCOVER AND INVEST IN IP-BACKED ROYALTY TOKENS
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="SEARCH VAULTS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-12"
          />
        </div>

        {/* Filters */}
        <MarketplaceFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Results Count */}
      <p className="font-body text-sm text-text-secondary mb-6">
        {filteredVaults?.length || 0} VAULTS FOUND
      </p>

      {/* Vault Grid */}
      {isLoading ? (
        <VaultGridSkeleton />
      ) : filteredVaults?.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVaults?.map((vault) => (
            <VaultCard key={vault.id} vault={vault} />
          ))}
        </div>
      )}
    </div>
  )
}

function VaultGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-6 animate-pulse">
          <div className="h-32 bg-cream-dark rounded mb-4" />
          <div className="h-6 bg-cream-dark rounded w-3/4 mb-2" />
          <div className="h-4 bg-cream-dark rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <p className="font-body text-text-secondary mb-4">
        NO VAULTS FOUND MATCHING YOUR CRITERIA
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-secondary"
      >
        RESET FILTERS
      </button>
    </div>
  )
}
```

### Vault Card Component
File: `frontend/components/vault-card.tsx`

```tsx
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
    dividendBps: number
    tradingFeeBps: number
    totalDeposited: string
    pool?: {
      reserveQuote: string
      volumeQuote: string
      // Calculate price from reserves if available
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
      <div className="card-hover p-6 h-full flex flex-col">
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
        <div className="divider mb-6" />

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
            <p className="font-stat text-lg text-primary">
              {(vault.dividendBps / 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="font-body text-xs text-text-muted mb-1">TRADE FEE</p>
            <p className="font-stat text-lg">
              {(vault.tradingFeeBps / 100).toFixed(1)}%
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
```

### Marketplace Filters
File: `frontend/components/marketplace/filters.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Filter, ChevronDown } from 'lucide-react'

export interface FilterState {
  sortBy?: 'volume' | 'dividend' | 'newest' | 'price'
  minDividend?: number
  maxTradeFee?: number
}

interface FiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export function MarketplaceFilters({ filters, onChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        FILTERS
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-lg shadow-md p-4 z-10">
          {/* Sort By */}
          <div className="mb-4">
            <label className="font-body text-xs text-text-muted block mb-2">
              SORT BY
            </label>
            <select
              value={filters.sortBy || 'volume'}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
              className="input w-full"
            >
              <option value="volume">HIGHEST VOLUME</option>
              <option value="dividend">HIGHEST DIVIDEND</option>
              <option value="newest">NEWEST</option>
              <option value="price">LOWEST PRICE</option>
            </select>
          </div>

          {/* Min Dividend */}
          <div className="mb-4">
            <label className="font-body text-xs text-text-muted block mb-2">
              MIN DIVIDEND %
            </label>
            <input
              type="number"
              value={filters.minDividend || ''}
              onChange={(e) => onChange({ ...filters, minDividend: parseInt(e.target.value) || undefined })}
              placeholder="0"
              className="input w-full"
            />
          </div>

          {/* Max Trade Fee */}
          <div className="mb-4">
            <label className="font-body text-xs text-text-muted block mb-2">
              MAX TRADE FEE %
            </label>
            <input
              type="number"
              value={filters.maxTradeFee || ''}
              onChange={(e) => onChange({ ...filters, maxTradeFee: parseInt(e.target.value) || undefined })}
              placeholder="5"
              className="input w-full"
            />
          </div>

          {/* Reset */}
          <button
            onClick={() => onChange({})}
            className="font-body text-xs text-primary hover:text-primary-light"
          >
            RESET FILTERS
          </button>
        </div>
      )}
    </div>
  )
}
```

### All Vaults Hook
File: `frontend/hooks/use-all-vaults.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'
import { gql } from 'graphql-request'
import { FilterState } from '@/components/marketplace/filters'

const ALL_VAULTS_QUERY = gql`
  query AllVaults($orderBy: String!, $orderDirection: String!) {
    vaults(
      first: 100
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { isActive: true }
    ) {
      id
      token {
        id
        name
        symbol
      }
      creator
      storyIPId
      dividendBps
      tradingFeeBps
      totalDeposited
      totalDistributed
      createdAt
      pool {
        id
        reserveToken
        reserveQuote
        volumeQuote
      }
    }
  }
`

export function useAllVaults(filters: FilterState) {
  const orderBy = filters.sortBy === 'newest' ? 'createdAt' :
                  filters.sortBy === 'dividend' ? 'dividendBps' :
                  filters.sortBy === 'price' ? 'totalDeposited' : 'totalDeposited'

  return useQuery({
    queryKey: ['allVaults', filters],
    queryFn: async () => {
      const data = await querySubgraph<any>(ALL_VAULTS_QUERY, {
        orderBy,
        orderDirection: 'desc',
      })

      let vaults = data.vaults

      // Apply filters
      if (filters.minDividend) {
        vaults = vaults.filter((v: any) => v.dividendBps >= filters.minDividend! * 100)
      }
      if (filters.maxTradeFee) {
        vaults = vaults.filter((v: any) => v.tradingFeeBps <= filters.maxTradeFee! * 100)
      }

      return vaults
    },
  })
}
```

## Verification
- [ ] Marketplace loads all vaults
- [ ] Search filters by name/symbol
- [ ] Filters work correctly
- [ ] Vault cards show price + dividend
- [ ] Premium styling applied
- [ ] Responsive grid layout

## Files to Create
- `frontend/app/marketplace/page.tsx`
- `frontend/components/vault-card.tsx`
- `frontend/components/marketplace/filters.tsx`
- `frontend/hooks/use-all-vaults.ts`
