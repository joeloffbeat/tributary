import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'

const VAULT_DETAIL_QUERY = `
  query VaultDetail($id: ID!) {
    vault(id: $id) {
      id
      token {
        id
        name
        symbol
        totalSupply
        holderCount
      }
      creator
      storyIPId
      dividendBps
      tradingFeeBps
      totalDeposited
      totalDistributed
      pendingDistribution
      distributionCount
      createdAt
      isActive
      distributions(first: 10, orderBy: timestamp, orderDirection: desc) {
        id
        amount
        totalClaimed
        timestamp
      }
      pool {
        id
        reserveToken
        reserveQuote
        volumeQuote
      }
    }
  }
`

export interface VaultDetail {
  id: string
  token: {
    id: string
    name: string
    symbol: string
    totalSupply: string
    holderCount: string
  }
  creator: string
  storyIPId: string
  dividendBps: string
  tradingFeeBps: string
  totalDeposited: string
  totalDistributed: string
  pendingDistribution: string
  distributionCount: string
  createdAt: string
  isActive: boolean
  distributions?: Array<{
    id: string
    amount: string
    totalClaimed: string
    timestamp: string
  }>
  pool?: {
    id: string
    reserveToken: string
    reserveQuote: string
    volumeQuote: string
  }
}

interface VaultDetailResponse {
  vault: VaultDetail | null
}

export function useVaultDetail(address: string) {
  return useQuery({
    queryKey: ['vaultDetail', address],
    queryFn: async () => {
      const data = await querySubgraph<VaultDetailResponse>(VAULT_DETAIL_QUERY, {
        id: address.toLowerCase(),
      })
      return data.vault
    },
    enabled: !!address,
  })
}
