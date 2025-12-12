---
name: registry-dev
description: Registry development for CLI package distribution - adding auth providers, protocols, indexers to the registry. Use when publishing components to the CLI registry. (project)
---

# Registry Development Skill

## CRITICAL: File Size Limits

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

Every protocol in the registry MUST follow this structure:

```
registry/protocols/{protocol}/frontend/
├── app/crosschain/{protocol}/
│   ├── page.tsx              # Orchestration only (< 150 lines)
│   ├── components/
│   │   ├── bridge-tab.tsx    # Tab components (< 250 lines each)
│   │   ├── message-tab.tsx
│   │   └── shared/
│   │       ├── chain-select.tsx
│   │       └── token-select.tsx
│   ├── hooks/
│   │   ├── use-{protocol}-bridge.ts   # Business logic (< 200 lines)
│   │   └── use-{protocol}-quote.ts
│   ├── types.ts              # Type definitions (< 100 lines)
│   └── constants.ts          # ABIs, addresses (< 150 lines)
├── lib/services/{protocol}-service.ts  # API service (< 300 lines)
└── constants/protocols/{protocol}/index.ts
```

**Files that exceed 300 lines will NOT be readable by Claude and MUST be refactored before publishing.**

See **code-structure** skill for detailed decomposition patterns.

## BEFORE WRITING ANY CODE

**MANDATORY: Use Context7 MCP for documentation lookups when needed.**

```
1. For SDK/library questions, resolve library ID:
   mcp__context7__resolve-library-id({ libraryName: "viem" })

2. Fetch docs for specific SDK usage:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/wevm/viem",
     topic: "sendTransaction",
     mode: "code"
   })

3. Registry patterns are project-specific - refer to existing components
4. For protocol SDKs, always verify API with Context7 first
```

---

## When to Use This Skill

Load this skill when:
- Publishing a working component to the registry
- Adding a new auth provider
- Adding a new protocol integration
- Adding a new indexer
- Updating registry.json
- Debugging generated project issues
- Working on CLI (packages/evm-kit)

---

## Registry Architecture

```
registry/
├── registry.json              # Master manifest
├── foundation/
│   ├── web3-interface/        # ALWAYS installed - core UI, types, chains
│   └── claude-config/         # Claude commands and skills
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
│   └── goldsky/
├── database/                  # Optional
│   └── supabase/
└── protocols/                 # Add MANY anytime
    ├── 1inch/
    ├── lifi/
    ├── x402/
    └── ...
```

---

## CLI Architecture (Critical Knowledge)

### How Dependencies Are Collected

The CLI (`packages/evm-kit/src/commands/init.ts`) collects dependencies from multiple sources:

```typescript
// In createPackageJson():
const dependencies = {
  // Base deps (hardcoded in CLI)
  next: '^15.1.0',
  react: '^19.0.0',
  // ...

  // Foundation dependencies (from meta.json)
  ...foundationMeta.dependencies,

  // Auth provider dependencies (from meta.json)
  ...authMeta.dependencies,

  // Indexer dependencies (from meta.json) - MUST be included!
  ...(indexerMeta?.dependencies || {}),
}
```

**CRITICAL**: If you add a new component category that has dependencies, ensure the CLI includes them in `createPackageJson()`.

### How Features Config Works

The CLI generates `lib/config/features.ts` dynamically based on user selections.

**Protocol Categories and Feature Cards**:

```typescript
// Protocol-to-category mapping in generateFeaturesConfig():
const swapProtocols = ['1inch', 'uniswap', 'cowswap', 'kyberswap']
const bridgeProtocols = ['lifi', 'across']
const messagingProtocols = ['hyperlane', 'layerzero']
const ipProtocols = ['story']
const perpsProtocols = ['gmx']
const paymentsProtocols = ['x402']

// Feature cards enabled based on protocol categories:
// - basic-web3: Always enabled
// - contracts: When contractFramework !== 'none'
// - swap: When user selects a dex protocol (1inch, uniswap, etc.)
// - bridge: When user selects a bridge protocol (lifi, across)
// - messaging: When user selects messaging protocol (hyperlane, layerzero)
// - ip: When user selects IP protocol (story)
// - perps: When user selects perps protocol (gmx)
// - indexer: When indexer !== 'none'
// - supabase: When includeSupabase is true
// - x402: When user selects x402 protocol
```

**Feature Card Icons** (from lucide-react):
- Wallet → Basic Web3
- FileCode → Contracts
- Repeat → Swap
- ArrowRightLeft → Bridge
- Send → Messaging
- ScrollText → IP Protocol
- TrendingUp → Perps
- Database → Indexer
- Server → Database
- Zap → x402

The home page (`app/page.tsx`) reads this config and only shows enabled feature cards.

### Env File Handling

The CLI creates `.env.local` with app configuration:

```typescript
// In createEnvFile():
// 1. If ~/.claude/.env.frontend exists, copy it and update NEXT_PUBLIC_APP_NAME
// 2. Otherwise, create template with:
envContent += `NEXT_PUBLIC_APP_NAME=${answers.projectName}\n`
envContent += 'NEXT_PUBLIC_APP_URL=http://localhost:3000\n'
envContent += 'NEXT_PUBLIC_APP_MODE=testnet\n'
envContent += 'NEXT_PUBLIC_SUPPORTED_CHAINS=sepolia\n\n'
```

**CRITICAL**: The app name MUST be set from `answers.projectName`, not a default value.

### File Copy Order

1. Foundation (web3-interface) → `frontend/`
2. Claude config → project root
3. Auth provider → `frontend/` (overwrites foundation's lib/web3/index.ts)
4. Contract framework → project root
5. Indexer → project root + `frontend/`
6. Protocols → `frontend/`
7. **Generate features.ts** (overwrites foundation's template)
8. Create package.json (merges all dependencies)

---

## Foundation Structure (web3-interface)

The foundation provides the base UI and must include:

### Required Files
```
foundation/web3-interface/frontend/
├── app/
│   ├── layout.tsx          # Root layout with ThemeProvider, Web3Provider
│   ├── globals.css         # Theme variables (dark/light)
│   ├── page.tsx            # Dynamic home page (reads features.ts)
│   └── basic-web3/page.tsx # Always-enabled basic wallet page
├── lib/
│   ├── config/features.ts  # Template (CLI overwrites with actual config)
│   ├── web3/
│   │   ├── index.ts        # Re-exports (foundation version)
│   │   ├── types.ts        # Shared types
│   │   ├── chains.ts       # Chain utilities
│   │   └── constants.ts    # Common addresses
│   └── utils.ts            # cn() utility
├── components/
│   ├── layout/navbar.tsx   # Simplified navbar
│   └── ui/                 # shadcn/ui components
└── eslint.config.mjs
```

### Required Dependencies (in meta.json)
```json
{
  "dependencies": {
    "viem": "^2.21.58",
    "next-themes": "^0.4.4",
    "sonner": "^1.7.1",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    // ... other radix components
    "framer-motion": "^11.15.0"
  }
}
```

---

## Auth Provider Structure

Each auth provider in `registry/auth-providers/{name}/` must include:

### Required Files
```
auth-providers/{name}/frontend/
├── lib/
│   ├── config/chains.ts    # Chain config with RPC URLs
│   └── web3/
│       ├── index.ts        # Re-exports all hooks + provider-specific exports
│       ├── types.ts        # Can extend base types
│       ├── account.ts      # useAccount()
│       ├── clients.ts      # usePublicClient(), useWalletClient()
│       ├── chain.ts        # useChainId(), useSwitchChain(), useChains()
│       ├── balance.ts      # useBalance()
│       ├── transaction.ts  # useSendTransaction(), useWaitForTransaction()
│       ├── contract.ts     # useReadContract(), useWriteContract()
│       ├── connection.ts   # useConnect(), useDisconnect()
│       ├── ens.ts          # useEnsName(), useEnsAvatar()
│       ├── signature.ts    # useSignMessage(), useSignTypedData()
│       └── config.ts       # Provider-specific config
├── providers/
│   └── web3-provider.tsx   # Provider wrapper component
└── components/
    └── web3/
        └── connect-button.tsx  # Connect wallet button
```

### chains.ts Must Export These Functions

```typescript
// Required exports for auth providers
export function getSupportedChainList(): ChainConfig[]
export function getChainConfig(chainId: number): ChainConfig | undefined
export function getChainById(chainId: number): ChainConfig | undefined  // Alias
export function getRpcUrl(chainId: number): string | undefined
export function getSupportedChainIds(): number[]
export function isChainSupported(chainId: number): boolean
export function getSupportedViemChains(): readonly Chain[]
```

---

## Indexer Structure

Indexers in `registry/indexers/{name}/` include frontend AND subgraph files:

### Required Dependencies (CRITICAL)
```json
{
  "dependencies": {
    "@apollo/client": "^3.11.0",
    "graphql": "^16.9.0",
    "graphql-ws": "^5.16.0"  // Don't forget this!
  }
}
```

### File Structure
```
indexers/{name}/
├── meta.json
├── frontend/
│   └── lib/indexer/
│       ├── client.ts       # Apollo client setup
│       ├── queries.ts      # GraphQL queries
│       └── hooks.ts        # React hooks
├── subgraph/
│   ├── schema.graphql
│   ├── subgraph.template.yaml
│   ├── package.json
│   └── src/mappings/
└── .claude/skills/         # Indexer-specific skills
```

---

## Common Pitfalls & Fixes

### 1. Missing Module Errors

**Symptom**: `Module not found: Can't resolve './format'`

**Cause**: index.ts exports modules that don't exist in the registry

**Fix**: Check every `export * from './module'` in index.ts has a corresponding file:
```typescript
// WRONG - file doesn't exist
export * from './format'

// CORRECT - only export existing modules
export * from './chains'
```

### 2. Missing Dependencies

**Symptom**: `Cannot find module '@apollo/client'`

**Cause**: Dependency not in meta.json or CLI not including it

**Fix**:
1. Add to component's meta.json dependencies
2. Ensure CLI's `createPackageJson()` includes that category's dependencies

### 3. BigInt Literal Errors

**Symptom**: `BigInt literals are not available when targeting lower than ES2020`

**Cause**: Next.js sets target to ES2017

**Fix**: Use BigInt() constructor instead of literal:
```typescript
// WRONG
export const GAS_LIMIT = 21000n

// CORRECT
export const GAS_LIMIT = BigInt(21000)
```

### 4. HoverEffect Type Mismatch

**Symptom**: Type error with HoverEffect items

**Cause**: HoverEffect expects `{ title, icon, link }` not `{ title, description, link }`

**Fix**: Use icons, not descriptions:
```typescript
// CORRECT
const items = [
  { title: 'Feature', icon: Wallet, link: '/feature' }
]
```

### 5. Unescaped Entities in JSX

**Symptom**: `'` can be escaped with `&apos;`

**Fix**: Escape apostrophes in JSX text:
```tsx
// WRONG
<p>It's working</p>

// CORRECT
<p>It&apos;s working</p>
```

### 6. Missing Chain Functions

**Symptom**: `getChainById is not exported from '@/lib/config/chains'`

**Fix**: Auth provider's chains.ts must export ALL required functions (see list above)

---

## Testing Checklist

Before publishing any component:

### 1. Verify meta.json
```bash
# Check all source files exist
cat registry/<category>/<name>/meta.json | jq -r '.files[].source' | while read f; do
  [ -f "registry/<category>/<name>/$f" ] || echo "MISSING: $f"
done
```

### 2. Check Dependencies
```bash
# Grep for imports and verify they're in dependencies
grep -r "from '" registry/<category>/<name>/frontend/ | \
  grep -o "'[^']*'" | sort -u
```

### 3. Test Local Generation
```bash
# Build CLI
cd packages/evm-kit && npm run build

# Generate with local registry
cd /tmp
EVM_KIT_REGISTRY_URL="file:///path/to/registry" \
  evm-kit init test-app --auth <provider> --protocols <proto> --yes

# Build generated project
cd test-app/frontend && npm run build
```

### 4. Check for Common Errors
```bash
# Run build and check for:
# - Module not found errors
# - Type errors
# - Missing dependencies
npm run build 2>&1 | grep -E "(Module not found|Cannot find|Type error)"
```

---

## meta.json Schema Reference

```json
{
  "name": "component-id",
  "displayName": "Human Readable Name",
  "version": "1.0.0",
  "description": "One-line description",

  "dependencies": {
    "package-name": "^version"
  },

  "envVars": [
    {
      "name": "NEXT_PUBLIC_API_KEY",
      "description": "Description of the env var",
      "required": true
    }
  ],

  "files": [
    {
      "source": "frontend/lib/web3/account.ts",
      "target": "lib/web3/account.ts"
    }
  ],

  "supportedChains": [1, 10, 137, 42161],
  "category": "dex|bridge|aggregator|payment",
  "features": ["Feature 1", "Feature 2"],

  // Auth provider specific
  "providerSpecificFiles": ["lib/web3/thirdweb-client.ts"],

  // Protocol specific
  "authLayerRequired": "thirdweb",
  "incompatibleAuthProviders": ["privy"],
  "enablesPages": ["app/x402"]
}
```

---

## Quick Reference

| Task | Command/Location |
|------|------------------|
| Master manifest | `registry/registry.json` |
| CLI source | `packages/evm-kit/src/commands/init.ts` |
| Build CLI | `cd packages/evm-kit && npm run build` |
| Link CLI locally | `cd packages/evm-kit && npm link` |
| Test with local registry | `EVM_KIT_REGISTRY_URL="file:///path/to/registry" evm-kit init test` |
| Check generated features | `cat frontend/lib/config/features.ts` |

---

## Adding New Feature Categories

If adding a completely new category (not auth/protocol/indexer):

1. Create directory structure: `registry/<category>/<name>/`
2. Create meta.json with dependencies
3. **Update CLI** to:
   - Add prompts in `src/utils/prompts.ts`
   - Add copy logic in `src/commands/init.ts`
   - Include dependencies in `createPackageJson()`
   - Update `generateFeaturesConfig()` if it's a home page feature
4. Update `registry.json` with new category
5. Test end-to-end

---

## Anti-Patterns (NEVER DO)

```typescript
// NEVER import wagmi directly in protocols
import { useAccount } from 'wagmi'  // WRONG
import { useAccount } from '@/lib/web3'  // CORRECT

// NEVER use BigInt literals
const gas = 21000n  // WRONG - ES2017 incompatible
const gas = BigInt(21000)  // CORRECT

// NEVER export non-existent modules
export * from './format'  // WRONG if format.ts doesn't exist

// NEVER forget dependencies in meta.json
// If code imports it, meta.json must have it

// NEVER hardcode addresses
const ROUTER = '0x123...'  // WRONG
import { ROUTER } from '@/constants/protocols/...'  // CORRECT

// NEVER skip testing generated projects
// Always run: npm run build
```

---

## Debugging Generated Projects

When a generated project has errors:

1. **Module not found**: Check registry's index.ts exports vs actual files
2. **Cannot find module**: Check meta.json dependencies
3. **Type error**: Check interface compatibility between components
4. **Function not exported**: Check auth provider exports all required functions
5. **Build fails silently**: Run `npm run build` not `npm run dev`

Always test with a fresh generation after registry changes:
```bash
rm -rf test-app
EVM_KIT_REGISTRY_URL="file:///path/to/registry" evm-kit init test-app --yes
cd test-app/frontend && npm run build
```

---

## Testing Protocol Combinations

When testing the CLI, verify with multiple protocol combinations:

### Verification Checklist

1. **App Name**:
   - Check `.env.local` has `NEXT_PUBLIC_APP_NAME=<project-name>`
   - NOT a default like "testing" or "my-evm-app"

2. **Feature Cards**:
   ```bash
   # Check generated features config
   cat frontend/lib/config/features.ts | grep "enabled: true"
   ```
   - Each selected protocol category should have enabled: true
   - Verify links point to correct protocol pages

3. **Protocol Pages Exist**:
   ```bash
   # Check protocol pages exist
   ls frontend/app/swap/*/page.tsx
   ```

4. **Dependencies**:
   ```bash
   # Check all protocol deps in package.json
   cat frontend/package.json | jq '.dependencies'
   ```

### Test Command Matrix

```bash
# Test different auth providers
evm-kit init test-reown --auth reown --protocols x402 --yes
evm-kit init test-thirdweb --auth thirdweb --protocols x402 --yes

# Test protocol combinations
evm-kit init test-dex --auth reown --protocols 1inch,uniswap --yes
evm-kit init test-bridge --auth reown --protocols lifi,across --yes
evm-kit init test-messaging --auth reown --protocols hyperlane --yes
evm-kit init test-mixed --auth thirdweb --protocols hyperlane,story,x402 --yes

# Full test with all options
evm-kit init test-full --auth thirdweb --contracts foundry --indexer goldsky --protocols 1inch,hyperlane,x402 --yes
```

### Expected Feature Cards by Protocol Selection

| Protocols Selected | Expected Cards |
|-------------------|----------------|
| `1inch` | Basic Web3, Swap |
| `lifi` | Basic Web3, Bridge |
| `hyperlane` | Basic Web3, Messaging |
| `story` | Basic Web3, IP Protocol |
| `gmx` | Basic Web3, Perps |
| `x402` | Basic Web3, x402 |
| `hyperlane,story,x402` | Basic Web3, Messaging, IP Protocol, x402 |

---

## Foundation Pages Quality

The foundation basic-web3 page should include:

- Account avatar with gradient background
- Truncated address with copy button
- Network info with chain icon
- Native balance display
- Multichain toggle to view balances across all supported chains
- Network switcher
- Quick actions (view on explorer, copy address)
- Supported networks badges

**DO NOT**: Ship minimal stub pages in foundation. The basic-web3 page is the first thing users see after Basic Web3 and must be polished.

---

## File Size Verification

**Before publishing ANY component to the registry:**

### 1. Check File Sizes

```bash
# Find files over 300 lines in protocol
find registry/protocols/{protocol} -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20

# Any file > 300 lines MUST be refactored
```

### 2. Verify Structure

```bash
# Check protocol has proper structure
ls -la registry/protocols/{protocol}/frontend/app/crosschain/{protocol}/
# Should see: page.tsx, components/, hooks/, types.ts, constants.ts

# Page should be < 150 lines
wc -l registry/protocols/{protocol}/frontend/app/crosschain/{protocol}/page.tsx
```

### 3. Verify Decomposition

| File Type | Max Lines | Check Command |
|-----------|-----------|---------------|
| page.tsx | 150 | `wc -l .../page.tsx` |
| *-tab.tsx | 250 | `wc -l .../components/*-tab.tsx` |
| use-*.ts | 200 | `wc -l .../hooks/use-*.ts` |
| types.ts | 100 | `wc -l .../types.ts` |
| constants.ts | 150 | `wc -l .../constants.ts` |
| *-service.ts | 300 | `wc -l .../lib/services/*-service.ts` |

### 4. Common Refactoring Fixes

| Problem | Solution |
|---------|----------|
| Page > 150 lines | Extract tabs to components/ |
| ABIs in page | Move to constants.ts |
| Types inline | Move to types.ts |
| 3+ useState | Extract to hook |
| Reusable UI | Move to components/shared/ |

---

## Related Skills

- **code-structure** - For file size limits and decomposition patterns
- **web3-integration** - For protocol page patterns
- **ui-dev** - For component styling
