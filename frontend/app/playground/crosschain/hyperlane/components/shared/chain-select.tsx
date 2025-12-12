'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChainLogo } from './chain-logo'
import type { ChainSelectOption } from '../../types'

interface ChainSelectProps {
  chains: ChainSelectOption[]
  selectedChain: ChainSelectOption | null
  onSelect: (chain: ChainSelectOption) => void
  isLoading: boolean
  excludeChainId?: number
}

export function ChainSelect({
  chains,
  selectedChain,
  onSelect,
  isLoading,
  excludeChainId,
}: ChainSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredChains = chains.filter(
    (chain) =>
      chain.chainId !== excludeChainId && chain.name.toLowerCase().includes(search.toLowerCase())
  )

  const sortedChains = [...filteredChains].sort((a, b) => {
    if (a.disabled && !b.disabled) return 1
    if (!a.disabled && b.disabled) return -1
    return 0
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full h-12 justify-between">
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : selectedChain ? (
            <div className="flex items-center gap-2">
              <ChainLogo chainId={selectedChain.chainId} name={selectedChain.name} size="sm" />
              <span className="font-medium truncate">{selectedChain.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select chain</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chain"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-auto">
          {sortedChains.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No chains found</div>
          ) : (
            sortedChains.map((chain) => {
              const isDisabled = chain.disabled
              return (
                <button
                  key={chain.chainId}
                  onClick={() => {
                    if (!isDisabled) {
                      onSelect(chain)
                      setOpen(false)
                      setSearch('')
                    }
                  }}
                  disabled={isDisabled}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 transition-colors',
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed bg-muted/30'
                      : 'hover:bg-muted cursor-pointer',
                    selectedChain?.chainId === chain.chainId && !isDisabled && 'bg-muted'
                  )}
                  title={isDisabled ? chain.disabledReason : undefined}
                >
                  <ChainLogo chainId={chain.chainId} name={chain.name} size="md" />
                  <div className="flex-1 text-left">
                    <span className={cn('font-medium', isDisabled && 'text-muted-foreground')}>
                      {chain.name}
                    </span>
                    {isDisabled && (
                      <p className="text-xs text-muted-foreground/70 truncate">
                        {chain.disabledReason || 'Not supported'}
                      </p>
                    )}
                  </div>
                  {!isDisabled && chain.tokens.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {chain.tokens.length} token{chain.tokens.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {isDisabled && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Disabled
                    </Badge>
                  )}
                  {selectedChain?.chainId === chain.chainId && !isDisabled && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
