'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from '@/lib/web3'
import { ipayService } from '@/lib/services/ipay-service'
import type { UsageReceipt, IPListing } from '../types'

export interface EnrichedReceipt extends UsageReceipt {
  listing?: IPListing
}

export interface UseIPayReceiptsReturn {
  receipts: EnrichedReceipt[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  totalSpent: bigint
}

/**
 * Hook for fetching user's payment receipts from the IPay subgraph
 */
export function useIPayReceipts(): UseIPayReceiptsReturn {
  const { address, isConnected } = useAccount()

  const [receipts, setReceipts] = useState<EnrichedReceipt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user receipts
  const fetchReceipts = useCallback(async () => {
    if (!address) {
      setReceipts([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch receipts from subgraph
      const userReceipts = await ipayService.getReceiptsByUser(address)

      // Enrich receipts with listing data (batch fetch)
      const enrichedReceipts: EnrichedReceipt[] = await Promise.all(
        userReceipts.map(async (receipt) => {
          try {
            const listing = await ipayService.getListingById(receipt.listingId)
            return { ...receipt, listing: listing || undefined }
          } catch {
            return receipt
          }
        })
      )

      setReceipts(enrichedReceipts)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch receipts'
      setError(message)
      console.error('Error fetching receipts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // Fetch receipts when address changes
  useEffect(() => {
    if (isConnected && address) {
      fetchReceipts()
    } else {
      setReceipts([])
    }
  }, [isConnected, address, fetchReceipts])

  // Calculate total spent
  const totalSpent = receipts.reduce((acc, receipt) => acc + receipt.amount, 0n)

  return {
    receipts,
    isLoading,
    error,
    refetch: fetchReceipts,
    totalSpent,
  }
}

export default useIPayReceipts
