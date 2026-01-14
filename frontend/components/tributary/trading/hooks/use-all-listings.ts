import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getActiveListings, type Listing as ServiceListing } from '@/lib/services/tributary'
import type { TradingFilterState } from '../components/trading-filters'
import type { Listing } from '../types'

export function useAllListings(filters: TradingFilterState) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['all-listings', filters],
    queryFn: getActiveListings,
    refetchInterval: 15_000,
    staleTime: 10_000,
  })

  const listings = useMemo((): Listing[] => {
    if (!data) return []

    let filtered = data.map((l: ServiceListing): Listing => ({
      id: l.listingId.toString(),
      seller: l.seller,
      tokenAddress: l.royaltyToken,
      vaultAddress: l.vault,
      amount: l.amount,
      remainingAmount: l.amount - l.sold,
      pricePerToken: l.pricePerToken,
      totalValue: ((l.amount - l.sold) * l.pricePerToken) / BigInt(1e18),
      expiresAt: Number(l.expiresAt),
      createdAt: Number(l.createdAt),
      isActive: l.isActive,
      tokenSymbol: 'RT',
    }))

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter((l) =>
        l.tokenSymbol?.toLowerCase().includes(search) || l.seller.toLowerCase().includes(search)
      )
    }

    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => Number(a.pricePerToken - b.pricePerToken))
        break
      case 'price_desc':
        filtered.sort((a, b) => Number(b.pricePerToken - a.pricePerToken))
        break
      case 'amount_desc':
        filtered.sort((a, b) => Number(b.remainingAmount - a.remainingAmount))
        break
      case 'newest':
      default:
        filtered.sort((a, b) => b.createdAt - a.createdAt)
    }

    return filtered
  }, [data, filters])

  return { listings, isLoading, refetch }
}
