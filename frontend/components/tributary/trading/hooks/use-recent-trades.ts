import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRecentTrades, type Trade as ServiceTrade } from '@/lib/services/tributary/reads'
import type { TradingFilterState } from '../components/trading-filters'
import type { Address } from 'viem'

export interface Trade {
  id: string
  listingId: string
  seller: Address
  buyer: Address
  tokenAddress: Address
  amount: bigint
  pricePerToken: bigint
  totalValue: bigint
  timestamp: number
  txHash: string
  tokenSymbol?: string
}

export function useRecentTrades(filters: TradingFilterState) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['recent-trades', filters],
    queryFn: getRecentTrades,
    refetchInterval: 15_000,
    staleTime: 10_000,
  })

  const trades = useMemo((): Trade[] => {
    if (!data || data.length === 0) return []

    let filtered = data.map((t: ServiceTrade): Trade => ({
      id: t.id,
      listingId: t.listingId.toString(),
      seller: t.seller,
      buyer: t.buyer,
      tokenAddress: t.royaltyToken,
      amount: t.amount,
      pricePerToken: t.pricePerToken,
      totalValue: (t.amount * t.pricePerToken) / BigInt(1e18),
      timestamp: t.timestamp,
      txHash: t.txHash,
      tokenSymbol: 'RT',
    }))

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter((t) =>
        t.tokenSymbol?.toLowerCase().includes(search) ||
        t.seller.toLowerCase().includes(search) ||
        t.buyer.toLowerCase().includes(search)
      )
    }

    filtered.sort((a, b) => b.timestamp - a.timestamp)
    return filtered.slice(0, 50)
  }, [data, filters])

  return { trades, isLoading, refetch }
}
