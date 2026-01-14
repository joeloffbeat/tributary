import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { getAllVaults, getVaultInfo, getTokenInfo } from '@/lib/services/tributary/reads'

/**
 * GET /api/tributary/analytics/leaderboard
 * Get top performers by various metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'vaults'
    const metric = searchParams.get('metric') || 'distributed'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    const leaderboard = await fetchLeaderboard(type, metric, limit)
    return Response.json({ leaderboard, type, metric })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fetchLeaderboard(type: string, metric: string, limit: number) {
  const vaults = await getAllVaults()
  const activeVaults = vaults.filter((v) => v.isActive)

  if (type === 'vaults') {
    const vaultData = await Promise.all(
      activeVaults.map(async (record) => {
        try {
          const [info, tokenInfo] = await Promise.all([getVaultInfo(record.vault), getTokenInfo(record.token)])
          return { address: record.vault, name: tokenInfo.name, symbol: tokenInfo.symbol,
            totalDistributed: info.totalDistributed, totalDeposited: info.totalDeposited, creator: record.creator }
        } catch { return null }
      })
    )
    const validVaults = vaultData.filter((v) => v !== null)
    const sorted = validVaults.sort((a, b) =>
      Number((metric === 'distributed' ? b.totalDistributed : b.totalDeposited) -
             (metric === 'distributed' ? a.totalDistributed : a.totalDeposited)))

    return sorted.slice(0, limit).map((v, i) => ({
      rank: i + 1, address: v.address, name: v.name, symbol: v.symbol,
      value: (metric === 'distributed' ? v.totalDistributed : v.totalDeposited).toString(),
      metadata: { creator: v.creator },
    }))
  }

  if (type === 'creators') {
    const creatorStats = new Map<Address, { totalDistributed: bigint; vaultCount: number }>()
    for (const record of activeVaults) {
      try {
        const info = await getVaultInfo(record.vault)
        const existing = creatorStats.get(record.creator) || { totalDistributed: 0n, vaultCount: 0 }
        creatorStats.set(record.creator, {
          totalDistributed: existing.totalDistributed + info.totalDistributed,
          vaultCount: existing.vaultCount + 1
        })
      } catch { /* skip */ }
    }
    return Array.from(creatorStats.entries())
      .sort((a, b) => Number(b[1].totalDistributed - a[1].totalDistributed))
      .slice(0, limit)
      .map(([address, stats], i) => ({
        rank: i + 1, address, value: stats.totalDistributed.toString(), metadata: { vaultCount: stats.vaultCount }
      }))
  }
  return []
}
