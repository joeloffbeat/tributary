import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'

const USER_HOLDINGS_QUERY = `
  query UserHoldings($holder: String!) {
    tokenHolders(where: { holder: $holder, balance_gt: "0" }) {
      id
      token {
        id
        name
        symbol
        vault {
          id
          pool {
            reserveQuote
          }
        }
      }
      balance
      totalClaimed
    }
  }
`

interface UserHoldingsResponse {
  tokenHolders: Array<{
    id: string
    token: {
      id: string
      name: string
      symbol: string
      vault?: {
        id: string
        pool?: {
          reserveQuote: string
        }
      }
    }
    balance: string
    totalClaimed: string
  }>
}

export interface UserHolding {
  id: string
  token: {
    id: string
    name: string
    symbol: string
  }
  balance: string
  value: number
  pendingRewards: string
}

export function useUserHoldings(address: string) {
  return useQuery({
    queryKey: ['userHoldings', address],
    queryFn: async (): Promise<UserHolding[]> => {
      const data = await querySubgraph<UserHoldingsResponse>(USER_HOLDINGS_QUERY, {
        holder: address.toLowerCase(),
      })

      return data.tokenHolders.map((h) => {
        // Calculate value from pool price
        const price = h.token.vault?.pool
          ? parseFloat(h.token.vault.pool.reserveQuote) / 10000
          : 0
        const value = parseFloat(h.balance) * price

        return {
          id: h.id,
          token: h.token,
          balance: h.balance,
          value,
          pendingRewards: '0', // TODO: Calculate from contract
        }
      })
    },
    enabled: !!address,
  })
}
