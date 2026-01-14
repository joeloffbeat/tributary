import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import {
  getAllVaults,
  getTokenBalance,
  getPendingRewards,
} from '@/lib/services/tributary'

export type PortfolioSummary = {
  totalValue: bigint
  pendingRewards: bigint
  holdingsCount: number
}

async function fetchPortfolioSummary(address: Address): Promise<PortfolioSummary> {
  // Get all vaults and check user holdings
  const vaults = await getAllVaults()

  let totalValue = 0n
  let pendingRewards = 0n
  let holdingsCount = 0

  // Check each vault for user holdings
  await Promise.all(
    vaults.map(async (vault) => {
      try {
        const [balance, rewards] = await Promise.all([
          getTokenBalance(vault.token, address),
          getPendingRewards(vault.vault, address),
        ])

        if (balance > 0n) {
          totalValue += balance
          holdingsCount++
        }
        pendingRewards += rewards
      } catch {
        // Skip vaults that error (inactive, etc.)
      }
    })
  )

  return { totalValue, pendingRewards, holdingsCount }
}

export function usePortfolioSummary(address: Address | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolio-summary', address],
    queryFn: async () => {
      if (!address) return { totalValue: 0n, pendingRewards: 0n, holdingsCount: 0 }
      return fetchPortfolioSummary(address)
    },
    enabled: !!address,
    staleTime: 30_000,
  })

  return {
    totalValue: data?.totalValue ?? 0n,
    pendingRewards: data?.pendingRewards ?? 0n,
    holdingsCount: data?.holdingsCount ?? 0,
    isLoading,
  }
}
