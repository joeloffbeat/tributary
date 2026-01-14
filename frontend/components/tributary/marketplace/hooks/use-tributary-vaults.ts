// Tributary Vaults Hook - Fetches and enriches vault data for marketplace
import { useQuery } from '@tanstack/react-query'
import { getAllVaults, getVaultInfo, getTokenInfo, getFloorPrice } from '@/lib/services/tributary'
import { fetchIPAssetById } from '@/lib/services/story-api-service'
import type { MarketplaceFilterState, TributaryVault, VaultSortOption } from '../types'

function calculateApy(totalDistributed: bigint, totalValue: bigint, ageInDays: number): number {
  if (totalValue === 0n || ageInDays === 0) return 0
  const annualizedReturn = (Number(totalDistributed) / Number(totalValue)) * (365 / ageInDays)
  return Math.round(annualizedReturn * 1000) / 10
}

function sortVaults(vaults: TributaryVault[], sortBy: VaultSortOption): TributaryVault[] {
  return [...vaults].sort((a, b) => {
    switch (sortBy) {
      case 'newest': return b.createdAt - a.createdAt
      case 'totalValue': return Number(b.totalValue - a.totalValue)
      case 'apy': return b.apy - a.apy
      case 'holders': return b.holderCount - a.holderCount
      default: return 0
    }
  })
}

function filterVaults(vaults: TributaryVault[], filters: MarketplaceFilterState): TributaryVault[] {
  let result = vaults
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(
      (v) =>
        v.tokenName.toLowerCase().includes(search) ||
        v.tokenSymbol.toLowerCase().includes(search) ||
        v.ipAsset?.nftMetadata?.name?.toLowerCase().includes(search)
    )
  }
  if (filters.minApy !== undefined) result = result.filter((v) => v.apy >= filters.minApy!)
  if (filters.maxPrice !== undefined) result = result.filter((v) => v.tokenPrice <= filters.maxPrice!)
  if (filters.onlyActive) result = result.filter((v) => v.isActive)
  return result
}

async function enrichVaultRecord(record: Awaited<ReturnType<typeof getAllVaults>>[0]): Promise<TributaryVault | null> {
  try {
    const [vaultInfo, tokenInfo, floorPrice, ipAsset] = await Promise.all([
      getVaultInfo(record.vault),
      getTokenInfo(record.token),
      getFloorPrice(record.token).catch(() => 0n),
      fetchIPAssetById(record.storyIPId).catch(() => null),
    ])
    const ageInDays = Math.max(1, Math.floor((Date.now() / 1000 - Number(record.createdAt)) / 86400))
    const apy = calculateApy(vaultInfo.totalDistributed, vaultInfo.totalDeposited, ageInDays)

    return {
      id: record.vault,
      address: record.vault,
      storyIPId: record.storyIPId,
      tokenAddress: record.token,
      tokenSymbol: tokenInfo.symbol,
      tokenName: tokenInfo.name,
      tokenDecimals: tokenInfo.decimals,
      totalSupply: tokenInfo.totalSupply,
      availableTokens: tokenInfo.totalSupply,
      tokenPrice: floorPrice,
      totalValue: vaultInfo.totalDeposited,
      totalDistributed: vaultInfo.totalDistributed,
      apy,
      holderCount: 0,
      creator: record.creator,
      ipAsset,
      isActive: record.isActive,
      createdAt: Number(record.createdAt),
    }
  } catch {
    return null
  }
}

export function useTributaryVaults(filters: MarketplaceFilterState = {}) {
  return useQuery({
    queryKey: ['tributary-vaults', filters],
    queryFn: async (): Promise<TributaryVault[]> => {
      const vaultRecords = await getAllVaults()
      const enrichedVaults = await Promise.all(vaultRecords.map(enrichVaultRecord))
      let vaults = enrichedVaults.filter((v): v is TributaryVault => v !== null)
      vaults = filterVaults(vaults, filters)
      vaults = sortVaults(vaults, filters.sortBy || 'newest')
      return vaults
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

export function useHighApyVaults() {
  return useTributaryVaults({ sortBy: 'apy', minApy: 10 })
}

export function useNewVaults() {
  return useTributaryVaults({ sortBy: 'newest' })
}

export function useTrendingVaults() {
  return useTributaryVaults({ sortBy: 'holders' })
}
