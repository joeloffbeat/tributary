# Code Structure Examples

## Example 1: Refactoring a Large Protocol Page

### Before (2980 lines in one file)

```tsx
// app/crosschain/hyperlane/page.tsx (2980 lines - BAD)
'use client'

import { useState, useEffect } from 'react'
// ... 50 more imports

// Inline ABIs (100+ lines)
const TOKEN_ROUTER_ABI = [...]
const MAILBOX_ABI = [...]
const ERC20_ABI = [...]

// Inline types (50+ lines)
type BridgeStep = {...}
type TrackedMessage = {...}
type ChainSelectOption = {...}

// Helper functions (100+ lines)
function extractMessageIdFromLogs(logs) {...}
function getChainDisplayName(chainId) {...}

// Main component (1500+ lines)
export default function HyperlanePage() {
  // 30+ useState hooks
  const [mode, setMode] = useState<'hosted' | 'self-hosted'>('hosted')
  const [activeTab, setActiveTab] = useState('bridge')
  const [sourceChain, setSourceChain] = useState(null)
  // ... 27 more useState

  // 10+ useEffect hooks
  useEffect(() => { /* load chains */ }, [])
  useEffect(() => { /* load tokens */ }, [])
  // ... more effects

  // Inline tab components (500+ lines each)
  const BridgeTab = () => (/* 500 lines of JSX */)
  const MessageTab = () => (/* 500 lines of JSX */)
  const ICATab = () => (/* 400 lines of JSX */)
  const HistoryTab = () => (/* 300 lines of JSX */)

  return (
    <main>
      <Tabs>
        <TabsContent value="bridge">{BridgeTab()}</TabsContent>
        <TabsContent value="message">{MessageTab()}</TabsContent>
        <TabsContent value="ica">{ICATab()}</TabsContent>
        <TabsContent value="history">{HistoryTab()}</TabsContent>
      </Tabs>
    </main>
  )
}

// Shared components at bottom (300+ lines)
function ChainSelect({...}) {...}
function TokenSelect({...}) {...}
function ChainLogo({...}) {...}
function CopyButton({...}) {...}
```

### After (Properly Decomposed)

**Directory Structure:**
```
app/crosschain/hyperlane/
├── page.tsx                    (80 lines)
├── components/
│   ├── bridge-tab.tsx          (200 lines)
│   ├── message-tab.tsx         (180 lines)
│   ├── ica-tab.tsx             (160 lines)
│   ├── history-tab.tsx         (150 lines)
│   └── shared/
│       ├── chain-select.tsx    (100 lines)
│       ├── token-select.tsx    (100 lines)
│       ├── chain-logo.tsx      (40 lines)
│       └── copy-button.tsx     (25 lines)
├── hooks/
│   ├── use-hyperlane-bridge.ts (180 lines)
│   ├── use-hyperlane-message.ts (120 lines)
│   ├── use-hyperlane-ica.ts    (100 lines)
│   └── use-message-history.ts  (80 lines)
├── types.ts                    (60 lines)
└── constants.ts                (80 lines)
```

**page.tsx (80 lines):**
```tsx
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccount, ConnectButton } from '@/lib/web3'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { BridgeTab } from './components/bridge-tab'
import { MessageTab } from './components/message-tab'
import { ICATab } from './components/ica-tab'
import { HistoryTab } from './components/history-tab'
import type { HyperlaneMode } from './types'

export default function HyperlanePage() {
  const { isConnected } = useAccount()
  const [mode, setMode] = useState<HyperlaneMode>('hosted')

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectButton />
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Hyperlane</h1>
          <p className="text-muted-foreground">
            Cross-chain messaging and token bridging
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Label>Hosted</Label>
            <Switch
              checked={mode === 'self-hosted'}
              onCheckedChange={(checked) => setMode(checked ? 'self-hosted' : 'hosted')}
            />
            <Label>Self-Hosted</Label>
          </div>
        </header>

        <Tabs defaultValue="bridge" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bridge">Bridge</TabsTrigger>
            <TabsTrigger value="message">Message</TabsTrigger>
            <TabsTrigger value="ica">ICA</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="bridge"><BridgeTab mode={mode} /></TabsContent>
          <TabsContent value="message"><MessageTab mode={mode} /></TabsContent>
          <TabsContent value="ica"><ICATab mode={mode} /></TabsContent>
          <TabsContent value="history"><HistoryTab /></TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
```

**types.ts (60 lines):**
```tsx
export type HyperlaneMode = 'hosted' | 'self-hosted'

export type HyperlaneChain = {
  chainId: number
  name: string
  mailbox: string
  tokens: HyperlaneToken[]
}

export type HyperlaneToken = {
  symbol: string
  name: string
  decimals: number
  routerAddress: string
  type: 'native' | 'synthetic' | 'collateral'
}

export type HyperlaneQuote = {
  amount: bigint
  fee: bigint
  estimatedTime: number
}

export type BridgeStep = {
  id: 'approve' | 'transfer' | 'relay'
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  txHash?: string
  messageId?: string
  error?: string
}

export type TrackedMessage = {
  messageId: string
  originChainId: number
  destinationChainId: number
  type: 'bridge' | 'message' | 'ica'
  status: 'pending' | 'delivered' | 'failed'
  originTxHash: string
  destinationTxHash?: string
  timestamp: number
  description: string
}
```

**constants.ts (80 lines):**
```tsx
export const TOKEN_ROUTER_ABI = [
  {
    name: 'transferRemote',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_destination', type: 'uint32' },
      { name: '_recipient', type: 'bytes32' },
      { name: '_amountOrId', type: 'uint256' },
    ],
    outputs: [{ name: 'messageId', type: 'bytes32' }],
  },
] as const

export const MAILBOX_ABI = [
  {
    name: 'dispatch',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_destinationDomain', type: 'uint32' },
      { name: '_recipientAddress', type: 'bytes32' },
      { name: '_messageBody', type: 'bytes' },
    ],
    outputs: [{ name: 'messageId', type: 'bytes32' }],
  },
] as const

export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const STORAGE_KEYS = {
  TRACKED_MESSAGES: 'hyperlane_tracked_messages',
  LAST_MODE: 'hyperlane_last_mode',
} as const

export const DISPATCH_ID_EVENT_TOPIC = '0x...' as const
```

**hooks/use-hyperlane-bridge.ts (180 lines):**
```tsx
import { useState, useCallback, useEffect } from 'react'
import { parseUnits, formatUnits } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import type { HyperlaneChain, HyperlaneToken, HyperlaneQuote, BridgeStep, HyperlaneMode } from '../types'

export function useHyperlaneBridge(mode: HyperlaneMode) {
  const { address, chainId } = useAccount()
  const publicClient = usePublicClient()
  const walletClient = useWalletClient()

  // Chain state
  const [chains, setChains] = useState<HyperlaneChain[]>([])
  const [sourceChain, setSourceChain] = useState<HyperlaneChain | null>(null)
  const [destChain, setDestChain] = useState<HyperlaneChain | null>(null)
  const [chainsLoading, setChainsLoading] = useState(true)

  // Token state
  const [token, setToken] = useState<HyperlaneToken | null>(null)
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState('0')

  // Quote state
  const [quote, setQuote] = useState<HyperlaneQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  // Transaction state
  const [steps, setSteps] = useState<BridgeStep[]>([])
  const [executing, setExecuting] = useState(false)

  // Load chains
  useEffect(() => {
    async function loadChains() {
      setChainsLoading(true)
      try {
        const data = await hyperlaneService.getChains(mode)
        setChains(data)
      } catch (e) {
        console.error('Failed to load chains:', e)
      } finally {
        setChainsLoading(false)
      }
    }
    loadChains()
  }, [mode])

  // Fetch quote
  const fetchQuote = useCallback(async () => {
    if (!sourceChain || !destChain || !token || !amount || parseFloat(amount) <= 0) {
      setQuote(null)
      return
    }

    setQuoteLoading(true)
    setQuoteError(null)

    try {
      const q = await hyperlaneService.getQuote({
        sourceChainId: sourceChain.chainId,
        destChainId: destChain.chainId,
        token: token.routerAddress,
        amount: parseUnits(amount, token.decimals),
      })
      setQuote(q)
    } catch (e) {
      setQuoteError(e instanceof Error ? e.message : 'Failed to get quote')
      setQuote(null)
    } finally {
      setQuoteLoading(false)
    }
  }, [sourceChain, destChain, token, amount])

  // Debounced quote fetch
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [fetchQuote])

  // Execute bridge
  const executeBridge = useCallback(async () => {
    if (!walletClient || !publicClient || !quote || !sourceChain || !destChain || !token || !address) {
      return
    }

    setExecuting(true)
    setSteps([
      { id: 'approve', label: 'Approve token', status: 'pending' },
      { id: 'transfer', label: 'Send to bridge', status: 'pending' },
      { id: 'relay', label: 'Wait for relay', status: 'pending' },
    ])

    try {
      // Approval step
      setSteps(s => s.map(step => step.id === 'approve' ? { ...step, status: 'in_progress' } : step))

      // ... approval logic

      setSteps(s => s.map(step => step.id === 'approve' ? { ...step, status: 'completed' } : step))

      // Transfer step
      setSteps(s => s.map(step => step.id === 'transfer' ? { ...step, status: 'in_progress' } : step))

      // ... transfer logic

      setSteps(s => s.map(step => step.id === 'transfer' ? { ...step, status: 'completed' } : step))

      // Relay step
      setSteps(s => s.map(step => step.id === 'relay' ? { ...step, status: 'in_progress' } : step))

      // ... wait for relay

      setSteps(s => s.map(step => step.id === 'relay' ? { ...step, status: 'completed' } : step))

    } catch (e) {
      const error = e instanceof Error ? e.message : 'Bridge failed'
      setSteps(s => s.map(step =>
        step.status === 'in_progress' ? { ...step, status: 'failed', error } : step
      ))
    } finally {
      setExecuting(false)
    }
  }, [walletClient, publicClient, quote, sourceChain, destChain, token, address])

  return {
    chains,
    chainsLoading,
    sourceChain,
    destChain,
    token,
    amount,
    balance,
    quote,
    quoteLoading,
    quoteError,
    steps,
    executing,
    setSourceChain,
    setDestChain,
    setToken,
    setAmount,
    executeBridge,
  }
}
```

**components/bridge-tab.tsx (200 lines):**
```tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, ArrowDown } from 'lucide-react'
import { useHyperlaneBridge } from '../hooks/use-hyperlane-bridge'
import { ChainSelect } from './shared/chain-select'
import { TokenSelect } from './shared/token-select'
import { ProgressSteps } from './shared/progress-steps'
import type { HyperlaneMode } from '../types'

interface BridgeTabProps {
  mode: HyperlaneMode
}

export function BridgeTab({ mode }: BridgeTabProps) {
  const {
    chains,
    chainsLoading,
    sourceChain,
    destChain,
    token,
    amount,
    balance,
    quote,
    quoteLoading,
    quoteError,
    steps,
    executing,
    setSourceChain,
    setDestChain,
    setToken,
    setAmount,
    executeBridge,
  } = useHyperlaneBridge(mode)

  const canBridge =
    sourceChain &&
    destChain &&
    token &&
    amount &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= parseFloat(balance) &&
    quote &&
    !quoteLoading

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bridge Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source Chain */}
        <div className="space-y-2">
          <label className="text-sm font-medium">From Chain</label>
          <ChainSelect
            chains={chains}
            selected={sourceChain}
            onSelect={setSourceChain}
            loading={chainsLoading}
            exclude={destChain?.chainId}
          />
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="p-2 rounded-full border">
            <ArrowDown className="h-4 w-4" />
          </div>
        </div>

        {/* Destination Chain */}
        <div className="space-y-2">
          <label className="text-sm font-medium">To Chain</label>
          <ChainSelect
            chains={chains}
            selected={destChain}
            onSelect={setDestChain}
            loading={chainsLoading}
            exclude={sourceChain?.chainId}
          />
        </div>

        {/* Token */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Token</label>
            {token && (
              <span className="text-xs text-muted-foreground">
                Balance: {parseFloat(balance).toFixed(4)} {token.symbol}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <TokenSelect
              tokens={sourceChain?.tokens || []}
              selected={token}
              onSelect={setToken}
              loading={!sourceChain}
            />
          </div>
        </div>

        {/* Quote Error */}
        {quoteError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{quoteError}</AlertDescription>
          </Alert>
        )}

        {/* Quote Info */}
        {quote && (
          <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You will receive</span>
              <span>{quote.amount.toString()} {token?.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span>{quote.fee.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. time</span>
              <span>{quote.estimatedTime}s</span>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {steps.length > 0 && <ProgressSteps steps={steps} />}

        {/* Bridge Button */}
        <Button
          className="w-full"
          onClick={executeBridge}
          disabled={!canBridge || executing}
        >
          {executing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Bridging...
            </>
          ) : quoteLoading ? (
            'Getting quote...'
          ) : !sourceChain || !destChain ? (
            'Select chains'
          ) : !token ? (
            'Select token'
          ) : !amount || parseFloat(amount) <= 0 ? (
            'Enter amount'
          ) : parseFloat(amount) > parseFloat(balance) ? (
            'Insufficient balance'
          ) : !quote ? (
            'Unable to get quote'
          ) : (
            'Bridge'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
```

**components/shared/chain-select.tsx (100 lines):**
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChainLogo } from './chain-logo'
import type { HyperlaneChain } from '../../types'

interface ChainSelectProps {
  chains: HyperlaneChain[]
  selected: HyperlaneChain | null
  onSelect: (chain: HyperlaneChain) => void
  loading: boolean
  exclude?: number
}

export function ChainSelect({ chains, selected, onSelect, loading, exclude }: ChainSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredChains = chains.filter(
    (chain) =>
      chain.chainId !== exclude &&
      chain.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full h-12 justify-between">
          {loading ? (
            <Skeleton className="h-4 w-24" />
          ) : selected ? (
            <div className="flex items-center gap-2">
              <ChainLogo chainId={selected.chainId} name={selected.name} />
              <span className="font-medium truncate">{selected.name}</span>
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
          {filteredChains.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No chains found</div>
          ) : (
            filteredChains.map((chain) => (
              <button
                key={chain.chainId}
                onClick={() => {
                  onSelect(chain)
                  setOpen(false)
                  setSearch('')
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors',
                  selected?.chainId === chain.chainId && 'bg-muted'
                )}
              >
                <ChainLogo chainId={chain.chainId} name={chain.name} />
                <span className="font-medium flex-1 text-left">{chain.name}</span>
                {selected?.chainId === chain.chainId && (
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
```

## Example 2: Extracting a Hook

### Before (Logic in component)

```tsx
function SwapComponent() {
  const [srcToken, setSrcToken] = useState(null)
  const [dstToken, setDstToken] = useState(null)
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [txHash, setTxHash] = useState(null)

  useEffect(() => {
    async function fetchQuote() {
      if (!srcToken || !dstToken || !amount) return
      setLoading(true)
      setError(null)
      try {
        const q = await service.getQuote(srcToken, dstToken, amount)
        setQuote(q)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [srcToken, dstToken, amount])

  const handleSwap = async () => {
    setLoading(true)
    try {
      const hash = await service.executeSwap(quote)
      setTxHash(hash)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (/* 200 lines of JSX */)
}
```

### After (Logic extracted to hook)

**hooks/use-swap.ts:**
```tsx
export function useSwap() {
  const [srcToken, setSrcToken] = useState(null)
  const [dstToken, setDstToken] = useState(null)
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [txHash, setTxHash] = useState(null)

  const fetchQuote = useCallback(async () => {
    if (!srcToken || !dstToken || !amount) {
      setQuote(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const q = await service.getQuote(srcToken, dstToken, amount)
      setQuote(q)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get quote')
    } finally {
      setLoading(false)
    }
  }, [srcToken, dstToken, amount])

  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [fetchQuote])

  const executeSwap = useCallback(async () => {
    if (!quote) return
    setLoading(true)
    setError(null)
    try {
      const hash = await service.executeSwap(quote)
      setTxHash(hash)
      return hash
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Swap failed')
    } finally {
      setLoading(false)
    }
  }, [quote])

  return {
    srcToken,
    dstToken,
    amount,
    quote,
    loading,
    error,
    txHash,
    setSrcToken,
    setDstToken,
    setAmount,
    executeSwap,
  }
}
```

**Component (now much simpler):**
```tsx
function SwapComponent() {
  const {
    srcToken,
    dstToken,
    amount,
    quote,
    loading,
    error,
    txHash,
    setSrcToken,
    setDstToken,
    setAmount,
    executeSwap,
  } = useSwap()

  return (
    <Card>
      <TokenSelect value={srcToken} onChange={setSrcToken} />
      <TokenSelect value={dstToken} onChange={setDstToken} />
      <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
      {error && <Alert variant="destructive">{error}</Alert>}
      {quote && <QuoteDisplay quote={quote} />}
      <Button onClick={executeSwap} disabled={loading || !quote}>
        {loading ? 'Swapping...' : 'Swap'}
      </Button>
    </Card>
  )
}
```
