import { NextRequest, NextResponse } from 'next/server'
import { querySubgraph, QUERIES } from '@/lib/services/subgraph'

interface CandleData {
  timestamp: string
  open: string
  high: string
  low: string
  close: string
  volume: string
  txCount: string
}

interface CandlesResponse {
  candle1Ms?: CandleData[]
  candle5Ms?: CandleData[]
  candle1Hs?: CandleData[]
  candle1Ds?: CandleData[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('poolId')
    const interval = searchParams.get('interval') || '1h'
    const first = parseInt(searchParams.get('first') || '100')
    const fromTimestamp = searchParams.get('from') || '0'

    if (!poolId) {
      return NextResponse.json(
        { success: false, error: 'poolId is required' },
        { status: 400 }
      )
    }

    let query: string
    let dataKey: keyof CandlesResponse

    switch (interval) {
      case '1m':
        query = QUERIES.CANDLES_1M
        dataKey = 'candle1Ms'
        break
      case '5m':
        query = QUERIES.CANDLES_5M
        dataKey = 'candle5Ms'
        break
      case '1h':
        query = QUERIES.CANDLES_1H
        dataKey = 'candle1Hs'
        break
      case '1d':
        query = QUERIES.CANDLES_1D
        dataKey = 'candle1Ds'
        break
      default:
        query = QUERIES.CANDLES_1H
        dataKey = 'candle1Hs'
    }

    const data = await querySubgraph<CandlesResponse>(query, {
      poolId,
      from: fromTimestamp,
      first,
    })

    const candles = data[dataKey] || []

    return NextResponse.json({
      success: true,
      data: candles,
      interval,
      poolId,
    })
  } catch (error) {
    console.error('Error fetching candles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candles' },
      { status: 500 }
    )
  }
}
