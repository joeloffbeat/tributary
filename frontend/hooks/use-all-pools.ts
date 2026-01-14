import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'

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

export interface PoolData {
  id: string
  token: {
    id: string
    name: string
    symbol: string
  }
  vault?: {
    id: string
    tradingFeeBps: string
  }
  reserveToken: string
  reserveQuote: string
  volumeQuote: string
  txCount: string
  createdAt: string
  change24h?: number
}

interface AllPoolsResponse {
  pools: PoolData[]
}

export function useAllPools() {
  return useQuery({
    queryKey: ['allPools'],
    queryFn: async () => {
      const data = await querySubgraph<AllPoolsResponse>(ALL_POOLS_QUERY, {})
      return data.pools
    },
  })
}
