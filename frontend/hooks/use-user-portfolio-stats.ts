import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'

const PORTFOLIO_STATS_QUERY = `
  query PortfolioStats($holder: String!) {
    tokenHolders(where: { holder: $holder, balance_gt: "0" }) {
      balance
      totalClaimed
      token {
        vault {
          pool {
            reserveQuote
          }
        }
      }
    }
  }
`

interface PortfolioStatsResponse {
  tokenHolders: Array<{
    balance: string
    totalClaimed: string
    token: {
      vault?: {
        pool?: {
          reserveQuote: string
        }
      }
    }
  }>
}

export interface PortfolioStats {
  portfolioValue: number
  totalInvested: number
  pendingDividends: number
  totalClaimed: number
}

export function useUserPortfolioStats(address: string) {
  return useQuery({
    queryKey: ['portfolioStats', address],
    queryFn: async (): Promise<PortfolioStats> => {
      const data = await querySubgraph<PortfolioStatsResponse>(PORTFOLIO_STATS_QUERY, {
        holder: address.toLowerCase(),
      })

      let portfolioValue = 0
      let totalClaimed = 0

      data.tokenHolders.forEach((h) => {
        const price = h.token.vault?.pool
          ? parseFloat(h.token.vault.pool.reserveQuote) / 10000
          : 0
        portfolioValue += parseFloat(h.balance) * price
        totalClaimed += parseFloat(h.totalClaimed)
      })

      return {
        portfolioValue,
        totalInvested: portfolioValue * 0.9, // Approximate, would need historical data
        pendingDividends: 0, // Would need contract call
        totalClaimed,
      }
    },
    enabled: !!address,
  })
}
