'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Network, Coins, Globe, Server, ChevronDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type HyperlaneMode,
  type HyperlaneDeployment,
  getSupportedChains,
  getWarpRoutes,
  getTestnetChains,
  getMainnetChains,
} from '@/constants/hyperlane'
import { getChainDisplayName } from '../utils'

interface NetworksTabProps {
  hyperlaneMode: HyperlaneMode
}

export function NetworksTab({ hyperlaneMode }: NetworksTabProps) {
  const chains = getSupportedChains(hyperlaneMode)
  const testnetChains = getTestnetChains(hyperlaneMode)
  const mainnetChains = getMainnetChains(hyperlaneMode)
  const warpRoutes = getWarpRoutes(hyperlaneMode)

  const [activeView, setActiveView] = useState<'chains' | 'assets'>('chains')

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Network className="h-5 w-5" />Supported Networks</CardTitle>
            <CardDescription>{hyperlaneMode === 'hosted' ? 'Official Hyperlane deployments' : 'Your self-hosted deployments'}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={activeView === 'chains' ? 'default' : 'outline'} size="sm" onClick={() => setActiveView('chains')} className="gap-1"><Network className="h-4 w-4" />Chains</Button>
            <Button variant={activeView === 'assets' ? 'default' : 'outline'} size="sm" onClick={() => setActiveView('assets')} className="gap-1"><Coins className="h-4 w-4" />Assets</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {hyperlaneMode === 'hosted' ? <Badge className="bg-primary gap-1"><Globe className="h-3 w-3" />Hyperlane Hosted</Badge> : <Badge variant="secondary" className="gap-1"><Server className="h-3 w-3" />Self-Hosted</Badge>}
          <span className="text-xs text-muted-foreground">{chains.length} chain{chains.length !== 1 ? 's' : ''} available</span>
        </div>

        {activeView === 'chains' ? (
          <div className="space-y-4">
            {mainnetChains.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" />Mainnet ({mainnetChains.length})</h4>
                <div className="grid grid-cols-2 gap-2">{mainnetChains.map((chain) => <ChainCard key={chain.chainId} chain={chain} />)}</div>
              </div>
            )}
            {testnetChains.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" />Testnet ({testnetChains.length})</h4>
                <div className="grid grid-cols-2 gap-2">{testnetChains.map((chain) => <ChainCard key={chain.chainId} chain={chain} />)}</div>
              </div>
            )}
            {chains.length === 0 && (
              <div className="text-center py-8">
                <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No chains deployed</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {warpRoutes.length > 0 ? (
              warpRoutes.map((route, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    <span className="font-medium">{route.symbol}</span>
                    <span className="text-sm text-muted-foreground">({route.name})</span>
                    <Badge variant="outline" className="ml-auto">{route.decimals} decimals</Badge>
                  </div>
                  <div className="grid gap-2">
                    {route.chains.map((chainInfo) => (
                      <div key={chainInfo.chainId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">{chainInfo.chainName.slice(0, 2).toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-medium">{getChainDisplayName(chainInfo.chainId)}</p>
                            <p className="text-xs text-muted-foreground capitalize">{chainInfo.type}</p>
                          </div>
                        </div>
                        <code className="text-xs bg-background px-2 py-1 rounded">{chainInfo.routerAddress.slice(0, 8)}...{chainInfo.routerAddress.slice(-6)}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bridgeable assets</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChainCard({ chain }: { chain: HyperlaneDeployment }) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{chain.displayName.slice(0, 2).toUpperCase()}</div>
          <div>
            <p className="font-medium text-sm">{chain.displayName}</p>
            <p className="text-xs text-muted-foreground">Chain ID: {chain.chainId}</p>
          </div>
        </div>
        <Badge variant={chain.isTestnet ? 'secondary' : 'default'} className="text-xs">{chain.isTestnet ? 'Testnet' : 'Mainnet'}</Badge>
      </div>

      <Button variant="ghost" size="sm" className="w-full justify-between" onClick={() => setShowDetails(!showDetails)}>
        <span className="text-xs">Contract Details</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', showDetails && 'rotate-180')} />
      </Button>

      {showDetails && (
        <div className="space-y-2 pt-2 border-t text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Mailbox</span><code className="bg-muted px-1 rounded">{chain.mailbox.slice(0, 8)}...{chain.mailbox.slice(-6)}</code></div>
          {chain.interchainAccountRouter && <div className="flex justify-between"><span className="text-muted-foreground">ICA Router</span><code className="bg-muted px-1 rounded">{chain.interchainAccountRouter.slice(0, 8)}...{chain.interchainAccountRouter.slice(-6)}</code></div>}
          {chain.testRecipient && <div className="flex justify-between"><span className="text-muted-foreground">Test Recipient</span><code className="bg-muted px-1 rounded">{chain.testRecipient.slice(0, 8)}...{chain.testRecipient.slice(-6)}</code></div>}
          {chain.explorerUrl && <a href={chain.explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-primary hover:underline pt-1">Explorer <ExternalLink className="h-3 w-3" /></a>}
        </div>
      )}
    </div>
  )
}
