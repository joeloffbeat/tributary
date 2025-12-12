# EVM Starter Kit - Development Guide

This is the development repo for `@cipherkuma/evm-kit` - a CLI tool for creating EVM dApps with swappable auth, protocols, and tooling.

---

## Git Configuration (MANDATORY)

**ALWAYS use these credentials for ALL commits and pushes:**

| Setting | Value |
|---------|-------|
| **User Name** | `gabrielantonyxaviour` |
| **User Email** | `gabrielantony56@gmail.com` |
| **Remote** | `https://github.com/gabrielantonyxaviour/ipay.git` |

Before making any commits, ALWAYS run:
```bash
git config user.name "gabrielantonyxaviour"
git config user.email "gabrielantony56@gmail.com"
```

**DO NOT use any other git identity for this project.**

---

## Critical Rules

**NEVER mock or create placeholder code.** If blocked, STOP and explain why.

- No scope creep - only implement what's requested
- No assumptions - ask for clarification
- Follow existing patterns in codebase
- Verify work before completing
- Use conventional commits (`feat:`, `fix:`, `refactor:`)

---

## File Size Limits (CRITICAL)

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

Files over 300 lines (~25000 tokens) CANNOT be read by AI tools and block development.

### Limits by File Type

| File Type | Max Lines | Purpose |
|-----------|-----------|---------|
| `page.tsx` | 150 | Orchestration only |
| `*-tab.tsx` | 250 | Tab components |
| `use-*.ts` | 200 | Hooks with business logic |
| `types.ts` | 100 | Type definitions |
| `constants.ts` | 150 | ABIs, addresses |
| `*-service.ts` | 300 | API services |
| `components/shared/*.tsx` | 150 | Reusable UI |

### Required Protocol Structure

Every protocol page MUST be decomposed:

```
app/crosschain/{protocol}/
├── page.tsx              # Orchestration only (< 150 lines)
├── components/
│   ├── bridge-tab.tsx    # Tab components (< 250 lines each)
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

### When to Decompose

| Trigger | Action |
|---------|--------|
| File > 300 lines | MUST decompose immediately |
| 3+ useState hooks | Extract to custom hook |
| Multiple tabs/sections | Split into separate components |
| ABIs in component | Move to constants.ts |
| Types inline | Move to types.ts |

**See `code-structure` skill for detailed patterns.**

---

## Documentation Lookup (MANDATORY)

**ALWAYS use Context7 MCP for documentation. NEVER use WebFetch for docs.**

Context7 is the ONLY reliable way to get up-to-date SDK/library documentation. WebFetch fails frequently and returns incomplete/unusable results.

### How to Use Context7

```
1. First resolve the library ID:
   mcp__context7__resolve-library-id({ libraryName: "viem" })

2. Then fetch the docs:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/wevm/viem",
     topic: "sendTransaction",
     mode: "code"  // or "info" for conceptual guides
   })
```

### When to Use Context7

| Scenario | Action |
|----------|--------|
| Need SDK/library docs | **USE CONTEXT7** |
| Checking API usage | **USE CONTEXT7** |
| Finding code examples | **USE CONTEXT7** |
| Learning library patterns | **USE CONTEXT7** |
| Any documentation need | **USE CONTEXT7** |

### Common Libraries in This Project

| Library | Context7 ID |
|---------|-------------|
| viem | `/wevm/viem` |
| wagmi | `/wevm/wagmi` |
| Next.js | `/vercel/next.js` |
| React | `/facebook/react` |
| shadcn/ui | `/shadcn-ui/ui` |
| Foundry | `/foundry-rs/foundry` |

### DO NOT

- **NEVER use WebFetch for documentation** - It's unreliable and often fails
- **NEVER guess SDK usage** - Always verify with Context7 first
- **NEVER assume API signatures** - Look them up via Context7

### Example Workflow

```
User: "Integrate Protocol X SDK"

Step 1: Look up Protocol X docs via Context7
   → mcp__context7__resolve-library-id({ libraryName: "protocol-x-sdk" })
   → mcp__context7__get-library-docs({ context7CompatibleLibraryID: "...", topic: "getting started" })

Step 2: Implement using verified patterns from docs

Step 3: If unsure about specific method, query Context7 again with specific topic
```

---

## Skills (LOAD BEFORE STARTING TASKS)

**IMPORTANT: Always load the appropriate skill BEFORE starting any task.** Skills provide essential context, patterns, and instructions for each domain.

### How to Use Skills

Load a skill by invoking it at the start of your task:
```
skill: "ui-dev"
skill: "web3-integration"
skill: "contracts-dev"
```

### Required Skills by Task Type

| Task Type | Required Skill | Examples |
|-----------|----------------|----------|
| **Any New Code** | `code-structure` | File size limits, decomposition patterns, component architecture |
| **UI/Frontend** | `ui-dev` | Building components, styling, layouts, animations, responsive design, shadcn/ui |
| **Smart Contract Interactions** | `web3-integration` | Contract reads/writes, TransactionDialog, signatures, wallet interactions |
| **Smart Contract Development** | `contracts-dev` | Writing Solidity, Foundry tests, deployments, verification |
| **Subgraph Queries** | `subgraph-frontend` | Apollo Client, GraphQL queries, subscriptions, blockchain data |
| **Database Operations** | `supabase-operations` | Supabase tables, migrations, RLS policies, data operations |
| **E2E Testing** | `playwright-testing` | Browser automation, test writing, parallel testing |
| **Registry Publishing** | `registry-dev` | Adding protocols, auth providers, CLI components |

### Skill Loading Rules

1. **ALWAYS load a skill** when the task matches any skill description above
2. **Load BEFORE writing any code** - skills contain critical patterns and conventions
3. **Multiple skills** - If a task spans multiple domains, load the primary skill first
4. **Don't skip skills** - Even for "simple" tasks, skills ensure consistency

### Examples

```
User: "Add a button to connect wallet"
→ Load skill: "ui-dev" (for component) AND "web3-integration" (for wallet logic)

User: "Write a test for the NFT contract"
→ Load skill: "contracts-dev"

User: "Query the subgraph for user positions"
→ Load skill: "subgraph-frontend"

User: "Add a new column to the users table"
→ Load skill: "supabase-operations"
```

## Repository Structure

```
evm-starter-kit/
├── registry/                    # SOURCE OF TRUTH for all components
│   ├── registry.json            # Master manifest
│   ├── foundation/              # Core (always included)
│   │   └── web3-interface/      # THE ABSTRACTION LAYER
│   ├── auth-providers/          # Swappable auth
│   │   ├── reown/
│   │   ├── dynamic/
│   │   ├── privy/
│   │   └── rainbowkit/
│   ├── protocols/               # Protocol integrations
│   │   ├── 1inch/
│   │   ├── lifi/
│   │   └── .../
│   ├── contract-frameworks/     # Foundry or Hardhat 3
│   ├── indexers/                # Goldsky or The Graph
│   └── database/                # Supabase
│
├── packages/evm-kit/            # CLI tool (@cipherkuma/evm-kit)
├── templates/base/              # Minimal project template
├── playground/                  # Dev testing area (gitignored)
└── .claude/commands/            # Claude slash commands
```

## The Web3 Abstraction Layer (CRITICAL)

**THIS IS THE KEY ARCHITECTURAL PATTERN.**

All protocols MUST use the abstraction layer so auth providers can be swapped:

```typescript
// CORRECT - Use abstraction
import { useAccount, useWalletClient, usePublicClient, ConnectButton } from '@/lib/web3'

// WRONG - Direct wagmi imports
import { useAccount } from 'wagmi'  // NEVER DO THIS IN PROTOCOLS
```

### Interface Location

`registry/foundation/web3-interface/frontend/lib/web3/`:

| File | Purpose |
|------|---------|
| `index.ts` | Stable exports (NEVER changes) |
| `types.ts` | Shared TypeScript types |
| `chains.ts` | Chain definitions |
| `constants.ts` | Common addresses |

### Auth Provider Implementations

Each provider in `registry/auth-providers/` implements:

| File | Implements |
|------|------------|
| `account.ts` | `useAccount()` |
| `clients.ts` | `usePublicClient()`, `useWalletClient()` |
| `chain.ts` | `useChainId()`, `useSwitchChain()` |
| `balance.ts` | `useBalance()` |
| `transaction.ts` | `useSendTransaction()` |
| `contract.ts` | `useReadContract()`, `useWriteContract()` |
| `connection.ts` | `useConnect()`, `useDisconnect()` |

---

## Adding a New Protocol

### Step 1: Create Decomposed Structure

**IMPORTANT: Follow file size limits. No file > 300 lines.**

```
registry/protocols/{protocol-name}/
├── meta.json
└── frontend/
    ├── app/crosschain/{protocol-name}/
    │   ├── page.tsx              # < 150 lines - orchestration only
    │   ├── components/
    │   │   ├── bridge-tab.tsx    # < 250 lines - main tab
    │   │   ├── history-tab.tsx   # < 250 lines - history tab
    │   │   └── shared/
    │   │       ├── chain-select.tsx  # < 150 lines
    │   │       └── token-select.tsx  # < 150 lines
    │   ├── hooks/
    │   │   ├── use-{protocol}-bridge.ts  # < 200 lines
    │   │   └── use-{protocol}-quote.ts   # < 200 lines
    │   ├── types.ts              # < 100 lines
    │   └── constants.ts          # < 150 lines
    ├── lib/services/{protocol-name}-service.ts  # < 300 lines
    └── constants/protocols/{protocol-name}/index.ts
```

### Step 2: Create meta.json

```json
{
  "name": "{protocol-name}",
  "displayName": "Protocol Display Name",
  "version": "1.0.0",
  "description": "Brief description",
  "category": "crosschain-swaps|crosschain-messaging|perps|payments|ip",
  "dependencies": {
    "@protocol/sdk": "^1.0.0"
  },
  "files": [
    {
      "source": "frontend/app/crosschain/{protocol-name}/page.tsx",
      "target": "app/crosschain/{protocol-name}/page.tsx"
    },
    {
      "source": "frontend/lib/services/{protocol-name}-service.ts",
      "target": "lib/services/{protocol-name}-service.ts"
    }
  ],
  "supportedChains": [1, 10, 137, 42161, 8453]
}
```

### Step 3: Create Service

```typescript
// registry/protocols/{protocol}/frontend/lib/services/{protocol}-service.ts

class ProtocolService {
  async getQuote(params) { /* ... */ }
  async getSwap(params) { /* ... */ }
}

export const protocolService = new ProtocolService()
```

### Step 4: Create Page (USE ABSTRACTION)

```typescript
// registry/protocols/{protocol}/frontend/app/crosschain/{protocol}/page.tsx

'use client'

// ALWAYS import from @/lib/web3
import { useAccount, useWalletClient, usePublicClient, ConnectButton } from '@/lib/web3'
import { protocolService } from '@/lib/services/{protocol}-service'

export default function ProtocolPage() {
  const { address, isConnected, chainId } = useAccount()
  const walletClient = useWalletClient()
  const publicClient = usePublicClient()

  const handleSwap = async () => {
    if (!walletClient || !publicClient) return
    const tx = await protocolService.getSwap(...)
    const hash = await walletClient.sendTransaction(tx)
    await publicClient.waitForTransactionReceipt({ hash })
  }

  if (!isConnected) return <ConnectButton />
  // ... rest of UI
}
```

### Step 5: Update Registry

Add to `registry/registry.json` under `protocols`:

```json
"{protocol-name}": {
  "name": "Protocol Name",
  "description": "Description",
  "category": "dex",
  "path": "protocols/{protocol-name}",
  "dependencies": {}
}
```

---

## Adding a New Auth Provider

### Step 1: Create Structure

```
registry/auth-providers/{provider}/
├── meta.json
└── frontend/
    ├── lib/web3/
    │   ├── account.ts      # Implements useAccount()
    │   ├── clients.ts      # Implements usePublicClient(), useWalletClient()
    │   ├── chain.ts        # Implements useChainId(), useSwitchChain()
    │   └── ...             # All other hooks
    ├── providers/web3-provider.tsx
    └── components/web3/connect-button.tsx
```

### Step 2: Implement Interface

Each hook MUST return types matching `foundation/web3-interface/frontend/lib/web3/types.ts`.

### Step 3: Update Registry

Add to `registry/registry.json` under `authProviders`.

---

## CLI Development

### Build & Test

```bash
cd packages/evm-kit
npm install
npm run build
npm link

# Test
evm-kit list
evm-kit init test-app
```

### Publish

```bash
npm publish --access public
```

---

## Protocol Checklist

**File Structure:**
- [ ] page.tsx < 150 lines (orchestration only)
- [ ] Each tab component < 250 lines
- [ ] Each hook < 200 lines
- [ ] types.ts < 100 lines
- [ ] constants.ts < 150 lines (ABIs, addresses)
- [ ] service.ts < 300 lines

**Registry:**
- [ ] `meta.json` with correct file mappings
- [ ] Added to `registry/registry.json`
- [ ] `supportedChains` in meta.json

**Code Quality:**
- [ ] Service uses native `fetch` (not axios)
- [ ] Page imports from `@/lib/web3` (NOT wagmi)
- [ ] No inline ABIs in components
- [ ] No inline types in components
- [ ] Business logic in hooks, not components

---

## Common Patterns

### Debounced Quotes

```typescript
useEffect(() => {
  const timer = setTimeout(() => fetchQuote(), 500)
  return () => clearTimeout(timer)
}, [fetchQuote])
```

### Transaction Flow

```typescript
// 1. Check allowance
const allowance = await publicClient.readContract({...})

// 2. Approve if needed
if (allowance < amount) {
  const hash = await walletClient.sendTransaction(approveTx)
  await publicClient.waitForTransactionReceipt({ hash })
}

// 3. Execute
const hash = await walletClient.sendTransaction(tx)
await publicClient.waitForTransactionReceipt({ hash })
```

---

## File Naming

| Type | Pattern |
|------|---------|
| Service | `{protocol}-service.ts` |
| Hook | `use-{protocol}-{action}.ts` |
| Constants | `constants/protocols/{protocol}/index.ts` |
| Page | `app/crosschain/{protocol}/page.tsx` |

---

## DO NOT

- **Create files over 300 lines** - They cannot be read by AI tools
- **Put everything in page.tsx** - Decompose into components, hooks, types, constants
- **Use WebFetch for documentation** - ALWAYS use Context7 MCP instead
- **Skip loading skills** - Always load appropriate skill before starting work
- **Guess SDK/API usage** - Look it up via Context7 first
- Import from `wagmi` directly in protocols
- Create directories outside established structure
- Forget to update `registry/registry.json`
- Use `axios` (use native `fetch`)
- Skip the abstraction layer
- Start coding without loading the relevant skill first
- Put ABIs or type definitions inline in components

## DO

- **Keep files under 300 lines** - Decompose early and often
- **Load `code-structure` skill** - For any new component or protocol
- **Use Context7 MCP for ALL documentation** - It's the only reliable method
- **Load skills FIRST** - Before any task, load the matching skill(s)
- **Verify SDK patterns via Context7** - Before implementing any library integration
- Extract business logic to hooks
- Keep page.tsx as pure orchestration
- Put ABIs in constants.ts, types in types.ts
- Test with multiple auth providers
- Keep services stateless
- Handle loading/error states
