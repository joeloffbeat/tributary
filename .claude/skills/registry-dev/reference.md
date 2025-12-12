# Registry Development Reference

## When to Use What

| Need | Use This | Not This | Why |
|------|----------|----------|-----|
| Auth provider hooks | `frontend/lib/web3/*.ts` | Direct wagmi | Abstraction layer |
| Protocol page | `app/swap/{name}/page.tsx` | Random location | CLI expects this path |
| Protocol service | `lib/services/{name}-service.ts` | Inline in page | Reusable, testable |
| Constants | `constants/protocols/{name}/` | Hardcoded values | Maintainable |
| File mappings | `meta.json` files array | Manual copying | CLI automated |
| Test locally | `EVM_KIT_REGISTRY_URL` env | Push to remote | Fast iteration |
| Import web3 hooks | `@/lib/web3` | `wagmi` | Provider-agnostic |

---

## Registry Structure

```
registry/
├── registry.json              # Master manifest
├── foundation/
│   └── web3-interface/        # Always installed (abstraction layer)
├── auth-providers/            # Pick ONE during init
│   ├── reown/
│   ├── dynamic/
│   ├── privy/
│   ├── rainbowkit/
│   └── thirdweb/
├── contract-frameworks/       # Pick ONE during init
│   ├── foundry/
│   └── hardhat3/
├── indexers/                  # Pick ONE or NONE
│   ├── goldsky/
│   └── thegraph/
├── database/                  # Optional
│   └── supabase/
└── protocols/                 # Add MANY anytime
    ├── 1inch/
    ├── lifi/
    ├── uniswap/
    └── .../
```

## registry.json Schema

```json
{
  "version": "1.0.0",
  "foundation": {
    "web3-interface": {
      "name": "Web3 Interface",
      "description": "Core abstraction layer",
      "path": "foundation/web3-interface",
      "required": true
    }
  },
  "authProviders": {
    "reown": {
      "name": "Reown (WalletConnect)",
      "description": "WalletConnect v2 integration",
      "path": "auth-providers/reown",
      "dependencies": {}
    }
  },
  "protocols": {
    "uniswap": {
      "name": "Uniswap",
      "description": "Swap tokens via Uniswap",
      "category": "dex",
      "path": "protocols/uniswap",
      "dependencies": {}
    }
  },
  "contractFrameworks": {
    "foundry": {
      "name": "Foundry",
      "description": "Foundry development environment",
      "path": "contract-frameworks/foundry"
    }
  },
  "indexers": {
    "goldsky": {
      "name": "Goldsky",
      "description": "High-performance subgraph indexing",
      "path": "indexers/goldsky"
    }
  },
  "database": {
    "supabase": {
      "name": "Supabase",
      "description": "PostgreSQL database with RLS",
      "path": "database/supabase"
    }
  }
}
```

## meta.json Schema

```json
{
  "name": "component-id",
  "displayName": "Human Readable Name",
  "version": "1.0.0",
  "description": "One-line description",
  "category": "dex|bridge|aggregator|lending|nft",
  "dependencies": {
    "@package/name": "^1.0.0"
  },
  "devDependencies": {
    "@types/package": "^1.0.0"
  },
  "envVars": [
    {
      "name": "NEXT_PUBLIC_API_KEY",
      "description": "API key for service",
      "required": true
    }
  ],
  "files": [
    {
      "source": "frontend/path/to/file.ts",
      "target": "path/to/file.ts"
    }
  ],
  "supportedChains": [1, 10, 137, 42161, 8453],
  "features": ["Feature 1", "Feature 2"]
}
```

## Auth Provider Required Files

All auth providers in `frontend/lib/web3/`:

| File | Exports | Description |
|------|---------|-------------|
| `index.ts` | Re-exports all | Stable API surface |
| `types.ts` | Interfaces | Shared TypeScript types |
| `account.ts` | `useAccount()` | Current account info |
| `clients.ts` | `usePublicClient()`, `useWalletClient()` | Viem clients |
| `chain.ts` | `useChainId()`, `useSwitchChain()`, `useChains()` | Chain management |
| `balance.ts` | `useBalance()` | Native token balance |
| `transaction.ts` | `useSendTransaction()`, `useWaitForTransaction()` | Transaction hooks |
| `contract.ts` | `useReadContract()`, `useWriteContract()` | Contract interactions |
| `connection.ts` | `useConnect()`, `useDisconnect()` | Connection management |
| `ens.ts` | `useEnsName()`, `useEnsAvatar()` | ENS resolution |
| `signature.ts` | `useSignMessage()`, `useSignTypedData()` | Message signing |
| `config.ts` | Provider config | Provider-specific setup |

Plus:
- `frontend/providers/web3-provider.tsx`
- `frontend/components/web3/connect-button.tsx`

## Protocol Required Files

```
protocols/{name}/frontend/
├── app/swap/{name}/page.tsx         # Page component
├── lib/services/{name}-service.ts   # Service class
├── hooks/protocols/{name}/          # Custom hooks
│   └── use-{name}-quote.ts
└── constants/protocols/{name}/      # Constants
    └── index.ts
```

## Type Interfaces

### Web3Account

```typescript
interface Web3Account {
  address: Address | undefined
  isConnected: boolean
  isConnecting: boolean
  isDisconnected: boolean
  chainId: number | undefined
  connector: Connector | undefined
}
```

### UseBalanceResult

```typescript
interface UseBalanceResult {
  data: {
    value: bigint
    decimals: number
    formatted: string
    symbol: string
  } | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}
```

### UseContractReadResult

```typescript
interface UseContractReadResult<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}
```

### UseContractWriteResult

```typescript
interface UseContractWriteResult {
  write: (args: WriteContractParameters) => Promise<Hash>
  isLoading: boolean
  isError: boolean
  error: Error | null
  data: Hash | undefined
}
```

## CLI Commands

```bash
# List all registry components
evm-kit list

# Initialize new project
evm-kit init my-app \
  --auth reown \
  --contracts foundry \
  --indexer goldsky \
  --protocols uniswap,lifi

# Add protocol to existing project
evm-kit add uniswap

# Switch auth provider
evm-kit switch-auth dynamic

# Switch contract framework
evm-kit switch-contracts hardhat3
```

## Local Testing

```bash
# Set local registry URL
export EVM_KIT_REGISTRY_URL=/path/to/evm-starter-kit/registry

# Test CLI commands
cd packages/evm-kit
npm run build
node dist/index.js list
node dist/index.js init test-app
```

## Versioning

- **Registry version**: `registry.json` → `version` field
- **Component version**: `meta.json` → `version` field
- **CLI version**: `packages/evm-kit/package.json` → `version`

Follow semver:
- MAJOR: Breaking changes to file structure or API
- MINOR: New features, new components
- PATCH: Bug fixes, documentation

## Publishing Workflow

```bash
# 1. Update component files
# 2. Update meta.json version
# 3. Update registry.json if new component
# 4. Commit changes
git add registry/
git commit -m "feat(registry): add new-component"

# 5. Push to main (registry auto-updates)
git push origin main

# 6. If CLI changes needed:
cd packages/evm-kit
npm version patch
npm run build
npm publish --access public
```
