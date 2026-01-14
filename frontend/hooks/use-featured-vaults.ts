import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'
import { gql } from 'graphql-request'

const FEATURED_VAULTS_QUERY = gql`
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

export interface FeaturedVault {
  id: string
  token: {
    id: string
    name: string
    symbol: string
  }
  creator: string
  storyIPId: string
  dividendBps: string
  tradingFeeBps: string
  totalDeposited: string
  totalDistributed: string
  pool?: {
    id: string
    reserveQuote: string
    volumeQuote: string
  }
}

interface FeaturedVaultsResponse {
  vaults: FeaturedVault[]
}

export function useFeaturedVaults(limit: number = 6) {
  return useQuery({
    queryKey: ['featuredVaults', limit],
    queryFn: async () => {
      const data = await querySubgraph<FeaturedVaultsResponse>(FEATURED_VAULTS_QUERY, { first: limit })
      return data.vaults
    },
  })
}
