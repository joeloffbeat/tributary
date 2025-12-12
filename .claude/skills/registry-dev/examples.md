# Registry Development Examples

## Adding a New Protocol

### 1. Create Directory Structure

```bash
mkdir -p registry/protocols/my-protocol/frontend/{app/swap/my-protocol,lib/services,hooks/protocols/my-protocol,constants/protocols/my-protocol}
```

### 2. Create Service

```typescript
// registry/protocols/my-protocol/frontend/lib/services/my-protocol-service.ts

import { Address } from 'viem'

interface QuoteParams {
  tokenIn: Address
  tokenOut: Address
  amountIn: bigint
  chainId: number
}

interface QuoteResult {
  amountOut: bigint
  route: Address[]
  estimatedGas: bigint
}

interface SwapParams extends QuoteParams {
  recipient: Address
  slippage: number // 0.5 = 0.5%
}

interface SwapResult {
  to: Address
  data: `0x${string}`
  value: bigint
}

class MyProtocolService {
  private baseUrl = 'https://api.my-protocol.com/v1'

  async getQuote(params: QuoteParams): Promise<QuoteResult> {
    const response = await fetch(`${this.baseUrl}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amount: params.amountIn.toString(),
        chainId: params.chainId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Quote failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      amountOut: BigInt(data.amountOut),
      route: data.route,
      estimatedGas: BigInt(data.estimatedGas),
    }
  }

  async getSwap(params: SwapParams): Promise<SwapResult> {
    const response = await fetch(`${this.baseUrl}/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amount: params.amountIn.toString(),
        recipient: params.recipient,
        slippage: params.slippage * 100, // Convert to basis points
        chainId: params.chainId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Swap failed: ${response.statusText}`)
    }

    return response.json()
  }
}

export const myProtocolService = new MyProtocolService()
```

### 3. Create Hook

```typescript
// registry/protocols/my-protocol/frontend/hooks/protocols/my-protocol/use-my-protocol-quote.ts

import { useState, useEffect, useCallback } from 'react'
import { Address } from 'viem'
import { myProtocolService } from '@/lib/services/my-protocol-service'

interface UseQuoteParams {
  tokenIn: Address | undefined
  tokenOut: Address | undefined
  amountIn: bigint | undefined
  chainId: number | undefined
}

export function useMyProtocolQuote(params: UseQuoteParams) {
  const [quote, setQuote] = useState<{
    amountOut: bigint
    route: Address[]
    estimatedGas: bigint
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchQuote = useCallback(async () => {
    if (!params.tokenIn || !params.tokenOut || !params.amountIn || !params.chainId) {
      setQuote(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await myProtocolService.getQuote({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        chainId: params.chainId,
      })
      setQuote(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Quote failed'))
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }, [params.tokenIn, params.tokenOut, params.amountIn, params.chainId])

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [fetchQuote])

  return { quote, loading, error, refetch: fetchQuote }
}
```

### 4. Create Constants

```typescript
// registry/protocols/my-protocol/frontend/constants/protocols/my-protocol/index.ts

import { Address } from 'viem'

export const MY_PROTOCOL_ROUTER: Record<number, Address> = {
  1: '0x...', // Mainnet
  10: '0x...', // Optimism
  137: '0x...', // Polygon
  42161: '0x...', // Arbitrum
  8453: '0x...', // Base
}

export const SUPPORTED_CHAINS = [1, 10, 137, 42161, 8453]

export const DEFAULT_SLIPPAGE = 0.5 // 0.5%
```

### 5. Create Page

```typescript
// registry/protocols/my-protocol/frontend/app/swap/my-protocol/page.tsx

'use client'

import { useState } from 'react'
import { parseUnits, formatUnits } from 'viem'
// CRITICAL: Import from abstraction layer
import { useAccount, useWalletClient, usePublicClient, ConnectButton } from '@/lib/web3'
import { myProtocolService } from '@/lib/services/my-protocol-service'
import { useMyProtocolQuote } from '@/hooks/protocols/my-protocol/use-my-protocol-quote'
import { MY_PROTOCOL_ROUTER, DEFAULT_SLIPPAGE } from '@/constants/protocols/my-protocol'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function MyProtocolSwapPage() {
  const { address, isConnected, chainId } = useAccount()
  const walletClient = useWalletClient()
  const publicClient = usePublicClient()

  const [tokenIn, setTokenIn] = useState<`0x${string}` | undefined>()
  const [tokenOut, setTokenOut] = useState<`0x${string}` | undefined>()
  const [amountIn, setAmountIn] = useState('')
  const [loading, setLoading] = useState(false)

  const { quote, loading: quoteLoading } = useMyProtocolQuote({
    tokenIn,
    tokenOut,
    amountIn: amountIn ? parseUnits(amountIn, 18) : undefined,
    chainId,
  })

  const handleSwap = async () => {
    if (!walletClient || !publicClient || !address || !chainId || !quote) return

    setLoading(true)
    try {
      const swapData = await myProtocolService.getSwap({
        tokenIn: tokenIn!,
        tokenOut: tokenOut!,
        amountIn: parseUnits(amountIn, 18),
        recipient: address,
        slippage: DEFAULT_SLIPPAGE,
        chainId,
      })

      const hash = await walletClient.sendTransaction({
        to: swapData.to,
        data: swapData.data,
        value: swapData.value,
      })

      await publicClient.waitForTransactionReceipt({ hash })
      // Success!
    } catch (error) {
      console.error('Swap failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Protocol Swap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Amount"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />

          {quote && (
            <div className="text-sm text-muted-foreground">
              Output: {formatUnits(quote.amountOut, 18)}
            </div>
          )}

          <Button
            onClick={handleSwap}
            disabled={!quote || loading}
            className="w-full"
          >
            {loading ? 'Swapping...' : 'Swap'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 6. Create meta.json

```json
{
  "name": "my-protocol",
  "displayName": "My Protocol",
  "version": "1.0.0",
  "description": "Swap tokens via My Protocol",
  "category": "dex",
  "dependencies": {},
  "devDependencies": {},
  "envVars": [],
  "files": [
    {
      "source": "frontend/app/swap/my-protocol/page.tsx",
      "target": "app/swap/my-protocol/page.tsx"
    },
    {
      "source": "frontend/lib/services/my-protocol-service.ts",
      "target": "lib/services/my-protocol-service.ts"
    },
    {
      "source": "frontend/hooks/protocols/my-protocol/use-my-protocol-quote.ts",
      "target": "hooks/protocols/my-protocol/use-my-protocol-quote.ts"
    },
    {
      "source": "frontend/constants/protocols/my-protocol/index.ts",
      "target": "constants/protocols/my-protocol/index.ts"
    }
  ],
  "supportedChains": [1, 10, 137, 42161, 8453],
  "features": ["Token Swaps", "Best Price Routing"]
}
```

### 7. Update registry.json

```json
{
  "protocols": {
    "my-protocol": {
      "name": "My Protocol",
      "description": "Swap tokens via My Protocol",
      "category": "dex",
      "path": "protocols/my-protocol",
      "dependencies": {}
    }
  }
}
```

## Adding an Auth Provider

### Hook Implementation Example

```typescript
// registry/auth-providers/new-provider/frontend/lib/web3/account.ts

import { useAccount as useProviderAccount } from 'new-provider-sdk'
import { Web3Account } from './types'

export function useAccount(): Web3Account {
  const { address, isConnected, isConnecting, connector } = useProviderAccount()

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected: !isConnected && !isConnecting,
    chainId: connector?.chainId,
    connector,
  }
}
```

### Index Re-exports

```typescript
// registry/auth-providers/new-provider/frontend/lib/web3/index.ts

// Account
export { useAccount } from './account'

// Clients
export { usePublicClient, useWalletClient } from './clients'

// Chain
export { useChainId, useSwitchChain, useChains } from './chain'

// Balance
export { useBalance } from './balance'

// Transactions
export { useSendTransaction, useWaitForTransaction } from './transaction'

// Contracts
export { useReadContract, useWriteContract } from './contract'

// Connection
export { useConnect, useDisconnect } from './connection'

// ENS
export { useEnsName, useEnsAvatar } from './ens'

// Signatures
export { useSignMessage, useSignTypedData } from './signature'

// Types
export type * from './types'
```

## Testing Locally

```bash
# Set environment variable
export EVM_KIT_REGISTRY_URL=/path/to/evm-starter-kit/registry

# Build CLI
cd packages/evm-kit
npm run build

# Test list command
node dist/index.js list

# Test init with new protocol
node dist/index.js init test-app --protocols my-protocol

# Verify files were copied
ls test-app/app/swap/my-protocol/
ls test-app/lib/services/
```
