import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getListingsByToken } from '@/lib/services/tributary'
import type { Address } from 'viem'
import type { OrderBookEntry } from '../types'
import type { Listing } from '@/lib/services/tributary-types'

export function useOrderBook(tokenAddress: Address) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['order-book', tokenAddress],
    queryFn: async () => {
      // Fetch active listings for this token
      const listings = await getListingsByToken(tokenAddress)
      return listings
    },
    refetchInterval: 10_000, // Refresh every 10 seconds
    staleTime: 5_000,
  })

  // Aggregate listings into order book
  const { asks, bids } = useMemo((): { asks: OrderBookEntry[]; bids: OrderBookEntry[] } => {
    if (!data) return { asks: [], bids: [] }

    // Group by price and aggregate
    const priceMap = new Map<string, OrderBookEntry>()

    data.forEach((listing: Listing) => {
      if (!listing.isActive) return
      const remainingAmount = listing.amount - listing.sold
      if (remainingAmount <= 0n) return

      const priceKey = listing.pricePerToken.toString()
      const existing = priceMap.get(priceKey)

      // Convert Listing to our local Listing type for storage
      const localListing = {
        id: listing.listingId.toString(),
        seller: listing.seller,
        tokenAddress: listing.royaltyToken,
        vaultAddress: listing.vault,
        amount: listing.amount,
        remainingAmount,
        pricePerToken: listing.pricePerToken,
        totalValue: (remainingAmount * listing.pricePerToken) / BigInt(1e18),
        expiresAt: Number(listing.expiresAt),
        createdAt: Number(listing.createdAt),
        isActive: listing.isActive,
      }

      if (existing) {
        existing.totalAmount += remainingAmount
        existing.listingCount += 1
        existing.listings.push(localListing)
      } else {
        priceMap.set(priceKey, {
          price: listing.pricePerToken,
          totalAmount: remainingAmount,
          listingCount: 1,
          listings: [localListing],
        })
      }
    })

    // Sort: asks ascending, bids descending
    const entries = Array.from(priceMap.values())
    const sorted = entries.sort((a, b) => Number(b.price - a.price))

    // All current listings are sell orders (asks)
    // In a full orderbook, you'd separate buy orders
    return {
      asks: sorted,
      bids: [], // Future: support buy orders
    }
  }, [data])

  // Calculate mid price and spread
  const midPrice = useMemo(() => {
    if (asks.length === 0) return undefined
    // With only asks, use lowest ask as reference
    return asks[asks.length - 1]?.price
  }, [asks])

  const spread = useMemo(() => {
    if (asks.length < 2) return undefined
    const lowestAsk = asks[asks.length - 1]?.price
    const secondLowest = asks[asks.length - 2]?.price
    if (lowestAsk && secondLowest) {
      return secondLowest - lowestAsk
    }
    return undefined
  }, [asks])

  return {
    asks,
    bids,
    midPrice,
    spread,
    isLoading,
    refetch,
  }
}
