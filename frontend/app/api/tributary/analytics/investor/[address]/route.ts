import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { getVaultsByCreator, getVaultInfo, getPendingRewards } from '@/lib/services/tributary/reads'

interface RouteParams {
  params: Promise<{ address: string }>
}

/**
 * GET /api/tributary/analytics/investor/[address]
 * Get portfolio analytics for an investor
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { address: investorAddress } = await params
    const { searchParams } = new URL(request.url)

    if (!investorAddress || !investorAddress.startsWith('0x')) {
      return Response.json({ error: 'Invalid investor address' }, { status: 400 })
    }

    const investor = investorAddress as Address
    const period = searchParams.get('period') || '30d'
    const { startTime, endTime } = getTimeRange(period)

    // Fetch investor analytics
    const analytics = await fetchInvestorAnalytics(investor, startTime, endTime)

    return Response.json({ analytics })
  } catch (error) {
    console.error('Error fetching investor analytics:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

function getTimeRange(period: string): { startTime: number; endTime: number } {
  const endTime = Math.floor(Date.now() / 1000)
  const periodDays =
    period === '7d' ? 7 : period === '90d' ? 90 : period === 'all' ? 365 * 10 : 30
  const startTime = endTime - periodDays * 24 * 60 * 60
  return { startTime, endTime }
}

async function fetchInvestorAnalytics(
  investor: Address,
  startTime: number,
  endTime: number
): Promise<InvestorAnalytics> {
  // Get vaults created by this investor (if they're a creator)
  const createdVaults = await getVaultsByCreator(investor)

  // Calculate pending rewards across all vaults
  // TODO: Get investor's token holdings from subgraph
  let totalPendingRewards = 0n

  // For now, check pending rewards in created vaults
  for (const vault of createdVaults) {
    try {
      const pending = await getPendingRewards(vault, investor)
      totalPendingRewards += pending
    } catch {
      // Skip on error
    }
  }

  // TODO: Query subgraph for comprehensive investor analytics
  return {
    investor,
    totalInvested: '0', // TODO: From subgraph
    currentValue: '0', // TODO: Calculate from holdings
    totalClaimed: '0', // TODO: From subgraph claim events
    pendingRewards: totalPendingRewards.toString(),
    unrealizedPnL: '0', // TODO: Calculate
    realizedPnL: '0', // TODO: From subgraph
    totalPnLPercentage: 0,
    holdingsCount: 0, // TODO: From subgraph token balances
    createdVaultsCount: createdVaults.length,
    avgYield: 0, // TODO: Calculate weighted average
    portfolioValueHistory: [], // TODO: From subgraph
    claimsHistory: [], // TODO: From subgraph
    totalBuys: 0, // TODO: From subgraph trades
    totalSells: 0, // TODO: From subgraph trades
    totalClaims: 0, // TODO: From subgraph claim events
  }
}

interface InvestorAnalytics {
  investor: Address
  totalInvested: string
  currentValue: string
  totalClaimed: string
  pendingRewards: string
  unrealizedPnL: string
  realizedPnL: string
  totalPnLPercentage: number
  holdingsCount: number
  createdVaultsCount: number
  avgYield: number
  portfolioValueHistory: TimeSeriesPoint[]
  claimsHistory: TimeSeriesPoint[]
  totalBuys: number
  totalSells: number
  totalClaims: number
}

interface TimeSeriesPoint {
  timestamp: number
  value: string
}
