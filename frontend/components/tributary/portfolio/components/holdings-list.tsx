'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SortAsc, Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HoldingCard, HoldingCardSkeleton } from './holding-card'
import type { PortfolioHolding } from '../types'

type SortOption = 'value_high' | 'value_low' | 'apy_high' | 'rewards_high'

interface HoldingsListProps {
  holdings: PortfolioHolding[]
  isLoading: boolean
  onClaimRewards?: (holding: PortfolioHolding) => void
  onSellTokens?: (holding: PortfolioHolding) => void
  onViewDetails?: (holding: PortfolioHolding) => void
}

export function HoldingsList({
  holdings,
  isLoading,
  onClaimRewards,
  onSellTokens,
  onViewDetails,
}: HoldingsListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('value_high')

  // Filter and sort holdings
  const filteredHoldings = useMemo(() => {
    let result = holdings.filter(
      (h) =>
        h.tokenName.toLowerCase().includes(search.toLowerCase()) ||
        h.tokenSymbol.toLowerCase().includes(search.toLowerCase())
    )

    // Sort
    switch (sortBy) {
      case 'value_high':
        result = result.sort((a, b) => Number(b.value - a.value))
        break
      case 'value_low':
        result = result.sort((a, b) => Number(a.value - b.value))
        break
      case 'apy_high':
        result = result.sort((a, b) => b.apy - a.apy)
        break
      case 'rewards_high':
        result = result.sort((a, b) => Number(b.pendingRewards - a.pendingRewards))
        break
    }

    return result
  }, [holdings, search, sortBy])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-river-800/50 rounded-lg animate-pulse" />
          <div className="w-40 h-10 bg-river-800/50 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <HoldingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-river-500" />
          <Input
            placeholder="Search holdings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-river-800/50"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-48 bg-river-800/50">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="value_high">Highest Value</SelectItem>
            <SelectItem value="value_low">Lowest Value</SelectItem>
            <SelectItem value="apy_high">Highest APY</SelectItem>
            <SelectItem value="rewards_high">Most Rewards</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-river-500">
        {filteredHoldings.length} {filteredHoldings.length === 1 ? 'holding' : 'holdings'}
      </p>

      {/* Holdings Grid */}
      {filteredHoldings.length === 0 ? (
        <EmptyHoldings hasSearch={search.length > 0} />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredHoldings.map((holding, index) => (
              <motion.div
                key={holding.vaultAddress}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <HoldingCard
                  holding={holding}
                  onClaim={() => onClaimRewards?.(holding)}
                  onSell={() => onSellTokens?.(holding)}
                  onViewDetails={() => onViewDetails?.(holding)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

function EmptyHoldings({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Wallet className="h-12 w-12 text-river-600 mb-4" />
      <h3 className="text-lg font-medium mb-2">
        {hasSearch ? 'No matching holdings' : 'No holdings yet'}
      </h3>
      <p className="text-river-500 text-sm max-w-sm">
        {hasSearch
          ? 'Try adjusting your search terms'
          : 'Browse the marketplace to find IP assets to invest in'}
      </p>
    </div>
  )
}
