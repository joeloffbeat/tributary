import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import type { InvestmentEvent } from '../types'

const PAGE_SIZE = 20

// TODO: Replace with actual subgraph query when deployed
// This mock function simulates fetching from subgraph
async function fetchInvestorHistory(
  _address: Address,
  _params: { first: number; skip: number }
): Promise<InvestmentEvent[]> {
  // In production, this would query the subgraph:
  // query GetInvestorHistory($investor: Bytes!, $first: Int!, $skip: Int!) {
  //   tokenPurchases(where: { buyer: $investor }, orderBy: timestamp, orderDirection: desc) {...}
  //   tokenSales(where: { seller: $investor }, orderBy: timestamp, orderDirection: desc) {...}
  //   claims(where: { holder: $investor }, orderBy: timestamp, orderDirection: desc) {...}
  // }
  return []
}

export function useInvestmentHistory(address: Address | undefined) {
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['investment-history', address, page],
    queryFn: async (): Promise<{ events: InvestmentEvent[]; hasMore: boolean }> => {
      if (!address) return { events: [], hasMore: false }

      const events = await fetchInvestorHistory(address, {
        first: PAGE_SIZE,
        skip: page * PAGE_SIZE,
      })

      return {
        events,
        hasMore: events.length === PAGE_SIZE,
      }
    },
    enabled: !!address,
  })

  const loadMore = useCallback(() => {
    setPage((p) => p + 1)
  }, [])

  return {
    events: data?.events || [],
    isLoading,
    hasMore: data?.hasMore || false,
    loadMore,
  }
}
