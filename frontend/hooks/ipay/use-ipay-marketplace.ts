'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ipayService } from '@/lib/services/ipay-service'
import type { IPListing, MarketplaceFilters, IPCategory } from '@/lib/types/ipay'

export interface UseIPayMarketplaceReturn {
  listings: IPListing[]
  isLoading: boolean
  error: string | null
  filters: MarketplaceFilters
  setFilters: (filters: MarketplaceFilters | ((prev: MarketplaceFilters) => MarketplaceFilters)) => void
  refetch: () => Promise<void>
  totalCount: number
}

const DEFAULT_FILTERS: MarketplaceFilters = {
  sortBy: 'newest',
  isActive: true,
}

/**
 * Hook for browsing the IPay marketplace with filtering and sorting
 */
export function useIPayMarketplace(
  initialFilters: MarketplaceFilters = {}
): UseIPayMarketplaceReturn {
  const [listings, setListings] = useState<IPListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MarketplaceFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  })

  const fetchListings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await ipayService.getListings(filters)
      setListings(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch listings'
      setError(message)
      console.error('Error fetching marketplace listings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Fetch listings when filters change
  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Client-side filtering for search query and category (subgraph may not support text search)
  const filteredListings = useMemo(() => {
    let result = [...listings]

    // Filter by category (if not handled by subgraph)
    if (filters.category) {
      result = result.filter((listing) => listing.category === filters.category)
    }

    // Filter by search query (client-side text search)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query)
      )
    }

    return result
  }, [listings, filters.category, filters.searchQuery])

  return {
    listings: filteredListings,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchListings,
    totalCount: filteredListings.length,
  }
}

export default useIPayMarketplace
