'use client'

import { useState } from 'react'
import { Filter, ChevronDown } from 'lucide-react'

export interface FilterState {
  sortBy?: 'volume' | 'dividend' | 'newest' | 'price'
  minDividend?: number
  maxTradeFee?: number
}

interface FiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export function MarketplaceFilters({ filters, onChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        FILTERS
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-cream-light rounded-lg shadow-md p-4 z-10">
          {/* Sort By */}
          <div className="mb-4">
            <label className="font-body text-xs text-text-muted block mb-2">
              SORT BY
            </label>
            <select
              value={filters.sortBy || 'volume'}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
              className="input-premium w-full"
            >
              <option value="volume">HIGHEST VOLUME</option>
              <option value="dividend">HIGHEST DIVIDEND</option>
              <option value="newest">NEWEST</option>
              <option value="price">LOWEST PRICE</option>
            </select>
          </div>

          {/* Min Dividend */}
          <div className="mb-4">
            <label className="font-body text-xs text-text-muted block mb-2">
              MIN DIVIDEND %
            </label>
            <input
              type="number"
              value={filters.minDividend || ''}
              onChange={(e) => onChange({ ...filters, minDividend: parseInt(e.target.value) || undefined })}
              placeholder="0"
              className="input-premium w-full"
            />
          </div>

          {/* Max Trade Fee */}
          <div className="mb-4">
            <label className="font-body text-xs text-text-muted block mb-2">
              MAX TRADE FEE %
            </label>
            <input
              type="number"
              value={filters.maxTradeFee || ''}
              onChange={(e) => onChange({ ...filters, maxTradeFee: parseInt(e.target.value) || undefined })}
              placeholder="5"
              className="input-premium w-full"
            />
          </div>

          {/* Reset */}
          <button
            onClick={() => onChange({})}
            className="font-body text-xs text-tributary hover:text-tributary-light"
          >
            RESET FILTERS
          </button>
        </div>
      )}
    </div>
  )
}
