'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Trash2, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTokenAmount, formatUSDC } from '@/lib/utils'
import { useAllListings } from '../hooks/use-all-listings'
import { CreateListingDialog } from '../create-listing-dialog'
import type { Address } from 'viem'
import type { PortfolioHolding } from '../../portfolio/types'
import type { Listing } from '../types'

interface MyListingsProps {
  address?: Address
  holdings: PortfolioHolding[]
}

export function MyListings({ address, holdings }: MyListingsProps) {
  const { listings, isLoading } = useAllListings({})
  const [showCreateListing, setShowCreateListing] = useState(false)
  const [selectedHolding, setSelectedHolding] = useState<PortfolioHolding | null>(null)

  const myListings = address
    ? listings.filter((l) => l.seller.toLowerCase() === address.toLowerCase())
    : []

  if (isLoading) return <ListingsSkeleton />

  const handleCreateListing = (holding: PortfolioHolding) => {
    setSelectedHolding(holding)
    setShowCreateListing(true)
  }

  return (
    <div className="space-y-6">
      {/* Holdings available to list */}
      {holdings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-river-400">Available to List</h3>
          <div className="flex flex-wrap gap-2">
            {holdings.map((holding) => (
              <Button
                key={holding.tokenAddress}
                variant="outline"
                size="sm"
                onClick={() => handleCreateListing(holding)}
                className="border-river-700 hover:border-tributary-500/50"
              >
                <Plus className="h-3 w-3 mr-1" />
                {holding.tokenSymbol} ({formatTokenAmount(holding.balance)})
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* My active listings */}
      {myListings.length === 0 ? (
        <EmptyMyListings hasHoldings={holdings.length > 0} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myListings.map((listing, idx) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <MyListingCard listing={listing} />
            </motion.div>
          ))}
        </div>
      )}

      {selectedHolding && (
        <CreateListingDialog
          isOpen={showCreateListing}
          onClose={() => setShowCreateListing(false)}
          holding={selectedHolding}
          onSuccess={() => setShowCreateListing(false)}
        />
      )}
    </div>
  )
}

function MyListingCard({ listing }: { listing: Listing }) {
  const isExpiringSoon = listing.expiresAt > 0 && listing.expiresAt - Date.now() / 1000 < 86400
  const percentSold = listing.amount > 0n
    ? Number((listing.amount - listing.remainingAmount) * 100n / listing.amount)
    : 0

  return (
    <Card className="bg-river-800/50 border-river-700">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
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

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-river-400">Listed</span>
            <span className="font-mono">{formatTokenAmount(listing.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-river-400">Remaining</span>
            <span className="font-mono">{formatTokenAmount(listing.remainingAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-river-400">Price</span>
            <span className="font-mono text-tributary-400">{formatUSDC(listing.pricePerToken)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-river-500">
            <span>{percentSold}% sold</span>
            <span>{formatUSDC(listing.totalValue)} remaining</span>
          </div>
          <div className="h-1.5 bg-river-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tributary-500 to-tributary-400"
              style={{ width: `${percentSold}%` }}
            />
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10">
          <Trash2 className="h-4 w-4 mr-2" />
          Cancel Listing
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyMyListings({ hasHoldings }: { hasHoldings: boolean }) {
  return (
    <div className="text-center py-12">
      <Tag className="h-12 w-12 text-river-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No Active Listings</h3>
      <p className="text-river-500 text-sm">
        {hasHoldings
          ? 'Select a token above to create your first listing'
          : 'Purchase some tokens to start trading'}
      </p>
    </div>
  )
}

function ListingsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-xl" />
      ))}
    </div>
  )
}
