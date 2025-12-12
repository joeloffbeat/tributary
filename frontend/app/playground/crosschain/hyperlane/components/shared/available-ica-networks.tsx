'use client'

import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupportedChains } from '@/constants/hyperlane'
import { ChainLogo } from './chain-logo'
import type { HyperlaneMode } from '../../types'

interface AvailableICANetworksProps {
  hyperlaneMode: HyperlaneMode
  currentChainId: number
  switchChain?: (chainId: number) => void
}

export function AvailableICANetworks({
  hyperlaneMode,
  currentChainId,
  switchChain,
}: AvailableICANetworksProps) {
  // Get all chains with ICA router for the current mode
  const chainsWithICA = getSupportedChains(hyperlaneMode)
    .filter((chain) => chain.interchainAccountRouter && chain.chainId !== currentChainId)

  if (chainsWithICA.length === 0) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            No networks with ICA Router available in {hyperlaneMode === 'hosted' ? 'Hyperlane Hosted' : 'Self-Hosted'} mode.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">
            Available ICA Networks ({hyperlaneMode === 'hosted' ? 'Hyperlane Hosted' : 'Self-Hosted'})
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Switch to one of these networks to use Interchain Accounts
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {chainsWithICA.map((chain) => (
          <Button
            key={chain.chainId}
            variant="outline"
            size="sm"
            className="justify-start h-auto py-2 px-3"
            onClick={() => switchChain?.(chain.chainId)}
          >
            <ChainLogo chainId={chain.chainId} name={chain.displayName} size="sm" />
            <span className="truncate text-xs ml-2">{chain.displayName}</span>
            <div
              className={cn(
                'ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0',
                chain.isTestnet ? 'bg-orange-500' : 'bg-green-500'
              )}
            />
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {chainsWithICA.length} network{chainsWithICA.length !== 1 ? 's' : ''} with ICA support
      </p>
    </div>
  )
}
