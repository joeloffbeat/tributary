// =============================================================================
// Tributary Service - Read Methods
// =============================================================================
// Read-only methods for querying Tributary contracts
// =============================================================================

import { createPublicClient, http, type Address, type Hex } from 'viem'
import { mantleSepolia, TRIBUTARY_CONTRACTS } from '@/constants/tributary/chains'
import { FACTORY_ABI, VAULT_ABI, TOKEN_ABI, MARKETPLACE_ABI } from '@/constants/tributary'
import type { VaultRecord, VaultInfo, Distribution, Listing, TokenInfo } from '../tributary-types'

// =============================================================================
// Client Setup
// =============================================================================

export const publicClient = createPublicClient({
  chain: mantleSepolia,
  transport: http(),
})

export const contracts = TRIBUTARY_CONTRACTS[mantleSepolia.id]

// =============================================================================
// Factory Read Methods
// =============================================================================

export async function getVaultsByCreator(creator: Address): Promise<Address[]> {
  const result = await publicClient.readContract({
    address: contracts.factory,
    abi: FACTORY_ABI,
    functionName: 'getVaultsByCreator',
    args: [creator],
  })
  return [...result]
}

export async function getVaultByIPId(storyIPId: Hex): Promise<Address> {
  return publicClient.readContract({
    address: contracts.factory,
    abi: FACTORY_ABI,
    functionName: 'getVaultByIPId',
    args: [storyIPId],
  })
}

export async function getAllVaults(): Promise<VaultRecord[]> {
  const records = await publicClient.readContract({
    address: contracts.factory,
    abi: FACTORY_ABI,
    functionName: 'getAllVaults',
  })
  return records.map((r) => ({
    vault: r.vault,
    token: r.token,
    creator: r.creator,
    storyIPId: r.storyIPId,
    createdAt: r.createdAt,
    isActive: r.isActive,
  }))
}

export async function getVaultRecord(vault: Address): Promise<VaultRecord> {
  const r = await publicClient.readContract({
    address: contracts.factory,
    abi: FACTORY_ABI,
    functionName: 'getVaultRecord',
    args: [vault],
  })
  return {
    vault: r.vault,
    token: r.token,
    creator: r.creator,
    storyIPId: r.storyIPId,
    createdAt: r.createdAt,
    isActive: r.isActive,
  }
}

export async function isValidVault(vault: Address): Promise<boolean> {
  return publicClient.readContract({
    address: contracts.factory,
    abi: FACTORY_ABI,
    functionName: 'isValidVault',
    args: [vault],
  })
}

// =============================================================================
// Vault Read Methods
// =============================================================================

export async function getVaultInfo(vault: Address): Promise<VaultInfo> {
  const info = await publicClient.readContract({
    address: vault,
    abi: VAULT_ABI,
    functionName: 'getVaultInfo',
  })
  return {
    storyIPId: info.storyIPId,
    creator: info.creator,
    royaltyToken: info.royaltyToken,
    paymentToken: info.paymentToken,
    totalDeposited: info.totalDeposited,
    totalDistributed: info.totalDistributed,
    pendingDistribution: info.pendingDistribution,
    lastDistributionTime: info.lastDistributionTime,
    isActive: info.isActive,
  }
}

export async function getDistribution(vault: Address, distributionId: bigint): Promise<Distribution> {
  const d = await publicClient.readContract({
    address: vault,
    abi: VAULT_ABI,
    functionName: 'getDistribution',
    args: [distributionId],
  })
  return {
    snapshotId: d.snapshotId,
    amount: d.amount,
    timestamp: d.timestamp,
    totalClaimed: d.totalClaimed,
  }
}

export async function getPendingRewards(vault: Address, holder: Address): Promise<bigint> {
  return publicClient.readContract({
    address: vault,
    abi: VAULT_ABI,
    functionName: 'pendingRewards',
    args: [holder],
  })
}

// =============================================================================
// Marketplace Read Methods
// =============================================================================

export async function getActiveListing(listingId: bigint): Promise<Listing> {
  const l = await publicClient.readContract({
    address: contracts.marketplace,
    abi: MARKETPLACE_ABI,
    functionName: 'getActiveListing',
    args: [listingId],
  })
  return {
    listingId: l.listingId,
    seller: l.seller,
    royaltyToken: l.royaltyToken,
    vault: l.vault,
    amount: l.amount,
    pricePerToken: l.pricePerToken,
    paymentToken: l.paymentToken,
    sold: l.sold,
    isActive: l.isActive,
    isPrimarySale: l.isPrimarySale,
    createdAt: l.createdAt,
    expiresAt: l.expiresAt,
  }
}

export async function getListingsByToken(token: Address): Promise<Listing[]> {
  const listings = await publicClient.readContract({
    address: contracts.marketplace,
    abi: MARKETPLACE_ABI,
    functionName: 'getListingsByToken',
    args: [token],
  })
  return listings.map((l) => ({
    listingId: l.listingId,
    seller: l.seller,
    royaltyToken: l.royaltyToken,
    vault: l.vault,
    amount: l.amount,
    pricePerToken: l.pricePerToken,
    paymentToken: l.paymentToken,
    sold: l.sold,
    isActive: l.isActive,
    isPrimarySale: l.isPrimarySale,
    createdAt: l.createdAt,
    expiresAt: l.expiresAt,
  }))
}

export async function getFloorPrice(token: Address): Promise<bigint> {
  return publicClient.readContract({
    address: contracts.marketplace,
    abi: MARKETPLACE_ABI,
    functionName: 'getFloorPrice',
    args: [token],
  })
}

export async function getActiveListings(): Promise<Listing[]> {
  // Get all vaults, then aggregate listings from each vault's token
  const vaults = await getAllVaults()
  const allListings: Listing[] = []

  for (const vault of vaults) {
    if (!vault.isActive) continue
    try {
      const listings = await getListingsByToken(vault.token)
      const activeListings = listings.filter((l) => l.isActive && l.amount > l.sold)
      allListings.push(...activeListings)
    } catch {
      // Skip vaults with no listings
    }
  }

  return allListings
}

export interface Trade {
  id: string
  listingId: bigint
  seller: Address
  buyer: Address
  royaltyToken: Address
  amount: bigint
  pricePerToken: bigint
  timestamp: number
  txHash: string
}

export async function getRecentTrades(): Promise<Trade[]> {
  // For now return empty array - would need event indexing or subgraph
  // This is a placeholder until subgraph integration is complete
  return []
}

// =============================================================================
// Token Read Methods
// =============================================================================

export async function getTokenBalance(token: Address, holder: Address): Promise<bigint> {
  return publicClient.readContract({
    address: token,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [holder],
  })
}

export async function getTokenAllowance(token: Address, owner: Address, spender: Address): Promise<bigint> {
  return publicClient.readContract({
    address: token,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: [owner, spender],
  })
}

export async function getTokenInfo(token: Address): Promise<TokenInfo> {
  const [name, symbol, decimals, totalSupply, vault, storyIPId, creator] = await Promise.all([
    publicClient.readContract({ address: token, abi: TOKEN_ABI, functionName: 'name' }),
    publicClient.readContract({ address: token, abi: TOKEN_ABI, functionName: 'symbol' }),
    publicClient.readContract({ address: token, abi: TOKEN_ABI, functionName: 'decimals' }),
    publicClient.readContract({ address: token, abi: TOKEN_ABI, functionName: 'totalSupply' }),
    publicClient.readContract({ address: token, abi: TOKEN_ABI, functionName: 'vault' }),
    publicClient.readContract({ address: token, abi: TOKEN_ABI, functionName: 'storyIPId' }),
    publicClient.readContract({ address: token, abi: TOKEN_ABI, functionName: 'creator' }),
  ])
  return { address: token, name, symbol, decimals, totalSupply, vault, storyIPId, creator }
}
