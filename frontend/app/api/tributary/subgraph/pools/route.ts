import { NextRequest, NextResponse } from 'next/server'
import { querySubgraph, QUERIES } from '@/lib/services/subgraph'

interface PoolsResponse {
  pool?: {
    id: string
    token: { id: string; symbol: string; name: string }
    quoteToken: string
    reserveToken: string
    reserveQuote: string
    volumeToken: string
    volumeQuote: string
    txCount: string
    feesCollected: string
    createdAt: string
    swaps: Array<{
      id: string
      trader: string
      isBuy: boolean
      amountIn: string
      amountOut: string
      fee: string
      price: string
      timestamp: string
      txHash: string
    }>
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('poolId')
    const swapsFirst = parseInt(searchParams.get('swapsFirst') || '20')

    if (!poolId) {
      return NextResponse.json(
        { success: false, error: 'poolId is required' },
        { status: 400 }
      )
    }

    const data = await querySubgraph<PoolsResponse>(QUERIES.POOL_WITH_SWAPS, {
      poolId,
      swapsFirst,
    })

    return NextResponse.json({
      success: true,
      data: data.pool,
    })
  } catch (error) {
    console.error('Error fetching pool:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pool' },
      { status: 500 }
    )
  }
}
