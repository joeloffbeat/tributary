import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'
import { fetchIPAssetById, getIPAssetImageUrl, getIPAssetDisplayName, type StoryIPAsset } from '@/lib/services/story-api-service'

const ALL_POOLS_QUERY = `
  query AllPools {
    pools(first: 100, orderBy: volumeQuote, orderDirection: desc) {
      id
      token {
        id
        name
        symbol
      }
      vault {
        id
        storyIPId
        dividendBps
        tradingFeeBps
      }
      reserveToken
      reserveQuote
      volumeQuote
      txCount
      createdAt
    }
  }
`

interface RawPoolData {
  id: string
  token: {
    id: string
    name: string
    symbol: string
  }
  vault?: {
    id: string
    storyIPId: string
    dividendBps: string
    tradingFeeBps: string
  }
  reserveToken: string
  reserveQuote: string
  volumeQuote: string
  txCount: string
  createdAt: string
}

export interface PoolData {
  id: string
  token: {
    id: string
    name: string
    symbol: string
  }
  vault?: {
    id: string
    storyIPId: string
    dividendBps: string
    tradingFeeBps: string
  }
  reserveToken: string
  reserveQuote: string
  volumeQuote: string
  txCount: string
  createdAt: string
  change24h?: number
  // Enriched IP data
  ipAsset?: StoryIPAsset | null
  imageUrl?: string | null
  ipName?: string
}

interface AllPoolsResponse {
  pools: RawPoolData[]
}

async function enrichPoolWithIPData(pool: RawPoolData): Promise<PoolData> {
  if (!pool.vault?.storyIPId) {
    return { ...pool, change24h: Math.random() * 10 - 3 }
  }

  try {
    const ipAsset = await fetchIPAssetById(pool.vault.storyIPId)
    return {
      ...pool,
      change24h: Math.random() * 10 - 3, // Still mocked
      ipAsset,
      imageUrl: ipAsset ? getIPAssetImageUrl(ipAsset) : null,
      ipName: ipAsset ? getIPAssetDisplayName(ipAsset) : pool.token.name,
    }
  } catch {
    return { ...pool, change24h: Math.random() * 10 - 3 }
  }
}

export function useAllPools() {
  return useQuery({
    queryKey: ['allPools'],
    queryFn: async () => {
      const data = await querySubgraph<AllPoolsResponse>(ALL_POOLS_QUERY, {})
      // Enrich pools with IP asset data (images, names)
      const enrichedPools = await Promise.all(data.pools.map(enrichPoolWithIPData))
      return enrichedPools
    },
    staleTime: 30_000, // Cache for 30 seconds
  })
}
