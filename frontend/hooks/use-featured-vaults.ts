import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'
import { fetchIPAssetById, getIPAssetImageUrl, getIPAssetDisplayName } from '@/lib/services/story-api-service'

const FEATURED_VAULTS_QUERY = `
  query FeaturedVaults($first: Int!) {
    vaults(
      first: $first
      orderBy: totalDeposited
      orderDirection: desc
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
      pool {
        id
        reserveQuote
        volumeQuote
      }
    }
  }
`

interface RawFeaturedVault {
  id: string
  token: { id: string; name: string; symbol: string }
  creator: string
  storyIPId: string
  dividendBps: string
  tradingFeeBps: string
  totalDeposited: string
  totalDistributed: string
  pool?: { id: string; reserveQuote: string; volumeQuote: string }
}

export interface FeaturedVault extends RawFeaturedVault {
  imageUrl?: string | null
  ipName?: string
}

interface FeaturedVaultsResponse {
  vaults: RawFeaturedVault[]
}

async function enrichVaultWithIPData(vault: RawFeaturedVault): Promise<FeaturedVault> {
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

export function useFeaturedVaults(limit: number = 6) {
  return useQuery({
    queryKey: ['featuredVaults', limit],
    queryFn: async () => {
      const data = await querySubgraph<FeaturedVaultsResponse>(FEATURED_VAULTS_QUERY, { first: limit })
      const enrichedVaults = await Promise.all(data.vaults.map(enrichVaultWithIPData))
      return enrichedVaults
    },
    staleTime: 30_000,
  })
}
