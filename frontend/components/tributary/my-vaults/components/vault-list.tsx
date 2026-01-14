'use client'

import { Vault, SlidersHorizontal, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { VaultCard } from '@/components/tributary/shared/vault-card'
import type { VaultDisplayData } from '../hooks/use-my-vaults'

interface VaultListProps {
  vaults: VaultDisplayData[]
  isLoading: boolean
  sortBy: 'created' | 'value' | 'earnings'
  onSortChange: (sort: 'created' | 'value' | 'earnings') => void
  filterActive: boolean
  onFilterChange: (active: boolean) => void
  onCreateClick: () => void
  onVaultClick?: (vault: VaultDisplayData) => void
}

export function VaultList({
  vaults,
  isLoading,
  sortBy,
  onSortChange,
  filterActive,
  onFilterChange,
  onCreateClick,
  onVaultClick,
}: VaultListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 text-tributary-500 animate-spin" />
        <p className="text-river-400">Loading your vaults...</p>
      </div>
    )
  }

  // Empty state
  if (vaults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="w-20 h-20 rounded-full bg-river-800 flex items-center justify-center">
          <Vault className="h-10 w-10 text-river-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-river-100">No Vaults Yet</h3>
          <p className="text-river-400 max-w-sm">
            Create your first royalty vault to start tokenizing your IP earnings.
          </p>
        </div>
        <Button onClick={onCreateClick} className="bg-tributary-500 hover:bg-tributary-600">
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Vault
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-river-800/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-river-500" />
            <span className="text-sm text-river-400">{vaults.length} vaults</span>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="filterActive"
              checked={filterActive}
              onCheckedChange={onFilterChange}
              className="data-[state=checked]:bg-tributary-500"
            />
            <Label htmlFor="filterActive" className="text-sm text-river-400">
              Active only
            </Label>
          </div>
        </div>

        <Select value={sortBy} onValueChange={(v) => onSortChange(v as typeof sortBy)}>
          <SelectTrigger className="w-40 bg-river-900/50 border-river-700">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-river-900 border-river-700">
            <SelectItem value="created">Most Recent</SelectItem>
            <SelectItem value="value">Highest Value</SelectItem>
            <SelectItem value="earnings">Most Earnings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vault Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vaults.map((vaultData) => (
          <VaultCard
            key={vaultData.address}
            vault={{
              id: vaultData.address,
              name: vaultData.tokenInfo.name,
              symbol: vaultData.tokenInfo.symbol,
              totalValue: vaultData.vaultInfo.totalDeposited,
              tokenDecimals: vaultData.tokenInfo.decimals,
              apy: 0, // TODO: Calculate from distribution history
              holderCount: 0, // TODO: Fetch from subgraph
              creatorAddress: vaultData.vaultInfo.creator,
            }}
            onClick={() => onVaultClick?.(vaultData)}
          />
        ))}
      </div>
    </div>
  )
}
