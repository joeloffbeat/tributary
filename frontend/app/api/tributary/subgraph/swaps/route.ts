import { NextRequest, NextResponse } from 'next/server'
import { querySubgraph } from '@/lib/services/subgraph'

const SWAPS_QUERY = `
  query GetSwaps($poolId: String, $first: Int!, $skip: Int!) {
    swaps(
      where: { pool: $poolId }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      pool { id }
      trader
      isBuy
      amountIn
      amountOut
      fee
      price
      timestamp
      txHash
      blockNumber
    }
  }
`

interface SwapsResponse {
  swaps: Array<{
    id: string
    pool: { id: string }
    trader: string
    isBuy: boolean
    amountIn: string
    amountOut: string
    fee: string
    price: string
    timestamp: string
    txHash: string
    blockNumber: string
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('poolId') || undefined
    const first = parseInt(searchParams.get('first') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    const data = await querySubgraph<SwapsResponse>(SWAPS_QUERY, {
      poolId,
      first,
      skip,
    })

    return NextResponse.json({
      success: true,
      data: data.swaps,
      pagination: { first, skip },
    })
  } catch (error) {
    console.error('Error fetching swaps:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch swaps' },
      { status: 500 }
    )
  }
}
