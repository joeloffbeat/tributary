'use client'

import { useState } from 'react'
import { useAllVaults, FilterState } from '@/hooks/use-all-vaults'
import { VaultCard } from '@/components/vault-card'
import { MarketplaceFilters } from '@/components/marketplace/filters'
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
            className="input-premium w-full pl-12"
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
        <div key={i} className="card-premium p-6 animate-pulse">
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
