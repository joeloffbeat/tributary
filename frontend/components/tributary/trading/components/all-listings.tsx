'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTokenAmount, formatUSDC, formatAddress } from '@/lib/utils'
import { useAllListings } from '../hooks/use-all-listings'
import { BuyTokensDialog } from '../buy-tokens-dialog'
import type { TradingFilterState } from './trading-filters'
import type { Listing } from '../types'

interface AllListingsProps {
  filters: TradingFilterState
}

export function AllListings({ filters }: AllListingsProps) {
  const { listings, isLoading } = useAllListings(filters)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  if (isLoading) return <ListingsSkeleton />
  if (listings.length === 0) return <EmptyListings />

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing, idx) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <ListingCard listing={listing} onBuy={() => setSelectedListing(listing)} />
          </motion.div>
        ))}
      </div>

      {selectedListing && (
        <BuyTokensDialog
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          listing={selectedListing}
          onSuccess={() => setSelectedListing(null)}
        />
      )}
    </>
  )
}

function ListingCard({ listing, onBuy }: { listing: Listing; onBuy: () => void }) {
  const isExpiringSoon = listing.expiresAt > 0 && listing.expiresAt - Date.now() / 1000 < 86400

  return (
    <Card className="bg-river-800/50 border-river-700 hover:border-tributary-500/50 transition-colors">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-tributary-500/20 text-tributary-400">
              {listing.tokenSymbol}
            </Badge>
            {isExpiringSoon && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                <Clock className="h-3 w-3 mr-1" />
                Expiring
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-river-400">Amount</span>
            <span className="font-mono">{formatTokenAmount(listing.remainingAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-river-400">Price/Token</span>
            <span className="font-mono text-tributary-400">{formatUSDC(listing.pricePerToken)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-river-400">Total Value</span>
            <span className="font-mono font-medium">{formatUSDC(listing.totalValue)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-river-500">
          <User className="h-3 w-3" />
          <span>Seller: {formatAddress(listing.seller)}</span>
        </div>

        <Button onClick={onBuy} className="w-full bg-gradient-to-r from-tributary-500 to-tributary-600">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Buy Tokens
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyListings() {
  return (
    <div className="text-center py-12">
      <ShoppingCart className="h-12 w-12 text-river-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No Listings Available</h3>
      <p className="text-river-500 text-sm">Check back later or create your own listing</p>
    </div>
  )
}

function ListingsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  )
}
