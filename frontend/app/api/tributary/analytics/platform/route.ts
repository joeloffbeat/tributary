import { NextRequest } from 'next/server'
import { getAllVaults } from '@/lib/services/tributary/reads'

// In-memory cache for platform stats
let cachedStats: PlatformStats | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * GET /api/tributary/analytics/platform
 * Get platform-wide statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const refresh = searchParams.get('refresh') === 'true'

    // Check cache first (unless refresh requested)
    if (!refresh && cachedStats && Date.now() - cacheTimestamp < CACHE_TTL) {
      return Response.json({ stats: cachedStats, cached: true })
    }

    // Fetch fresh platform stats
    const stats = await fetchPlatformStats()

    // Update cache
    cachedStats = stats
    cacheTimestamp = Date.now()

    return Response.json({ stats, cached: false })
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    // Get all vaults from factory
    const vaults = await getAllVaults()
    const activeVaults = vaults.filter((v) => v.isActive)

    // Count unique creators
    const uniqueCreators = new Set(vaults.map((v) => v.creator)).size

    // TODO: Query subgraph for more detailed stats when available
    // For now, compute from vault records
    return {
      totalVaults: vaults.length,
      activeVaults: activeVaults.length,
      totalValueLocked: '0', // TODO: Sum from subgraph
      totalDistributed: '0', // TODO: Sum from subgraph
      totalHolders: 0, // TODO: From subgraph
      totalCreators: uniqueCreators,
      volume24h: '0', // TODO: From subgraph trades
      volume7d: '0', // TODO: From subgraph trades
      activeListings: 0, // TODO: From marketplace subgraph
      lastUpdated: Date.now(),
    }
  } catch (error) {
    console.error('Error in fetchPlatformStats:', error)
    // Return default stats on error
    return {
      totalVaults: 0,
      activeVaults: 0,
      totalValueLocked: '0',
      totalDistributed: '0',
      totalHolders: 0,
      totalCreators: 0,
      volume24h: '0',
      volume7d: '0',
      activeListings: 0,
      lastUpdated: Date.now(),
    }
  }
}

interface PlatformStats {
  totalVaults: number
  activeVaults: number
  totalValueLocked: string
  totalDistributed: string
  totalHolders: number
  totalCreators: number
  volume24h: string
  volume7d: string
  activeListings: number
  lastUpdated: number
}
