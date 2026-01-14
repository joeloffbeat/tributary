import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { getVaultInfo, getVaultRecord, getDistribution, isValidVault } from '@/lib/services/tributary/reads'

interface RouteParams {
  params: Promise<{ address: string }>
}

interface TimeSeriesPoint {
  timestamp: number
  value: string
}

/**
 * GET /api/tributary/analytics/vault/[address]
 * Get detailed analytics for a specific vault
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { address: vaultAddress } = await params
    const { searchParams } = new URL(request.url)

    if (!vaultAddress || !vaultAddress.startsWith('0x')) {
      return Response.json({ error: 'Invalid vault address' }, { status: 400 })
    }

    const vault = vaultAddress as Address
    const isValid = await isValidVault(vault)
    if (!isValid) {
      return Response.json({ error: 'Vault not found' }, { status: 404 })
    }

    const period = searchParams.get('period') || '30d'
    const { startTime } = getTimeRange(period)
    const analytics = await fetchVaultAnalytics(vault, startTime)

    return Response.json({ analytics })
  } catch (error) {
    console.error('Error fetching vault analytics:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

function getTimeRange(period: string): { startTime: number; endTime: number } {
  const endTime = Math.floor(Date.now() / 1000)
  const days = period === '7d' ? 7 : period === '90d' ? 90 : period === 'all' ? 0 : 30
  const startTime = days === 0 ? 0 : endTime - days * 24 * 60 * 60
  return { startTime, endTime }
}

async function fetchVaultAnalytics(vault: Address, startTime: number) {
  const [info, record] = await Promise.all([getVaultInfo(vault), getVaultRecord(vault)])

  // Fetch distribution history
  const distributions: TimeSeriesPoint[] = []
  for (let i = 0; i < 20; i++) {
    try {
      const dist = await getDistribution(vault, BigInt(i))
      if (dist.amount > 0n && Number(dist.timestamp) >= startTime) {
        distributions.push({ timestamp: Number(dist.timestamp), value: dist.amount.toString() })
      }
    } catch {
      break
    }
  }

  return {
    vault,
    storyIPId: record.storyIPId,
    creator: record.creator,
    totalDistributed: info.totalDistributed.toString(),
    totalDeposited: info.totalDeposited.toString(),
    pendingDistribution: info.pendingDistribution.toString(),
    currentYield: 0,
    holderCount: 0,
    avgHoldingPeriod: 0,
    distributionHistory: distributions,
    holderCountHistory: [] as TimeSeriesPoint[],
    priceHistory: [] as TimeSeriesPoint[],
    holderDistribution: { top10Percentage: 0, top25Percentage: 0, averageHolding: '0' },
    tradingVolume: '0',
    trades24h: 0,
    floorPrice: '0',
    avgPrice: '0',
    createdAt: Number(record.createdAt),
  }
}
