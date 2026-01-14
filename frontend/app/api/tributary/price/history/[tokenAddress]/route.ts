import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { getListingsByToken, getFloorPrice } from '@/lib/services/tributary/reads'
import type { Period, Resolution, PriceHistoryPoint } from '../../../types'
import { PERIOD_SECONDS } from '../../../types'

/** GET /api/tributary/price/history/[tokenAddress] - Get historical price data */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenAddress: string }> }
) {
  try {
    const { tokenAddress } = await params
    const token = tokenAddress as Address
    const { searchParams } = new URL(request.url)
    if (!token || !token.startsWith('0x')) {
      return Response.json({ error: 'Invalid token address' }, { status: 400 })
    }
    const period = (searchParams.get('period') || '7d') as Period
    const resolution = (searchParams.get('resolution') || 'hourly') as Resolution
    if (!PERIOD_SECONDS[period]) {
      return Response.json({ error: 'Invalid period' }, { status: 400 })
    }
    const history = await fetchPriceHistory(token, period, resolution)
    return Response.json({ history, period, resolution })
  } catch (error) {
    console.error('Error fetching price history:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fetchPriceHistory(
  token: Address, period: Period, resolution: Resolution
): Promise<PriceHistoryPoint[]> {
  const [floor, listings] = await Promise.all([getFloorPrice(token), getListingsByToken(token)])
  const now = Math.floor(Date.now() / 1000)
  const start = now - PERIOD_SECONDS[period]
  const interval = resolution === 'hourly' ? 3600 : 86400
  const points: PriceHistoryPoint[] = []
  const valid = listings.filter((l) => Number(l.createdAt) >= start && Number(l.createdAt) <= now)

  for (let t = start; t <= now; t += interval) {
    const active = valid.filter((l) => Number(l.createdAt) <= t && (Number(l.expiresAt) >= t || l.isActive))
    const prices = active.map((l) => l.pricePerToken)
    const vol = active.filter((l) => Number(l.createdAt) >= t - interval).reduce((s, l) => s + l.sold * l.pricePerToken, 0n)
    if (prices.length > 0) {
      const avg = prices.reduce((s, p) => s + p, 0n) / BigInt(prices.length)
      points.push({
        timestamp: t, open: avg.toString(), close: avg.toString(), volume: vol.toString(),
        high: prices.reduce((m, p) => (p > m ? p : m), prices[0]).toString(),
        low: prices.reduce((m, p) => (p < m ? p : m), prices[0]).toString(),
      })
    } else {
      points.push({
        timestamp: t, open: floor.toString(), high: floor.toString(),
        low: floor.toString(), close: floor.toString(), volume: '0',
      })
    }
  }
  return points
}
