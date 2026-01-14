import { useQuery } from '@tanstack/react-query'
import { getAllVaults, getVaultInfo } from '@/lib/services/tributary'

interface ProtocolStats {
  tvl: bigint
  vaultCount: number
  userCount: number
  totalDistributed: bigint
}

async function fetchProtocolStats(): Promise<ProtocolStats> {
  const vaults = await getAllVaults()
  const activeVaults = vaults.filter((v) => v.isActive)

  let tvl = 0n
  let totalDistributed = 0n

  // Fetch info for active vaults
  await Promise.all(
    activeVaults.map(async (vault) => {
      try {
        const info = await getVaultInfo(vault.vault)
        tvl += info.totalDeposited - info.totalDistributed
        totalDistributed += info.totalDistributed
      } catch {
        // Skip vaults that error
      }
    })
  )

  // User count would come from subgraph in production
  // For now, estimate based on vault count
  const userCount = activeVaults.length * 5

  return {
    tvl,
    vaultCount: activeVaults.length,
    userCount,
    totalDistributed,
  }
}

export function useProtocolStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['protocol-stats'],
    queryFn: fetchProtocolStats,
    staleTime: 60_000, // 1 minute
  })

  return { stats: data, isLoading }
}
