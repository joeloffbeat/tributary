import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'

const USER_VAULTS_QUERY = `
  query UserVaults($creator: String!) {
    vaults(where: { creator: $creator }) {
      id
      token {
        id
        name
        symbol
      }
      totalDeposited
      totalDistributed
      pendingDistribution
      isActive
    }
  }
`

interface UserVaultsResponse {
  vaults: Array<{
    id: string
    token: {
      id: string
      name: string
      symbol: string
    }
    totalDeposited: string
    totalDistributed: string
    pendingDistribution: string
    isActive: boolean
  }>
}

export interface UserVault {
  id: string
  token: {
    id: string
    name: string
    symbol: string
  }
  totalDeposited: string
  totalDistributed: string
  pendingDistribution: string
  isActive: boolean
}

export function useUserVaults(address: string) {
  return useQuery({
    queryKey: ['userVaults', address],
    queryFn: async (): Promise<UserVault[]> => {
      const data = await querySubgraph<UserVaultsResponse>(USER_VAULTS_QUERY, {
        creator: address.toLowerCase(),
      })

      return data.vaults
    },
    enabled: !!address,
  })
}
