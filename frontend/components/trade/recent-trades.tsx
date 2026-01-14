'use client'

import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'
import { formatNumber, shortenAddress } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const RECENT_TRADES_QUERY = `
  query RecentTrades($poolId: String!) {
    swaps(
      where: { pool: $poolId }
      orderBy: timestamp
      orderDirection: desc
      first: 20
    ) {
      id
      trader
      isBuy
      amountIn
      amountOut
      price
      timestamp
      txHash
    }
  }
`

interface Trade {
  id: string
  trader: string
  isBuy: boolean
  amountIn: string
  amountOut: string
  price: string
  timestamp: string
  txHash: string
}

interface RecentTradesProps {
  poolId: string
}

export function RecentTrades({ poolId }: RecentTradesProps) {
  const { data: trades, isLoading } = useQuery({
    queryKey: ['recentTrades', poolId],
    queryFn: async () => {
      const data = await querySubgraph<{ swaps: Trade[] }>(RECENT_TRADES_QUERY, {
        poolId: poolId.toLowerCase(),
      })
      return data.swaps
    },
    enabled: !!poolId,
    refetchInterval: 30000, // Refresh every 30s
  })

  if (isLoading) {
    return (
      <div className="card-premium p-6">
        <h3 className="font-title text-2xl mb-4">Recent Trades</h3>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-cream-dark rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card-premium p-6">
      <h3 className="font-title text-2xl mb-4">Recent Trades</h3>

      {!trades?.length ? (
        <p className="font-body text-text-secondary text-center py-8">
          NO TRADES YET
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-dark">
                <th className="font-body text-xs text-text-muted text-left py-3">TIME</th>
                <th className="font-body text-xs text-text-muted text-left py-3">TYPE</th>
                <th className="font-body text-xs text-text-muted text-right py-3">AMOUNT</th>
                <th className="font-body text-xs text-text-muted text-right py-3">PRICE</th>
                <th className="font-body text-xs text-text-muted text-right py-3">TRADER</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-cream-dark last:border-0">
                  <td className="font-body text-xs text-text-muted py-3">
                    {formatDistanceToNow(parseInt(trade.timestamp) * 1000, { addSuffix: true })}
                  </td>
                  <td className="py-3">
                    <span
                      className={`font-body text-xs px-2 py-1 rounded ${
                        trade.isBuy
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-500'
                      }`}
                    >
                      {trade.isBuy ? 'BUY' : 'SELL'}
                    </span>
                  </td>
                  <td className="font-stat text-sm text-right py-3">
                    {formatNumber(trade.isBuy ? trade.amountOut : trade.amountIn)}
                  </td>
                  <td className="font-stat text-sm text-right py-3">
                    ${parseFloat(trade.price).toFixed(4)}
                  </td>
                  <td className="text-right py-3">
                    <a
                      href={`https://sepolia.mantlescan.xyz/address/${trade.trader}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs text-tributary hover:text-tributary-light"
                    >
                      {shortenAddress(trade.trader)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
