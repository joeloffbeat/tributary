// =============================================================================
// Tributary Service - Write Methods (Transaction Preparation)
// =============================================================================
// Calldata preparation for wallet clients to execute transactions
// =============================================================================

import type { Address } from 'viem'
import { TRIBUTARY_CONTRACTS, mantleSepolia } from '@/constants/tributary/chains'
import { FACTORY_ABI, VAULT_ABI, TOKEN_ABI, MARKETPLACE_ABI } from '@/constants/tributary'
import type { CreateVaultParams, CreateListingParams } from '../tributary-types'

const contracts = TRIBUTARY_CONTRACTS[mantleSepolia.id]

// =============================================================================
// Factory Write Methods
// =============================================================================

export function prepareCreateVault(params: CreateVaultParams) {
  return {
    address: contracts.factory,
    abi: FACTORY_ABI,
    functionName: 'createVault' as const,
    args: [params] as const,
  }
}

// =============================================================================
// Vault Write Methods
// =============================================================================

export function prepareDepositRoyalty(vault: Address, amount: bigint) {
  return {
    address: vault,
    abi: VAULT_ABI,
    functionName: 'depositRoyalty' as const,
    args: [amount] as const,
  }
}

export function prepareDistribute(vault: Address) {
  return {
    address: vault,
    abi: VAULT_ABI,
    functionName: 'distribute' as const,
    args: [] as const,
  }
}

export function prepareClaim(vault: Address, distributionId: bigint) {
  return {
    address: vault,
    abi: VAULT_ABI,
    functionName: 'claim' as const,
    args: [distributionId] as const,
  }
}

export function prepareClaimMultiple(vault: Address, distributionIds: bigint[]) {
  return {
    address: vault,
    abi: VAULT_ABI,
    functionName: 'claimMultiple' as const,
    args: [distributionIds] as const,
  }
}

// =============================================================================
// Marketplace Write Methods
// =============================================================================

export function prepareCreateListing(params: CreateListingParams) {
  return {
    address: contracts.marketplace,
    abi: MARKETPLACE_ABI,
    functionName: 'createListing' as const,
    args: [params] as const,
  }
}

export function prepareBuy(listingId: bigint, amount: bigint) {
  return {
    address: contracts.marketplace,
    abi: MARKETPLACE_ABI,
    functionName: 'buy' as const,
    args: [listingId, amount] as const,
  }
}

export function prepareCancelListing(listingId: bigint) {
  return {
    address: contracts.marketplace,
    abi: MARKETPLACE_ABI,
    functionName: 'cancelListing' as const,
    args: [listingId] as const,
  }
}

// =============================================================================
// Token Write Methods
// =============================================================================

export function prepareApprove(token: Address, spender: Address, amount: bigint) {
  return {
    address: token,
    abi: TOKEN_ABI,
    functionName: 'approve' as const,
    args: [spender, amount] as const,
  }
}
