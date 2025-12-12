'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HyperlaneToken } from '../../types'

interface TokenSelectProps {
  tokens: HyperlaneToken[]
  selectedToken: HyperlaneToken | null
  onSelect: (token: HyperlaneToken) => void
  isLoading: boolean
}

export function TokenSelect({
  tokens,
  selectedToken,
  onSelect,
  isLoading,
}: TokenSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-36 h-14 justify-between">
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : selectedToken ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                {selectedToken.symbol.slice(0, 2)}
              </div>
              <span className="font-medium">{selectedToken.symbol}</span>
            </div>
          ) : (
            <span>Select</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search token"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-auto">
          {filteredTokens.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {tokens.length === 0 ? 'No warp routes on this chain' : 'No tokens found'}
            </div>
          ) : (
            filteredTokens.map((token) => (
              <button
                key={token.routerAddress}
                onClick={() => {
                  onSelect(token)
                  setOpen(false)
                  setSearch('')
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors',
                  selectedToken?.routerAddress === token.routerAddress && 'bg-muted'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                  {token.symbol.slice(0, 2)}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate">{token.name}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {token.type}
                </Badge>
                {selectedToken?.routerAddress === token.routerAddress && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
