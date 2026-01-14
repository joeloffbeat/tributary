import { NextResponse } from 'next/server'
import { querySubgraph, QUERIES } from '@/lib/services/subgraph'

interface StatsResponse {
  protocolStats: {
    totalVaults: string
    totalVolume: string
    totalRoyaltiesDistributed: string
    totalFeesCollected: string
    totalHolders: string
  } | null
}

export async function GET() {
  try {
    const data = await querySubgraph<StatsResponse>(QUERIES.PROTOCOL_STATS)

    // Provide default values if no stats exist yet
    const stats = data.protocolStats || {
      totalVaults: '0',
      totalVolume: '0',
      totalRoyaltiesDistributed: '0',
      totalFeesCollected: '0',
      totalHolders: '0',
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Error fetching protocol stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch protocol stats' },
      { status: 500 }
    )
  }
}
