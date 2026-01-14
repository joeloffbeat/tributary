'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import type { MarketplaceFilterState } from './marketplace-filters'

interface AdvancedFiltersProps {
  filters: MarketplaceFilterState
  onFiltersChange: (filters: MarketplaceFilterState) => void
}

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const apyRange = [filters.minApy ?? 0, filters.maxApy ?? 100]
  const priceRange = [filters.minPrice ?? 0, filters.maxPrice ?? 1000]

  return (
    <div className="space-y-6 py-4">
      {/* APY Range */}
      <div className="space-y-3">
        <Label className="text-foreground">APY Range</Label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-12 font-mono">
            {apyRange[0]}%
          </span>
          <Slider
            min={0}
            max={100}
            step={1}
            value={apyRange}
            onValueChange={([min, max]) =>
              onFiltersChange({ ...filters, minApy: min, maxApy: max })
            }
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-12 text-right font-mono">
            {apyRange[1]}%
          </span>
        </div>
      </div>

      {/* Token Price Range */}
      <div className="space-y-3">
        <Label className="text-foreground">Token Price (USDC)</Label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-14 font-mono">
            ${priceRange[0]}
          </span>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={priceRange}
            onValueChange={([min, max]) =>
              onFiltersChange({ ...filters, minPrice: min, maxPrice: max })
            }
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-14 text-right font-mono">
            ${priceRange[1]}
          </span>
        </div>
      </div>

      {/* Show only available */}
      <div className="flex items-center justify-between py-2">
        <Label htmlFor="available-only" className="text-foreground cursor-pointer">
          Only show with available tokens
        </Label>
        <Switch
          id="available-only"
          checked={filters.showOnlyAvailable ?? false}
          onCheckedChange={(checked) =>
            onFiltersChange({ ...filters, showOnlyAvailable: checked })
          }
        />
      </div>

      {/* Clear all */}
      <Button
        variant="outline"
        className="w-full border-slate-700 hover:border-tributary-500 hover:text-tributary-500"
        onClick={() => onFiltersChange({})}
      >
        Clear All Filters
      </Button>
    </div>
  )
}
