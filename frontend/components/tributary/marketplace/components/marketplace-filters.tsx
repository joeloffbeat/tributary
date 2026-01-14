'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CategoryChips } from './category-chips'
import { AdvancedFilters } from './advanced-filters'

export type VaultCategory = 'all' | 'music' | 'art' | 'video' | 'gaming' | 'literature' | 'other'
export type SortOption = 'newest' | 'apy_high' | 'apy_low' | 'popular' | 'value_high'

export interface MarketplaceFilterState {
  search?: string
  category?: VaultCategory
  sortBy?: SortOption
  minApy?: number
  maxApy?: number
  minPrice?: number
  maxPrice?: number
  showOnlyAvailable?: boolean
}

interface MarketplaceFiltersProps {
  filters: MarketplaceFilterState
  onFiltersChange: (filters: MarketplaceFilterState) => void
  resultCount: number
}

function countActiveFilters(filters: MarketplaceFilterState): number {
  let count = 0
  if (filters.search) count++
  if (filters.category && filters.category !== 'all') count++
  if (filters.minApy && filters.minApy > 0) count++
  if (filters.maxApy !== undefined && filters.maxApy < 100) count++
  if (filters.minPrice && filters.minPrice > 0) count++
  if (filters.maxPrice !== undefined && filters.maxPrice < 1000) count++
  if (filters.showOnlyAvailable) count++
  return count
}

function ActiveFilterBadges({
  filters,
  onClear,
}: {
  filters: MarketplaceFilterState
  onClear: (filters: MarketplaceFilterState) => void
}) {
  const badges: { key: string; label: string; onRemove: () => void }[] = []

  if (filters.search) {
    badges.push({
      key: 'search',
      label: `"${filters.search}"`,
      onRemove: () => onClear({ ...filters, search: undefined }),
    })
  }
  if (filters.category && filters.category !== 'all') {
    badges.push({
      key: 'category',
      label: filters.category,
      onRemove: () => onClear({ ...filters, category: 'all' }),
    })
  }
  if ((filters.minApy && filters.minApy > 0) || (filters.maxApy !== undefined && filters.maxApy < 100)) {
    badges.push({
      key: 'apy',
      label: `APY: ${filters.minApy || 0}%-${filters.maxApy ?? 100}%`,
      onRemove: () => onClear({ ...filters, minApy: undefined, maxApy: undefined }),
    })
  }
  if ((filters.minPrice && filters.minPrice > 0) || (filters.maxPrice !== undefined && filters.maxPrice < 1000)) {
    badges.push({
      key: 'price',
      label: `Price: $${filters.minPrice || 0}-$${filters.maxPrice ?? 1000}`,
      onRemove: () => onClear({ ...filters, minPrice: undefined, maxPrice: undefined }),
    })
  }
  if (filters.showOnlyAvailable) {
    badges.push({
      key: 'available',
      label: 'Available only',
      onRemove: () => onClear({ ...filters, showOnlyAvailable: false }),
    })
  }

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(({ key, label, onRemove }) => (
        <Badge key={key} variant="secondary" className="bg-river-800/60 text-foreground gap-1 pr-1">
          {label}
          <button onClick={onRemove} className="ml-1 hover:bg-river-700 rounded p-0.5">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onClear({})}>
        Clear all
      </Button>
    </div>
  )
}

// Main component
export function MarketplaceFilters({ filters, onFiltersChange, resultCount }: MarketplaceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const activeFilterCount = countActiveFilters(filters)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue || undefined })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, filters, onFiltersChange])

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vaults..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 bg-river-800/50 border-slate-700 focus:border-tributary-500"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filters.sortBy || 'popular'}
            onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as SortOption })}
          >
            <SelectTrigger className="w-[160px] bg-river-800/50 border-slate-700">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="apy_high">Highest APY</SelectItem>
              <SelectItem value="apy_low">Lowest APY</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="value_high">Highest Value</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile: Sheet trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative border-slate-700">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-tributary-500 text-white text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-900 border-slate-700">
              <SheetHeader>
                <SheetTitle className="text-foreground">Filters</SheetTitle>
              </SheetHeader>
              <AdvancedFilters filters={filters} onFiltersChange={onFiltersChange} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Category Chips */}
      <CategoryChips
        selected={filters.category || 'all'}
        onSelect={(category) => onFiltersChange({ ...filters, category })}
      />

      {/* Active Filters */}
      <ActiveFilterBadges filters={filters} onClear={onFiltersChange} />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {resultCount} {resultCount === 1 ? 'vault' : 'vaults'} found
      </div>
    </div>
  )
}
