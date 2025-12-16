'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from '@/lib/web3'
import { ipayService } from '@/lib/services/ipay-service'
import type { CreatorAnalytics, IPListing, UsageReceipt } from '@/lib/types/ipay'

export interface UseIPayAnalyticsReturn {
  analytics: CreatorAnalytics | null
  listings: IPListing[]
  recentPayments: UsageReceipt[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const EMPTY_ANALYTICS: CreatorAnalytics = {
  totalListings: 0,
  activeListings: 0,
  totalUses: 0,
  totalRevenue: 0n,
  topListings: [],
  recentReceipts: [],
  revenueByCategory: {
    images: 0n,
    music: 0n,
    code: 0n,
    data: 0n,
    templates: 0n,
    other: 0n,
  },
}

/**
 * Hook for fetching creator analytics and dashboard data
 */
export function useIPayAnalytics(): UseIPayAnalyticsReturn {
  const { address, isConnected } = useAccount()

  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null)
  const [listings, setListings] = useState<IPListing[]>([])
  const [recentPayments, setRecentPayments] = useState<UsageReceipt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!isConnected || !address) {
      setAnalytics(EMPTY_ANALYTICS)
      setListings([])
      setRecentPayments([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch creator analytics from subgraph
      const data = await ipayService.getCreatorAnalytics(address)
      setAnalytics(data)
      setListings(data.topListings)
      setRecentPayments(data.recentReceipts)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics'
      setError(message)
      console.error('Error fetching creator analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address])

  // Fetch analytics on mount and when address changes
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analytics,
    listings,
    recentPayments,
    isLoading,
    error,
    refetch: fetchAnalytics,
  }
}

export default useIPayAnalytics
