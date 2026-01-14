'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface TradingFilterState {
  search?: string
  vaultId?: string
  sortBy?: 'price_asc' | 'price_desc' | 'amount_desc' | 'newest'
  minPrice?: number
  maxPrice?: number
}

interface TradingFiltersProps {
  filters: TradingFilterState
  onChange: (filters: TradingFilterState) => void
}

export function TradingFilters({ filters, onChange }: TradingFiltersProps) {
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-river-500" />
        <Input
          placeholder="Search by token name..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-10 bg-river-800/50"
        />
      </div>

      <Select
        value={filters.sortBy || 'newest'}
        onValueChange={(v) => onChange({ ...filters, sortBy: v as TradingFilterState['sortBy'] })}
      >
        <SelectTrigger className="w-40 bg-river-800/50">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
          <SelectItem value="amount_desc">Largest Amount</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})} className="text-river-400">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
