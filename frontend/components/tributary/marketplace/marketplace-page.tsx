'use client'

import { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarketplaceGrid } from './components/marketplace-grid'
import { VaultDetailDialog } from './components/vault-detail-dialog'
import {
  useTributaryVaults,
  useHighApyVaults,
  useNewVaults,
  useTrendingVaults,
} from './hooks/use-tributary-vaults'
import type { TributaryVault, MarketplaceTab, MarketplaceFilterState } from './types'

// =============================================================================
// Main Page Component
// =============================================================================

export function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('all')
  const [filters, setFilters] = useState<MarketplaceFilterState>({})
  const [selectedVault, setSelectedVault] = useState<TributaryVault | null>(null)

  // Fetch vaults for each tab
  const allVaults = useTributaryVaults(filters)
  const highApyVaults = useHighApyVaults()
  const newVaults = useNewVaults()
  const trendingVaults = useTrendingVaults()

  // Get active tab data
  const getTabData = useCallback(() => {
    switch (activeTab) {
      case 'highApy':
        return highApyVaults
      case 'new':
        return newVaults
      case 'trending':
        return trendingVaults
      default:
        return allVaults
    }
  }, [activeTab, allVaults, highApyVaults, newVaults, trendingVaults])

  const { data: vaults = [], isLoading, error } = getTabData()

  // Event handlers
  const handleVaultClick = useCallback((vault: TributaryVault) => {
    setSelectedVault(vault)
  }, [])

  const handleDialogClose = useCallback(() => {
    setSelectedVault(null)
  }, [])

  return (
    <div className="min-h-screen bg-river-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Royalty Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and invest in tokenized IP royalty vaults
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MarketplaceTab)}>
          <TabsList className="mb-6 bg-slate-800/60 border border-slate-700/50">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-tributary-600 data-[state=active]:text-white"
            >
              All Vaults
            </TabsTrigger>
            <TabsTrigger
              value="highApy"
              className="data-[state=active]:bg-tributary-600 data-[state=active]:text-white"
            >
              High APY
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="data-[state=active]:bg-tributary-600 data-[state=active]:text-white"
            >
              New
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="data-[state=active]:bg-tributary-600 data-[state=active]:text-white"
            >
              Trending
            </TabsTrigger>
          </TabsList>

          {/* Error state */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-red-400">Failed to load vaults. Please try again later.</p>
            </div>
          )}

          {/* Tab content */}
          <TabsContent value={activeTab} className="mt-0">
            <MarketplaceGrid
              vaults={vaults}
              isLoading={isLoading}
              onVaultClick={handleVaultClick}
            />
          </TabsContent>
        </Tabs>

        {/* Vault Detail Dialog */}
        <VaultDetailDialog
          vault={selectedVault}
          isOpen={!!selectedVault}
          onClose={handleDialogClose}
          onBuyTokens={(vault) => {
            // TODO: Navigate to purchase flow
            console.log('Buy tokens for vault:', vault.id)
          }}
        />
      </div>
    </div>
  )
}
