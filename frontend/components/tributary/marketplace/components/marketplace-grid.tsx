'use client'

import { motion } from 'framer-motion'
import { Vault, Waves } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { VaultCard } from '@/components/tributary/shared/vault-card'
import { getIPAssetImageUrl, getIPAssetDisplayName } from '@/lib/services/story-api-service'
import type { TributaryVault } from '../types'

// =============================================================================
// Types
// =============================================================================

interface MarketplaceGridProps {
  vaults: TributaryVault[]
  isLoading: boolean
  onVaultClick: (vault: TributaryVault) => void
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

// =============================================================================
// Skeleton Component
// =============================================================================

export function VaultCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-14 w-14 rounded-xl bg-slate-700/50" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32 bg-slate-700/50" />
          <Skeleton className="h-5 w-16 bg-slate-700/50" />
        </div>
      </div>

      {/* Value */}
      <div className="mb-4">
        <Skeleton className="h-4 w-20 mb-2 bg-slate-700/50" />
        <Skeleton className="h-8 w-28 bg-slate-700/50" />
      </div>

      {/* Stats */}
      <div className="flex justify-between mb-4">
        <Skeleton className="h-5 w-20 bg-slate-700/50" />
        <Skeleton className="h-5 w-16 bg-slate-700/50" />
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-700/50">
        <Skeleton className="h-4 w-40 bg-slate-700/50" />
      </div>
    </div>
  )
}

// =============================================================================
// Empty State Component
// =============================================================================

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4">
        <Waves className="h-8 w-8 text-tributary-500" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No Vaults Found</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        No royalty vaults match your current filters. Try adjusting your search or check back later
        for new listings.
      </p>
    </div>
  )
}

// =============================================================================
// Main Grid Component
// =============================================================================

export function MarketplaceGrid({ vaults, isLoading, onVaultClick }: MarketplaceGridProps) {
  // Loading state with skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <VaultCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Empty state
  if (vaults.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EmptyState />
      </div>
    )
  }

  // Vault grid with staggered animation
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {vaults.map((vault) => (
        <motion.div key={vault.id} variants={itemVariants}>
          <VaultCard
            vault={{
              id: vault.id,
              name: vault.ipAsset ? getIPAssetDisplayName(vault.ipAsset) : vault.tokenName,
              symbol: vault.tokenSymbol,
              imageUrl: vault.ipAsset ? getIPAssetImageUrl(vault.ipAsset) || undefined : undefined,
              totalValue: vault.totalValue,
              tokenDecimals: vault.tokenDecimals,
              apy: vault.apy,
              holderCount: vault.holderCount,
              creatorAddress: vault.creator,
            }}
            onClick={() => onVaultClick(vault)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
