import { useQuery } from '@tanstack/react-query'
import { querySubgraph, QUERIES } from '@/lib/services/subgraph'

export interface Candle {
  timestamp: string
  open: string
  high: string
  low: string
  close: string
  volume: string
  txCount: string
}

const INTERVAL_QUERIES: Record<number, string> = {
  60: QUERIES.CANDLES_1M,
  300: QUERIES.CANDLES_5M,
  3600: QUERIES.CANDLES_1H,
  86400: QUERIES.CANDLES_1D,
}

const INTERVAL_LOOKBACK: Record<number, number> = {
  60: 60 * 60,       // 1 hour for 1m candles
  300: 24 * 60 * 60, // 1 day for 5m candles
  3600: 7 * 24 * 60 * 60, // 1 week for 1h candles
  86400: 30 * 24 * 60 * 60, // 1 month for 1d candles
}

export function useCandleData(poolId: string, intervalSeconds: number) {
  return useQuery({
    queryKey: ['candles', poolId, intervalSeconds],
    queryFn: async (): Promise<Candle[]> => {
      const query = INTERVAL_QUERIES[intervalSeconds]
      if (!query) {
        console.warn('Unknown interval:', intervalSeconds)
        return []
      }

      const lookback = INTERVAL_LOOKBACK[intervalSeconds] || 24 * 60 * 60
      const from = Math.floor(Date.now() / 1000) - lookback

      const data = await querySubgraph<Record<string, Candle[]>>(query, {
        poolId: poolId.toLowerCase(),
        from: from.toString(),
        first: 500,
      })

      // Get the candles from whichever field is populated
      const candles = data.candle1Ms || data.candle5Ms || data.candle1Hs || data.candle1Ds || []
      return candles
    },
    enabled: !!poolId,
  })
}
