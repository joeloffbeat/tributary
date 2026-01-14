'use client'

import { useState } from 'react'
import { Plus, Vault, TrendingUp, Coins, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { useAccount, ConnectButton } from '@/lib/web3'
import { Button } from '@/components/ui/button'
import { formatUnits } from 'viem'
import { cn } from '@/lib/utils'
import { VaultList } from './components/vault-list'
import { useMyVaults, type VaultDisplayData } from './hooks/use-my-vaults'

// Format USD from bigint (assuming 6 decimals USDC)
function formatUSD(value: bigint): string {
  const num = parseFloat(formatUnits(value, 6))
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
  className?: string
}

function StatCard({ icon, label, value, subValue, className }: StatCardProps) {
  return (
    <div
      className={cn('p-4 rounded-xl bg-river-800/50 border border-river-700/50', className)}
    >
      <div className="flex items-center gap-2 text-river-400 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono text-river-100">{value}</p>
      {subValue && <p className="text-xs text-river-500 mt-1">{subValue}</p>}
    </div>
  )
}

interface MyVaultsTabProps {
  onCreateVault?: () => void
  onSelectVault?: (vault: VaultDisplayData) => void
}

export function MyVaultsTab({ onCreateVault, onSelectVault }: MyVaultsTabProps) {
  const { isConnected } = useAccount()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const {
    vaults,
    stats,
    isLoading,
    error,
    refetch,
    sortBy,
    setSortBy,
    filterActive,
    setFilterActive,
  } = useMyVaults()

  const handleCreateClick = () => {
    if (onCreateVault) {
      onCreateVault()
    } else {
      setCreateDialogOpen(true)
    }
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="w-20 h-20 rounded-full bg-river-800 flex items-center justify-center">
          <Vault className="h-10 w-10 text-river-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-river-100">Connect Your Wallet</h3>
          <p className="text-river-400 max-w-sm">
            Connect your wallet to view and manage your royalty vaults.
          </p>
        </div>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-river-100">My Vaults</h2>
          <p className="text-river-400 text-sm mt-1">Manage your royalty token vaults</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-river-700 hover:bg-river-800"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>

          <Button onClick={handleCreateClick} className="bg-tributary-500 hover:bg-tributary-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Vault
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Vault className="h-4 w-4" />}
          label="Total Vaults"
          value={stats.totalVaults.toString()}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total Value"
          value={formatUSD(stats.totalValue)}
          className="bg-gradient-to-br from-tributary-500/10 to-cyan-500/5 border-tributary-500/30"
        />
        <StatCard
          icon={<Coins className="h-4 w-4" />}
          label="Total Earnings"
          value={formatUSD(stats.totalEarnings)}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Pending"
          value={formatUSD(stats.pendingDistributions)}
          subValue="Ready to distribute"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Vault List */}
      <VaultList
        vaults={vaults}
        isLoading={isLoading}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterActive={filterActive}
        onFilterChange={setFilterActive}
        onCreateClick={handleCreateClick}
        onVaultClick={onSelectVault}
      />

      {/* CreateVaultDialog placeholder - will be added by Prompt 29 */}
      {createDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-river-900 p-6 rounded-xl border border-river-700 max-w-md">
            <h3 className="text-lg font-semibold text-river-100 mb-2">Create Vault</h3>
            <p className="text-river-400 text-sm mb-4">
              CreateVaultDialog component not yet available. Use the onCreateVault prop.
            </p>
            <Button
              onClick={() => setCreateDialogOpen(false)}
              className="w-full bg-tributary-500 hover:bg-tributary-600"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
