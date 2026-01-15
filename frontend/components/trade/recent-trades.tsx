'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { querySubgraph } from '@/lib/services/subgraph'
import { formatNumber, shortenAddress } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const TRADES_PER_PAGE = 7

const RECENT_TRADES_QUERY = `
  query RecentTrades($poolId: String!) {
    swaps(
      where: { pool: $poolId }
      orderBy: timestamp
      orderDirection: desc
      first: 100
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
  const [currentPage, setCurrentPage] = useState(1)

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

  const totalPages = trades ? Math.ceil(trades.length / TRADES_PER_PAGE) : 0
  const paginatedTrades = trades?.slice(
    (currentPage - 1) * TRADES_PER_PAGE,
    currentPage * TRADES_PER_PAGE
  )

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
        <>
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
                {paginatedTrades?.map((trade) => (
                  <tr key={trade.id} className="border-b border-cream-dark last:border-0">
                    <td className="font-body text-xs text-text-muted py-3">
                      {formatDistanceToNow(parseInt(trade.timestamp) * 1000, { addSuffix: true })}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-body text-xs px-2 py-1 rounded ${
                          trade.isBuy
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-200 text-black'
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-cream-dark">
              <p className="font-body text-xs text-text-muted">
                PAGE {currentPage} OF {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded border border-cream-dark hover:bg-cream-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border border-cream-dark hover:bg-cream-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
