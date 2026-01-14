import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'

const POOL_BY_TOKEN_QUERY = `
  query PoolByToken($tokenId: String!) {
    pools(where: { token: $tokenId }, first: 1) {
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
      feesCollected
      createdAt
    }
  }
`

export interface Pool {
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
  feesCollected: string
  createdAt: string
  change24h?: number
}

interface PoolResponse {
  pools: Pool[]
}

export function usePool(tokenAddress: string) {
  return useQuery({
    queryKey: ['pool', tokenAddress],
    queryFn: async () => {
      const data = await querySubgraph<PoolResponse>(POOL_BY_TOKEN_QUERY, {
        tokenId: tokenAddress.toLowerCase(),
      })
      return data.pools[0] || null
    },
    enabled: !!tokenAddress,
  })
}
