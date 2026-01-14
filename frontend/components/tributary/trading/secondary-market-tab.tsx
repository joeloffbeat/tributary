'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, Activity, History, Tag } from 'lucide-react'
import { useAccount } from '@/lib/web3'
import { AllListings } from './components/all-listings'
import { MyListings } from './components/my-listings'
import { RecentTrades } from './components/recent-trades'
import { TradingFilters, type TradingFilterState } from './components/trading-filters'
import { CreateListingDialog } from './create-listing-dialog'
import type { PortfolioHolding } from '../portfolio/types'

interface SecondaryMarketTabProps {
  holdings?: PortfolioHolding[]
}

export function SecondaryMarketTab({ holdings = [] }: SecondaryMarketTabProps) {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState('listings')
  const [filters, setFilters] = useState<TradingFilterState>({})
  const [showCreateListing, setShowCreateListing] = useState(false)
  const [selectedHolding, setSelectedHolding] = useState<PortfolioHolding | null>(null)

  const hasHoldings = holdings.length > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-tributary-400" />
            Secondary Market
          </h2>
          <p className="text-river-400 mt-1">Trade royalty tokens with other investors</p>
        </div>

        {hasHoldings && (
          <Button
            onClick={() => {
              setSelectedHolding(holdings[0])
              setShowCreateListing(true)
            }}
            className="bg-gradient-to-r from-tributary-500 to-tributary-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        )}
      </div>

      {/* Filters */}
      <TradingFilters filters={filters} onChange={setFilters} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-river-800/50 p-1">
          <TabsTrigger value="listings" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            All Listings
          </TabsTrigger>
          <TabsTrigger value="my-listings" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            My Listings
          </TabsTrigger>
          <TabsTrigger value="trades" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Trades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          <AllListings filters={filters} />
        </TabsContent>

        <TabsContent value="my-listings" className="mt-6">
          <MyListings address={address} holdings={holdings} />
        </TabsContent>

        <TabsContent value="trades" className="mt-6">
          <RecentTrades filters={filters} />
        </TabsContent>
      </Tabs>

      {/* Create Listing Dialog */}
      {selectedHolding && (
        <CreateListingDialog
          isOpen={showCreateListing}
          onClose={() => setShowCreateListing(false)}
          holding={selectedHolding}
          onSuccess={() => setShowCreateListing(false)}
        />
      )}
    </motion.div>
  )
}
