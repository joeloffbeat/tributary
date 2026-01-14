import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'

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

export interface VaultData {
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
  createdAt: string
  pool?: {
    id: string
    reserveToken: string
    reserveQuote: string
    volumeQuote: string
  }
}

interface AllVaultsResponse {
  vaults: VaultData[]
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

      return vaults
    },
  })
}
