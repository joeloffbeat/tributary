'use client'

import { useQuery } from '@tanstack/react-query'
import { querySubgraph } from '@/lib/services/subgraph'
import { formatNumber, shortenAddress } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { VaultDetail } from '@/hooks/use-vault-detail'

const RECENT_SWAPS_QUERY = `
  query RecentSwaps($poolId: String!) {
    swaps(
      where: { pool: $poolId }
      orderBy: timestamp
      orderDirection: desc
      first: 50
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

interface Swap {
  id: string
  trader: string
  isBuy: boolean
  amountIn: string
  amountOut: string
  price: string
  timestamp: string
  txHash: string
}

interface TradeHistoryTabProps {
  vault: VaultDetail
}

export function TradeHistoryTab({ vault }: TradeHistoryTabProps) {
  const poolId = vault.pool?.id

  const { data: swaps, isLoading } = useQuery({
    queryKey: ['recentSwaps', poolId],
    queryFn: async () => {
      if (!poolId) return []
      const data = await querySubgraph<{ swaps: Swap[] }>(RECENT_SWAPS_QUERY, {
        poolId: poolId.toLowerCase(),
      })
      return data.swaps
    },
    enabled: !!poolId,
  })

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-cream-dark rounded" />
  }

  if (!poolId) {
    return (
      <div className="card-premium p-8 text-center">
        <p className="font-body text-text-secondary">
          NO TRADING POOL AVAILABLE YET
        </p>
      </div>
    )
  }

  return (
    <div className="card-premium overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-6 gap-4 p-4 bg-cream-dark/50 font-body text-xs text-text-muted">
        <div>TIME</div>
        <div>TYPE</div>
        <div className="text-right">AMOUNT</div>
        <div className="text-right">PRICE</div>
        <div className="text-right">TRADER</div>
        <div className="text-right">TX</div>
      </div>

      {/* Rows */}
      {!swaps?.length ? (
        <div className="p-8 text-center">
          <p className="font-body text-text-secondary">NO TRADES YET</p>
        </div>
      ) : (
        swaps.map((swap) => (
          <div
            key={swap.id}
            className="grid grid-cols-6 gap-4 p-4 border-t border-cream-dark items-center"
          >
            <div className="font-body text-xs text-text-muted">
              {formatDistanceToNow(parseInt(swap.timestamp) * 1000, { addSuffix: true })}
            </div>
            <div>
              <span
                className={`font-body text-xs px-2 py-1 rounded ${
                  swap.isBuy
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-500'
                }`}
              >
                {swap.isBuy ? 'BUY' : 'SELL'}
              </span>
            </div>
            <div className="text-right">
              <p className="font-stat text-sm">
                {formatNumber(swap.isBuy ? swap.amountOut : swap.amountIn)}
              </p>
              <p className="font-body text-xs text-text-muted">
                {vault.token.symbol}
              </p>
            </div>
            <div className="text-right">
              <p className="font-stat text-sm">
                ${parseFloat(swap.price).toFixed(4)}
              </p>
            </div>
            <div className="text-right">
              <a
                href={`https://sepolia.mantlescan.xyz/address/${swap.trader}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-tributary hover:text-tributary-light"
              >
                {shortenAddress(swap.trader)}
              </a>
            </div>
            <div className="text-right">
              <a
                href={`https://sepolia.mantlescan.xyz/tx/${swap.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs text-tributary hover:text-tributary-light"
              >
                VIEW
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
