import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'
import { gql } from 'graphql-request'

const PROTOCOL_STATS_QUERY = gql`
  query ProtocolStats {
    protocolStats(id: "protocol") {
      totalVaults
      totalVolume
      totalRoyaltiesDistributed
      totalFeesCollected
    }
    vaults(first: 1000) {
      totalDeposited
    }
  }
`

interface ProtocolStatsResponse {
  protocolStats: {
    totalVaults: string
    totalVolume: string
    totalRoyaltiesDistributed: string
    totalFeesCollected: string
  } | null
  vaults: {
    totalDeposited: string
  }[]
}

export function useProtocolStats() {
  return useQuery({
    queryKey: ['protocolStats'],
    queryFn: async () => {
      const data = await querySubgraph<ProtocolStatsResponse>(PROTOCOL_STATS_QUERY)

      const totalValueLocked = data.vaults.reduce(
        (sum: number, v) => sum + parseFloat(v.totalDeposited || '0'),
        0
      )

      return {
        totalVaults: data.protocolStats?.totalVaults || data.vaults.length.toString(),
        totalVolume: parseFloat(data.protocolStats?.totalVolume || '0'),
        totalDistributed: parseFloat(data.protocolStats?.totalRoyaltiesDistributed || '0'),
        totalValueLocked,
      }
    },
    refetchInterval: 60_000,
  })
}
