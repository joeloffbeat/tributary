---
name: code-structure
description: Enforce file size limits and component decomposition for AI-friendly development. Load this skill FIRST before any coding task.
---

# Code Structure Skill

## CRITICAL: File Size Limits

**HARD LIMIT: 300 lines per file maximum.**

Files over 300 lines cause:
- AI context overflow (cannot read files > 25000 tokens)
- Harder maintenance and review
- Poor separation of concerns
- Difficult testing

## Decomposition Rules

### 1. Protocol Page Structure

Every protocol page MUST be decomposed into this structure:

```
app/crosschain/{protocol}/
├── page.tsx              # Main page (< 150 lines) - orchestration only
├── components/
│   ├── {protocol}-tabs.tsx    # Tab container (< 100 lines)
│   ├── bridge-tab.tsx         # Individual tabs (< 250 lines each)
│   ├── message-tab.tsx
│   ├── history-tab.tsx
│   └── shared/
│       ├── chain-select.tsx   # Reusable selectors (< 150 lines)
│       ├── token-select.tsx
│       └── progress-steps.tsx
├── hooks/
│   ├── use-{protocol}-bridge.ts   # Business logic hooks (< 200 lines)
│   ├── use-{protocol}-quote.ts
│   └── use-{protocol}-history.ts
├── types.ts              # Type definitions (< 100 lines)
└── constants.ts          # ABIs, addresses (< 150 lines)
```

### 2. What Goes Where

| Content Type | Location | Max Lines |
|-------------|----------|-----------|
| Main page component | `page.tsx` | 150 |
| Tab components | `components/{tab}-tab.tsx` | 250 |
| Shared UI components | `components/shared/*.tsx` | 150 |
| Business logic | `hooks/use-*.ts` | 200 |
| Type definitions | `types.ts` | 100 |
| ABIs and constants | `constants.ts` | 150 |
| Service layer | `lib/services/{protocol}-service.ts` | 300 |

### 3. Decomposition Triggers

**MUST decompose when:**
- File exceeds 300 lines
- Component has more than 3 useState hooks
- Multiple features in one component (tabs, modals, lists)
- ABIs/types mixed with UI code
- Helper functions exceed 50 lines total

### 4. Component Extraction Patterns

**Extract to hook when:**
```tsx
// BEFORE (in component)
const [loading, setLoading] = useState(false)
const [data, setData] = useState(null)
const [error, setError] = useState(null)

useEffect(() => {
  async function fetch() {
    setLoading(true)
    try {
      const result = await service.getData()
      setData(result)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }
  fetch()
}, [deps])

// AFTER (in hooks/use-data.ts)
export function useData(deps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  // ... logic
  return { data, loading, error, refetch }
}

// In component
const { data, loading, error, refetch } = useData(deps)
```

**Extract to constants when:**
```tsx
// BEFORE (in component)
const ABI = [{ name: 'transfer', ... }, ...]
const ADDRESSES = { token: '0x...', router: '0x...' }

// AFTER (in constants.ts)
export const TOKEN_ABI = [{ name: 'transfer', ... }] as const
export const ADDRESSES = { token: '0x...', router: '0x...' } as const
```

**Extract to types when:**
```tsx
// BEFORE (inline in component)
type Token = { address: string; symbol: string; decimals: number }
type Quote = { amount: bigint; fee: bigint; ... }

// AFTER (in types.ts)
export type Token = { address: string; symbol: string; decimals: number }
export type Quote = { amount: bigint; fee: bigint; ... }
```

## File Templates

### Main Page Template (page.tsx)

```tsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccount, ConnectButton } from '@/lib/web3'
import { BridgeTab } from './components/bridge-tab'
import { MessageTab } from './components/message-tab'
import { HistoryTab } from './components/history-tab'

export default function ProtocolPage() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <ConnectButton />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Protocol Name</h1>
          <p className="text-muted-foreground">Description</p>
        </header>

        <Tabs defaultValue="bridge" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bridge">Bridge</TabsTrigger>
            <TabsTrigger value="message">Message</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="bridge"><BridgeTab /></TabsContent>
          <TabsContent value="message"><MessageTab /></TabsContent>
          <TabsContent value="history"><HistoryTab /></TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
```

### Tab Component Template (components/bridge-tab.tsx)

```tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBridge } from '../hooks/use-bridge'
import { ChainSelect } from './shared/chain-select'
import { TokenSelect } from './shared/token-select'
import type { BridgeState } from '../types'

export function BridgeTab() {
  const {
    sourceChain,
    destChain,
    token,
    amount,
    quote,
    loading,
    error,
    setSourceChain,
    setDestChain,
    setToken,
    setAmount,
    executeBridge,
  } = useBridge()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bridge Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChainSelect
          value={sourceChain}
          onChange={setSourceChain}
          label="From"
        />
        <ChainSelect
          value={destChain}
          onChange={setDestChain}
          exclude={sourceChain?.chainId}
          label="To"
        />
        <TokenSelect
          tokens={sourceChain?.tokens || []}
          value={token}
          onChange={setToken}
        />
        {/* Amount input, quote display, execute button */}
      </CardContent>
    </Card>
  )
}
```

### Hook Template (hooks/use-bridge.ts)

```tsx
import { useState, useCallback, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { protocolService } from '@/lib/services/protocol-service'
import type { Chain, Token, Quote } from '../types'

export function useBridge() {
  const { address, chainId } = useAccount()
  const publicClient = usePublicClient()
  const walletClient = useWalletClient()

  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destChain, setDestChain] = useState<Chain | null>(null)
  const [token, setToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuote = useCallback(async () => {
    // Quote fetching logic
  }, [sourceChain, destChain, token, amount])

  const executeBridge = useCallback(async () => {
    // Bridge execution logic
  }, [quote, walletClient])

  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [fetchQuote])

  return {
    sourceChain,
    destChain,
    token,
    amount,
    quote,
    loading,
    error,
    setSourceChain,
    setDestChain,
    setToken,
    setAmount,
    executeBridge,
  }
}
```

### Types Template (types.ts)

```tsx
export type Chain = {
  chainId: number
  name: string
  tokens: Token[]
}

export type Token = {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

export type Quote = {
  amount: bigint
  fee: bigint
  estimatedTime: number
}

export type BridgeStep = {
  id: 'approve' | 'bridge' | 'relay'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  txHash?: string
  error?: string
}
```

### Constants Template (constants.ts)

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
```

## Shared Component Library

These components should exist in `components/protocols/shared/` for reuse:

| Component | Purpose | Max Lines |
|-----------|---------|-----------|
| `chain-select.tsx` | Chain dropdown with search | 120 |
| `token-select.tsx` | Token dropdown with search | 120 |
| `amount-input.tsx` | Amount input with balance | 80 |
| `progress-steps.tsx` | Transaction progress UI | 100 |
| `quote-display.tsx` | Quote details card | 80 |
| `tx-success.tsx` | Success state with explorer link | 60 |
| `copy-button.tsx` | Copy to clipboard | 30 |

## Anti-Patterns (NEVER DO)

```tsx
// NEVER: Everything in one file
// page.tsx with 3000 lines containing ABIs, types, 5 components

// NEVER: Inline ABIs in components
const abi = [{ name: 'transfer', ... }]

// NEVER: Multiple tabs in one component
function Page() {
  return (
    <Tabs>
      {/* 500 lines of bridge tab */}
      {/* 500 lines of message tab */}
      {/* 500 lines of history tab */}
    </Tabs>
  )
}

// NEVER: Business logic in render
function Component() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // 100 lines of fetching logic
  }, [])

  const handleSubmit = async () => {
    // 100 lines of submission logic
  }

  return (/* 300 lines of JSX */)
}
```

## Refactoring Checklist

When encountering a large file:

1. [ ] Count total lines - if > 300, MUST refactor
2. [ ] Identify ABIs → move to `constants.ts`
3. [ ] Identify types → move to `types.ts`
4. [ ] Identify hooks (useState + useEffect patterns) → move to `hooks/`
5. [ ] Identify reusable UI → move to `components/shared/`
6. [ ] Identify tabs/sections → separate into individual components
7. [ ] Main page should only orchestrate, not implement
8. [ ] Each file should have ONE responsibility

## Related Skills

- **ui-dev** - For component styling and animations
- **web3-integration** - For blockchain interactions
- **registry-dev** - For publishing to registry

## Quick Reference

| Metric | Limit |
|--------|-------|
| Max lines per file | 300 |
| Max lines for page.tsx | 150 |
| Max lines for tab component | 250 |
| Max lines for hook | 200 |
| Max lines for types | 100 |
| Max useState per component | 3 (then extract hook) |
| Max inline functions | 2 (then extract) |
