import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'
import { fetchIPAssetById, getIPAssetImageUrl, getIPAssetDisplayName } from '@/lib/services/story-api-service'

export interface FilterState {
  sortBy?: 'volume' | 'dividend' | 'newest' | 'price'
  minDividend?: number
  maxTradeFee?: number
}

const ALL_VAULTS_QUERY = `
  query AllVaults($orderBy: String!, $orderDirection: String!) {
    vaults(
      first: 100
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { isActive: true }
    ) {
      id
      token {
        id
        name
        symbol
      }
      creator
      storyIPId
      dividendBps
      tradingFeeBps
      totalDeposited
      totalDistributed
      createdAt
      pool {
        id
        reserveToken
        reserveQuote
        volumeQuote
      }
    }
  }
`

interface RawVaultData {
  id: string
  token: { id: string; name: string; symbol: string }
  creator: string
  storyIPId: string
  dividendBps: string
  tradingFeeBps: string
  totalDeposited: string
  totalDistributed: string
  createdAt: string
  pool?: { id: string; reserveToken: string; reserveQuote: string; volumeQuote: string }
}

export interface VaultData extends RawVaultData {
  imageUrl?: string | null
  ipName?: string
}

interface AllVaultsResponse {
  vaults: RawVaultData[]
}

async function enrichVaultWithIPData(vault: RawVaultData): Promise<VaultData> {
  if (!vault.storyIPId) {
    return vault
  }
  try {
    const ipAsset = await fetchIPAssetById(vault.storyIPId)
    return {
      ...vault,
      imageUrl: ipAsset ? getIPAssetImageUrl(ipAsset) : null,
      ipName: ipAsset ? getIPAssetDisplayName(ipAsset) : vault.token.name,
    }
  } catch {
    return vault
  }
}

export function useAllVaults(filters: FilterState) {
  const orderBy = filters.sortBy === 'newest' ? 'createdAt' :
                  filters.sortBy === 'dividend' ? 'dividendBps' :
                  filters.sortBy === 'price' ? 'totalDeposited' : 'totalDeposited'

  return useQuery({
    queryKey: ['allVaults', filters],
    queryFn: async () => {
      const data = await querySubgraph<AllVaultsResponse>(ALL_VAULTS_QUERY, {
        orderBy,
        orderDirection: 'desc',
      })

      let vaults = data.vaults

      // Apply filters
      if (filters.minDividend) {
        vaults = vaults.filter((v) => parseInt(v.dividendBps) >= filters.minDividend! * 100)
      }
      if (filters.maxTradeFee) {
        vaults = vaults.filter((v) => parseInt(v.tradingFeeBps) <= filters.maxTradeFee! * 100)
      }

      // Enrich with IP asset data (images)
      const enrichedVaults = await Promise.all(vaults.map(enrichVaultWithIPData))
      return enrichedVaults
    },
    staleTime: 30_000,
  })
}
