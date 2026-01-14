// =============================================================================
// Tributary Marketplace Types
// =============================================================================

import type { Address, Hex } from 'viem'
import type { StoryIPAsset } from '@/lib/services/story-api-service'

// =============================================================================
// Vault Types
// =============================================================================

export interface TributaryVault {
  id: string
  address: Address
  storyIPId: Hex

  // Token info
  tokenAddress: Address
  tokenSymbol: string
  tokenName: string
  tokenDecimals: number
  totalSupply: bigint
  availableTokens: bigint
  tokenPrice: bigint // Price per token in USDC (6 decimals)

  // Vault metrics
  totalValue: bigint // Total deposited royalties
  totalDistributed: bigint
  apy: number // Calculated APY percentage
  holderCount: number

  // Creator info
  creator: Address
  creatorName?: string

  // IP Asset data (from Story Protocol)
  ipAsset?: StoryIPAsset | null

  // Status
  isActive: boolean
  createdAt: number
}

export interface VaultHolder {
  address: Address
  balance: bigint
  percentage: number
  unclaimedRewards: bigint
}

// =============================================================================
// Filter Types
// =============================================================================

export type VaultSortOption = 'newest' | 'totalValue' | 'apy' | 'holders'

export interface MarketplaceFilterState {
  search?: string
  sortBy?: VaultSortOption
  minApy?: number
  maxPrice?: bigint
  onlyActive?: boolean
}

// =============================================================================
// Tab Types
// =============================================================================

export type MarketplaceTab = 'all' | 'highApy' | 'new' | 'trending'
