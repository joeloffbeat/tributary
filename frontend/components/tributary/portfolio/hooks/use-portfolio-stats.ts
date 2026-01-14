import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import type { PortfolioStats, PortfolioHolding } from '../types'

// TODO: Implement actual subgraph query once deployed
// For now, mock the data structure
async function fetchHolderPositions(_address: Address): Promise<PortfolioHolding[]> {
  // This will be replaced with actual subgraph query:
  // query GetHolderPositions($holder: Bytes!) {
  //   tokenHoldings(where: { holder: $holder, balance_gt: "0" }) {
  //     vault { id storyIPId token { id symbol name totalSupply } totalDeposited }
  //     balance pendingRewards totalClaimed lastClaimTimestamp
  //   }
  // }
  return []
}

export function usePortfolioStats(address: Address | undefined) {
  return useQuery({
    queryKey: ['portfolio-stats', address],
    queryFn: async (): Promise<PortfolioStats> => {
      if (!address) throw new Error('No address')

      // Fetch holdings from subgraph
      const holdings = await fetchHolderPositions(address)

      // Calculate aggregate stats
      let totalValue = 0n
      let totalPendingRewards = 0n
      let totalEarned = 0n
      let weightedApySum = 0

      for (const holding of holdings) {
        totalValue += holding.value
        totalPendingRewards += holding.pendingRewards
        totalEarned += holding.totalClaimed
        weightedApySum += holding.apy * Number(holding.value)
      }

      const averageApy = totalValue > 0n ? weightedApySum / Number(totalValue) : 0

      return {
        totalValue,
        totalPendingRewards,
        totalEarned,
        averageApy,
        holdingCount: holdings.length,
        holdings,
        valueChange24h: 0, // TODO: Calculate from historical data
      }
    },
    enabled: !!address,
    staleTime: 30_000,
  })
}
