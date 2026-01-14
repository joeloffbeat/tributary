// =============================================================================
// Tributary Service Types
// =============================================================================
// TypeScript types for Tributary contracts
// =============================================================================

import type { Address, Hash, Hex } from 'viem'

// =============================================================================
// Factory Types
// =============================================================================

export interface CreateVaultParams {
  storyIPId: Hex
  tokenName: string
  tokenSymbol: string
  totalSupply: bigint
  creatorAllocation: bigint
  paymentToken: Address
}

export interface VaultRecord {
  vault: Address
  token: Address
  creator: Address
  storyIPId: Hex
  createdAt: bigint
  isActive: boolean
}

// =============================================================================
// Vault Types
// =============================================================================

export interface VaultInfo {
  storyIPId: Hex
  creator: Address
  royaltyToken: Address
  paymentToken: Address
  totalDeposited: bigint
  totalDistributed: bigint
  pendingDistribution: bigint
  lastDistributionTime: bigint
  isActive: boolean
}

export interface Distribution {
  snapshotId: bigint
  amount: bigint
  timestamp: bigint
  totalClaimed: bigint
}

// =============================================================================
// Marketplace Types
// =============================================================================

export interface CreateListingParams {
  royaltyToken: Address
  amount: bigint
  pricePerToken: bigint
  paymentToken: Address
  duration: bigint
}

export interface Listing {
  listingId: bigint
  seller: Address
  royaltyToken: Address
  vault: Address
  amount: bigint
  pricePerToken: bigint
  paymentToken: Address
  sold: bigint
  isActive: boolean
  isPrimarySale: boolean
  createdAt: bigint
  expiresAt: bigint
}

// =============================================================================
// Token Types
// =============================================================================

export interface TokenInfo {
  address: Address
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
  vault: Address
  storyIPId: Hex
  creator: Address
}

// =============================================================================
// Transaction Types
// =============================================================================

export interface TributaryTxResult {
  hash: Hash
  success: boolean
}

export interface CreateVaultResult {
  vault: Address
  token: Address
  hash: Hash
}
