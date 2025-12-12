'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSwitchChain, ConnectButton } from '@/lib/web3'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeftRight, MessageSquare, Wallet, History, Network, Activity, Globe, Server, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import { APP_MODE, getSupportedChainList } from '@/lib/config/chains'
import { type HyperlaneMode, getSupportedChains, isHyperlaneDeployed, getHyperlaneDeployment } from '@/constants/hyperlane'
import { BridgeTab, MessageTab, ICATab, HistoryTab, NetworksTab, StatusTab } from './components'
import { useMessageHistory } from './hooks'
import { STORAGE_KEYS } from './constants'
import type { ChainSelectOption } from './types'

export default function HyperlanePage() {
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const chainId = chain?.id

  const [activeTab, setActiveTab] = useState('bridge')
  const [hyperlaneMode, setHyperlaneMode] = useState<HyperlaneMode>('self-hosted')
  const [allChainOptions, setAllChainOptions] = useState<ChainSelectOption[]>([])
  const [sourceChain, setSourceChain] = useState<ChainSelectOption | null>(null)
  const [destChain, setDestChain] = useState<ChainSelectOption | null>(null)
  const [isLoadingChains, setIsLoadingChains] = useState(false)

  const { trackedMessages, isPolling, trackMessage, clearHistory, removeFromHistory, refreshStatuses, addManualMessage } = useMessageHistory()

  const isOnSupportedChain = chainId ? hyperlaneService.isChainSupported(chainId) : false
  const shouldShowTestnet = APP_MODE === 'testnet' || (APP_MODE === 'both' && chainId ? hyperlaneService.isTestnetChain(chainId) : true)
  const needsChainSwitch = isConnected && sourceChain !== null && chainId !== sourceChain.chainId

  // Load mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEYS.MODE) as HyperlaneMode | null
    if (savedMode && (savedMode === 'hosted' || savedMode === 'self-hosted')) {
      setHyperlaneMode(savedMode)
    }
  }, [])

  const handleModeChange = (newMode: HyperlaneMode) => {
    setHyperlaneMode(newMode)
    localStorage.setItem(STORAGE_KEYS.MODE, newMode)
    setSourceChain(null)
    setDestChain(null)
  }

  // Initialize chains
  useEffect(() => {
    const init = async () => {
      setIsLoadingChains(true)
      try {
        await hyperlaneService.initialize()
        hyperlaneService.setMode(hyperlaneMode)

        const hyperlaneChains = hyperlaneService.getSupportedChains({ testnet: shouldShowTestnet, mode: hyperlaneMode })
        const appChains = getSupportedChainList()

        const chainOptions: ChainSelectOption[] = appChains.map((appChain) => {
          const cId = appChain.chain.id
          const hyperlaneChain = hyperlaneChains.find(c => c.chainId === cId)
          const isSupported = isHyperlaneDeployed(cId, hyperlaneMode)

          if (hyperlaneChain && isSupported) {
            return { ...hyperlaneChain, disabled: false }
          }
          return {
            chainId: cId,
            domainId: cId,
            name: appChain.name,
            mailbox: '0x0000000000000000000000000000000000000000' as `0x${string}`,
            explorerUrl: appChain.explorerUrl,
            logoUrl: appChain.iconUrl,
            tokens: [],
            disabled: true,
            disabledReason: hyperlaneMode === 'hosted' ? 'Not supported' : 'No self-hosted deployment',
          }
        })

        setAllChainOptions(chainOptions)

        const currentChainOption = chainOptions.find((c) => c.chainId === chainId)
        if (currentChainOption && !currentChainOption.disabled) {
          setSourceChain(currentChainOption)
          const otherChain = chainOptions.find((c) => c.chainId !== chainId && !c.disabled)
          if (otherChain) setDestChain(otherChain)
        } else {
          const firstEnabled = chainOptions.find(c => !c.disabled)
          if (firstEnabled) {
            setSourceChain(firstEnabled)
            const secondEnabled = chainOptions.find(c => c.chainId !== firstEnabled.chainId && !c.disabled)
            if (secondEnabled) setDestChain(secondEnabled)
          }
        }
      } finally {
        setIsLoadingChains(false)
      }
    }
    init()
  }, [chainId, shouldShowTestnet, hyperlaneMode])

  useEffect(() => {
    if (chainId && allChainOptions.length > 0) {
      const currentChain = allChainOptions.find((c) => c.chainId === chainId)
      if (currentChain && !currentChain.disabled && currentChain.chainId !== sourceChain?.chainId) {
        setSourceChain(currentChain)
      }
    }
  }, [chainId, allChainOptions, sourceChain?.chainId])

  const handleSwapChains = () => {
    const temp = sourceChain
    setSourceChain(destChain)
    setDestChain(temp)
    if (destChain && switchChain) switchChain(destChain.chainId)
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8"><CardHeader><CardTitle>Connect Wallet</CardTitle></CardHeader><CardContent><ConnectButton /></CardContent></Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Hyperlane</h1>
          <p className="text-muted-foreground">Permissionless cross-chain messaging, token bridging, and interchain accounts</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {!isOnSupportedChain && (
            <Card className="border-destructive">
              <CardHeader><div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" /><CardTitle className="text-destructive">Unsupported Network</CardTitle></div><CardDescription>{hyperlaneMode === 'hosted' ? 'Switch to a chain with Hyperlane hosted deployment.' : 'Switch to a chain with self-hosted deployment.'}</CardDescription></CardHeader>
              <CardContent><div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">{getSupportedChains(hyperlaneMode).filter(chain => shouldShowTestnet ? chain.isTestnet : !chain.isTestnet).slice(0, 8).map((chain) => <Button key={chain.chainId} variant="outline" onClick={() => switchChain?.(chain.chainId)} className="justify-start text-sm" size="sm"><div className={cn("w-2 h-2 rounded-full mr-2", chain.isTestnet ? "bg-orange-500" : "bg-green-500")} />{chain.displayName}</Button>)}</div></CardContent>
            </Card>
          )}

          <Tabs value={hyperlaneMode} onValueChange={(val) => handleModeChange(val as HyperlaneMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="self-hosted" className="gap-2">
                <Server className="h-4 w-4" />
                Self-Hosted
              </TabsTrigger>
              <TabsTrigger value="hosted" className="gap-2">
                <Globe className="h-4 w-4" />
                Hosted
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="bridge" className="gap-1 px-2"><ArrowLeftRight className="h-4 w-4" /><span className="hidden md:inline text-xs">Bridge</span></TabsTrigger>
              <TabsTrigger value="messaging" className="gap-1 px-2"><MessageSquare className="h-4 w-4" /><span className="hidden md:inline text-xs">Message</span></TabsTrigger>
              <TabsTrigger value="ica" className="gap-1 px-2"><Wallet className="h-4 w-4" /><span className="hidden md:inline text-xs">ICA</span></TabsTrigger>
              <TabsTrigger value="history" className="gap-1 px-2"><History className="h-4 w-4" /><span className="hidden md:inline text-xs">History</span></TabsTrigger>
              <TabsTrigger value="networks" className="gap-1 px-2"><Network className="h-4 w-4" /><span className="hidden md:inline text-xs">Networks</span></TabsTrigger>
              <TabsTrigger value="status" className="gap-1 px-2"><Activity className="h-4 w-4" /><span className="hidden md:inline text-xs">Status</span></TabsTrigger>
            </TabsList>

            <TabsContent value="bridge"><BridgeTab supportedChains={allChainOptions} sourceChain={sourceChain} destChain={destChain} setSourceChain={setSourceChain} setDestChain={setDestChain} isLoadingChains={isLoadingChains} handleSwapChains={handleSwapChains} needsChainSwitch={needsChainSwitch} switchChain={switchChain} trackMessage={trackMessage} hyperlaneMode={hyperlaneMode} /></TabsContent>
            <TabsContent value="messaging"><MessageTab supportedChains={allChainOptions} sourceChain={sourceChain} destChain={destChain} setSourceChain={setSourceChain} setDestChain={setDestChain} isLoadingChains={isLoadingChains} handleSwapChains={handleSwapChains} needsChainSwitch={needsChainSwitch} switchChain={switchChain} trackMessage={trackMessage} hyperlaneMode={hyperlaneMode} /></TabsContent>
            <TabsContent value="ica"><ICATab supportedChains={allChainOptions} sourceChain={sourceChain} destChain={destChain} setSourceChain={setSourceChain} setDestChain={setDestChain} isLoadingChains={isLoadingChains} needsChainSwitch={needsChainSwitch} switchChain={switchChain} trackMessage={trackMessage} hyperlaneMode={hyperlaneMode} /></TabsContent>
            <TabsContent value="history"><HistoryTab trackedMessages={trackedMessages} clearHistory={clearHistory} removeFromHistory={removeFromHistory} isPolling={isPolling} hyperlaneMode={hyperlaneMode} /></TabsContent>
            <TabsContent value="networks"><NetworksTab hyperlaneMode={hyperlaneMode} /></TabsContent>
            <TabsContent value="status"><StatusTab trackedMessages={trackedMessages} refreshStatuses={refreshStatuses} addManualMessage={addManualMessage} isPolling={isPolling} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
