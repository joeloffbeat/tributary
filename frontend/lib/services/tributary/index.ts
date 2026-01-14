// =============================================================================
// Tributary Service Index
// =============================================================================
// Main entry point for Tributary contract interactions
// =============================================================================

// Re-export all read methods
export {
  publicClient,
  contracts,
  // Factory reads
  getVaultsByCreator,
  getVaultByIPId,
  getAllVaults,
  getVaultRecord,
  isValidVault,
  // Vault reads
  getVaultInfo,
  getDistribution,
  getPendingRewards,
  // Marketplace reads
  getActiveListing,
  getActiveListings,
  getListingsByToken,
  getFloorPrice,
  getRecentTrades,
  // Token reads
  getTokenBalance,
  getTokenAllowance,
  getTokenInfo,
} from './reads'

// Re-export all write methods
export {
  // Factory writes
  prepareCreateVault,
  // Vault writes
  prepareDepositRoyalty,
  prepareDistribute,
  prepareClaim,
  prepareClaimMultiple,
  // Marketplace writes
  prepareCreateListing,
  prepareBuy,
  prepareCancelListing,
  // Token writes
  prepareApprove,
} from './writes'

// Re-export chain config
export { mantleSepolia, getTributaryContracts } from '@/constants/tributary/chains'

// Re-export types
export type {
  CreateVaultParams,
  VaultRecord,
  VaultInfo,
  Distribution,
  CreateListingParams,
  Listing,
  TokenInfo,
  TributaryTxResult,
  CreateVaultResult,
} from '../tributary-types'
