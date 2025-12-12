# Code Structure Reference

## File Size Guidelines by Type

### Page Files (`app/**/page.tsx`)

**Max: 150 lines**

Purpose: Orchestration and layout only

Should contain:
- Imports
- Route-level state (tabs, modals)
- Layout structure
- Child component composition

Should NOT contain:
- Business logic
- API calls
- Complex state management
- Inline components

### Tab/Feature Components (`components/{feature}-tab.tsx`)

**Max: 250 lines**

Purpose: Feature-specific UI and interaction

Should contain:
- Feature-specific state
- UI layout for that feature
- Event handlers (delegating to hooks)
- Loading/error states

Should NOT contain:
- Shared components (extract to `shared/`)
- Complex business logic (extract to hooks)
- ABIs or type definitions

### Shared Components (`components/shared/*.tsx`)

**Max: 150 lines**

Purpose: Reusable UI primitives

Should contain:
- Self-contained UI logic
- Props interface
- Internal state for UI only

Should NOT contain:
- Domain-specific logic
- External API calls
- Complex state management

### Hooks (`hooks/use-*.ts`)

**Max: 200 lines**

Purpose: Encapsulated business logic

Should contain:
- State management
- Side effects (useEffect)
- API calls
- Computed values

Should NOT contain:
- JSX
- UI-specific logic
- Multiple unrelated concerns

### Types (`types.ts`)

**Max: 100 lines**

Purpose: Type definitions for the feature

Should contain:
- Exported type/interface definitions
- Type utilities specific to feature

Should NOT contain:
- Runtime code
- Default values
- Functions

### Constants (`constants.ts`)

**Max: 150 lines**

Purpose: Static values and ABIs

Should contain:
- Contract ABIs
- Address mappings
- Configuration objects
- Magic numbers with names

Should NOT contain:
- Dynamic values
- Functions
- Type definitions

### Services (`lib/services/{name}-service.ts`)

**Max: 300 lines**

Purpose: API and SDK integration

Should contain:
- API calls
- SDK initialization
- Data transformation
- Error handling

Should NOT contain:
- React hooks
- UI logic
- Component code

## Component Extraction Decision Tree

```
Is the component > 300 lines?
├─ YES → Must decompose
│   ├─ Has ABIs? → Extract to constants.ts
│   ├─ Has types? → Extract to types.ts
│   ├─ Has 3+ useState? → Extract to hook
│   ├─ Has tabs/sections? → Split into separate components
│   └─ Has reusable UI? → Extract to shared/
└─ NO → Check other criteria
    ├─ Has 3+ useState? → Consider extracting hook
    ├─ Has inline components? → Extract to separate files
    └─ Has complex logic in render? → Extract to hook
```

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page | `page.tsx` | `app/crosschain/hyperlane/page.tsx` |
| Tab component | `{name}-tab.tsx` | `bridge-tab.tsx` |
| Hook | `use-{name}.ts` | `use-bridge.ts` |
| Service | `{name}-service.ts` | `hyperlane-service.ts` |
| Types | `types.ts` | `types.ts` |
| Constants | `constants.ts` | `constants.ts` |
| Shared component | `{name}.tsx` | `chain-select.tsx` |

## Import Organization

Files should organize imports in this order:

```tsx
// 1. React
import { useState, useEffect, useCallback } from 'react'

// 2. Web3 abstraction (ALWAYS from @/lib/web3)
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'

// 3. UI components
import { Card, Button, Input } from '@/components/ui'

// 4. Local components
import { BridgeTab } from './components/bridge-tab'

// 5. Hooks
import { useBridge } from './hooks/use-bridge'

// 6. Services
import { protocolService } from '@/lib/services/protocol-service'

// 7. Types
import type { Chain, Token, Quote } from './types'

// 8. Constants
import { TOKEN_ABI, ADDRESSES } from './constants'

// 9. Utils
import { cn, formatAmount } from '@/lib/utils'
```

## State Management Patterns

### Local State (Component)

Use for UI-only state:

```tsx
const [open, setOpen] = useState(false)
const [search, setSearch] = useState('')
```

### Feature State (Hook)

Use for feature logic:

```tsx
// In hooks/use-bridge.ts
export function useBridge() {
  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destChain, setDestChain] = useState<Chain | null>(null)
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Logic here...

  return {
    sourceChain,
    destChain,
    amount,
    quote,
    loading,
    error,
    setSourceChain,
    setDestChain,
    setAmount,
  }
}
```

### Shared State (Context)

Use only when state is needed across distant components:

```tsx
// In contexts/bridge-context.tsx (rare, only if needed)
const BridgeContext = createContext<BridgeContextType | null>(null)
```

## Error Handling Pattern

```tsx
// In hook
const [error, setError] = useState<string | null>(null)

const execute = useCallback(async () => {
  setError(null)
  try {
    await operation()
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Unknown error')
  }
}, [])

return { error, execute }

// In component
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

## Loading State Pattern

```tsx
// In hook
const [loading, setLoading] = useState(false)

const execute = useCallback(async () => {
  setLoading(true)
  try {
    await operation()
  } finally {
    setLoading(false)
  }
}, [])

return { loading, execute }

// In component
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```
