---
name: web3-integration
description: Smart contract interactions using the web3 abstraction layer, TransactionDialog for writes, and viem for reads. Use when building wallet connections, contract calls, or transaction UIs. (project)
---

# Web3 Integration Skill

## CRITICAL: File Size Limits

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

Protocol pages MUST follow this structure:

```
app/crosschain/{protocol}/
├── page.tsx              # Orchestration only (< 150 lines)
├── components/
│   ├── bridge-tab.tsx    # Tab components (< 250 lines)
│   ├── message-tab.tsx
│   └── shared/
│       ├── chain-select.tsx
│       └── token-select.tsx
├── hooks/
│   ├── use-{protocol}-bridge.ts   # Business logic (< 200 lines)
│   └── use-{protocol}-quote.ts
├── types.ts              # Type definitions (< 100 lines)
└── constants.ts          # ABIs, addresses (< 150 lines)
```

See **code-structure** skill for detailed decomposition patterns.

## BEFORE WRITING ANY CODE

**MANDATORY: Use Context7 MCP for all documentation lookups.**

```
1. Resolve library ID:
   mcp__context7__resolve-library-id({ libraryName: "viem" })
   mcp__context7__resolve-library-id({ libraryName: "wagmi" })

2. Fetch docs for your specific task:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/wevm/viem",
     topic: "readContract",
     mode: "code"
   })

3. NEVER guess viem/wagmi API signatures - verify with Context7 first
4. If Context7 doesn't have the library, state this and ask user for docs
```

---

## When to Use This Skill

Load this skill when:
- Connecting wallets or checking connection status
- Reading data from smart contracts
- Writing to smart contracts (transactions)
- Building transaction confirmation UIs
- Working with token balances or allowances
- Switching chains or handling multi-chain

## Core Rules

1. **ALWAYS import from `@/lib/web3`** - Never import directly from wagmi or viem
2. **ALWAYS use TransactionDialog for writes** - Never call walletClient.sendTransaction directly
3. **Contracts come from constants** - Use `getContractByName()` or `getContractsForChain()`
4. **Handle loading/error states** - Show skeletons while loading, alerts on error
5. **Check chain support** - Verify user is on correct chain before operations

## Decision Tree

```
Need wallet data?
├─ Connection status → useAccount()
├─ Balance → useBalance()
├─ Chain info → useChainId(), useChains()
└─ Switch network → useSwitchChain()

Need to read contract?
├─ One-time read → publicClient.readContract()
├─ Reactive read → useReadContract()
└─ Multiple reads → Promise.all with publicClient.readContract()

Need to write contract?
└─ ALWAYS use TransactionDialog component

Need raw client?
├─ Read operations → usePublicClient()
└─ Write operations → useWalletClient()
```

## Common Tasks

### Adding a Contract Read

1. Look up viem `readContract` via Context7
2. Import from abstraction layer:
   ```tsx
   import { useAccount, usePublicClient } from '@/lib/web3'
   import { getContractByName } from '@/constants/contracts'
   ```
3. Load contract from constants (never hardcode addresses)
4. Call `publicClient.readContract()` with address, abi, functionName, args
5. Handle loading/error states in UI

### Adding a Contract Write

1. Look up transaction patterns via Context7
2. Import TransactionDialog and contract utilities
3. Build `ContractCallParams` object with address, abi, functionName, args
4. Pass params to TransactionDialog component
5. Handle onSuccess callback to refresh data

### Adding Chain Switching

1. Look up chain switching via Context7
2. Use `useSwitchChain()` from `@/lib/web3`
3. Check current chain with `useChainId()`
4. Call `switchChain(targetChainId)` when needed

## Abstraction Layer Imports

```tsx
// CORRECT - Always use the abstraction
import {
  useAccount,
  useBalance,
  useChainId,
  useSwitchChain,
  useChains,
  usePublicClient,
  useWalletClient,
  useGasPrice,
  ConnectButton,
} from '@/lib/web3'

// WRONG - Never import directly
import { useAccount } from 'wagmi'  // DON'T DO THIS
```

## Anti-Patterns (NEVER DO)

```tsx
// NEVER call sendTransaction directly
const hash = await walletClient.sendTransaction({ to, data, value })

// ALWAYS use TransactionDialog
<TransactionDialog
  open={open}
  onOpenChange={setOpen}
  params={txParams}
  chainId={chainId}
  onSuccess={handleSuccess}
/>

// NEVER hardcode contract addresses
const TOKEN = '0x1234...'

// Load from constants
const contract = await getContractByName(chainId, 'Token')

// NEVER skip chain validation
const result = await publicClient.readContract({ ... })

// Check chain first
if (!isChainSupported(chainId)) {
  return <SwitchChainPrompt requiredChain={requiredChainId} />
}
```

## TransactionDialog Usage

The TransactionDialog handles ALL write operations. It provides:
- Tenderly simulation (where supported)
- Gas estimation and cost display
- AI-generated transaction summary
- Execution with toast notifications
- Error handling

### Basic Pattern

```tsx
import { TransactionDialog } from '@/components/web3/transactions/transaction-dialog'
import { getContractByName } from '@/constants/contracts'
import { useState } from 'react'

function TransferButton({ to, amount }: { to: string; amount: bigint }) {
  const { chainId } = useAccount()
  const [open, setOpen] = useState(false)
  const [params, setParams] = useState(null)

  const handleClick = async () => {
    const contract = await getContractByName(chainId, 'Token')
    setParams({
      address: contract.address,
      abi: contract.abi,
      functionName: 'transfer',
      args: [to, amount],
    })
    setOpen(true)
  }

  return (
    <>
      <Button onClick={handleClick}>Transfer</Button>
      <TransactionDialog
        open={open}
        onOpenChange={setOpen}
        params={params}
        chainId={chainId}
        onSuccess={(receipt) => {
          toast.success('Transfer complete!')
        }}
      />
    </>
  )
}
```

## Contract Loading

Contracts are synced from deployments to `frontend/constants/contracts/`:

```typescript
import { getContractByName, getContractsForChain } from '@/constants/contracts'

// Get single contract
const token = await getContractByName(chainId, 'Token')
// Returns: { address, name, description, abi }

// Get all contracts for chain
const contracts = await getContractsForChain(chainId)
```

## Protocol Page Best Practices

### Page Component (page.tsx)

The main page should ONLY orchestrate - no business logic:

```tsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccount, ConnectButton } from '@/lib/web3'
import { BridgeTab } from './components/bridge-tab'
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
        <Tabs defaultValue="bridge">
          <TabsList>
            <TabsTrigger value="bridge">Bridge</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="bridge"><BridgeTab /></TabsContent>
          <TabsContent value="history"><HistoryTab /></TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
```

### Tab Component Pattern

Each tab gets its own component with a dedicated hook:

```tsx
// components/bridge-tab.tsx
'use client'

import { useBridge } from '../hooks/use-bridge'
import { ChainSelect } from './shared/chain-select'
import { TokenSelect } from './shared/token-select'

export function BridgeTab() {
  const {
    sourceChain,
    destChain,
    token,
    quote,
    loading,
    error,
    setSourceChain,
    setDestChain,
    setToken,
    executeBridge,
  } = useBridge()

  return (
    <Card>
      <ChainSelect value={sourceChain} onChange={setSourceChain} />
      <ChainSelect value={destChain} onChange={setDestChain} />
      <TokenSelect tokens={sourceChain?.tokens} value={token} onChange={setToken} />
      {/* Quote display, execute button */}
    </Card>
  )
}
```

### Hook Pattern

All business logic goes in hooks:

```tsx
// hooks/use-bridge.ts
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
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Quote fetching with debounce
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [sourceChain, destChain, token, amount])

  const executeBridge = useCallback(async () => {
    // Bridge execution logic
  }, [quote, walletClient])

  return {
    sourceChain,
    destChain,
    token,
    quote,
    loading,
    error,
    setSourceChain,
    setDestChain,
    setToken,
    executeBridge,
  }
}
```

### Types File

Keep types in a dedicated file:

```tsx
// types.ts
export type Chain = {
  chainId: number
  name: string
  tokens: Token[]
}

export type Token = {
  address: string
  symbol: string
  decimals: number
}

export type Quote = {
  amount: bigint
  fee: bigint
}

export type BridgeStep = {
  id: 'approve' | 'bridge' | 'relay'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  txHash?: string
}
```

### Constants File

Keep ABIs and addresses separate:

```tsx
// constants.ts
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

## Related Skills

- **code-structure** - For file size limits and decomposition patterns
- **ui-dev** - For transaction UI components, loading states, error displays
- **contracts-dev** - For deploying contracts that will be called from frontend

## Quick Reference

| Task | Code |
|------|------|
| Check connected | `const { isConnected } = useAccount()` |
| Get address | `const { address } = useAccount()` |
| Get chain | `const { chainId } = useAccount()` |
| Get balance | `const { balance } = useBalance()` |
| Switch chain | `const { switchChain } = useSwitchChain()` |
| Read contract | `publicClient.readContract({ address, abi, functionName })` |
| Write contract | Use `<TransactionDialog />` |

See `reference.md` for detailed API docs and `examples.md` for common patterns.
