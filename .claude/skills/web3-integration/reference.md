# Web3 Integration Reference

## When to Use What

| Need | Use This | Not This | Why |
|------|----------|----------|-----|
| Check if wallet connected | `useAccount().isConnected` | `useWalletClient()` | Sync check, no loading state needed |
| Get wallet address | `useAccount().address` | `useWalletClient().account` | Direct access, always available |
| Get current chain | `useAccount().chainId` or `useChainId()` | `publicClient.getChainId()` | Reactive, updates on chain change |
| Get ETH balance | `useBalance({ address })` | `publicClient.getBalance()` | Hook with loading/error states |
| Read contract data | `publicClient.readContract()` | `useContractRead` (wagmi) | Project standard, use abstraction |
| Write to contract | `<TransactionDialog />` | `walletClient.sendTransaction()` | Handles UX, simulation, errors |
| Switch chain | `useSwitchChain().switchChain()` | `walletClient.switchChain()` | Hook with loading/error states |
| Sign message | `useSignMessage()` | `walletClient.signMessage()` | Hook with loading/error states |
| Get gas price | `useGasPrice()` | `publicClient.getGasPrice()` | Reactive, auto-refreshes |

---

## Abstraction Layer Hooks

All hooks are exported from `@/lib/web3`. Never import from wagmi directly.

### useAccount

Returns wallet connection state.

```typescript
const {
  address,        // `0x${string}` | undefined
  isConnected,    // boolean
  isConnecting,   // boolean
  isDisconnected, // boolean
  chain,          // Chain | undefined
  chainId,        // number | undefined
  isSmartAccount, // boolean | undefined (Thirdweb only)
  walletId,       // string | undefined (Thirdweb only)
} = useAccount()
```

### useBalance

Returns native token balance for an address.

```typescript
const {
  balance,      // bigint | undefined
  symbol,       // string | undefined
  decimals,     // number | undefined
  formatted,    // string | undefined
  isLoading,    // boolean
  error,        // Error | null
  refetch,      // () => Promise<void>
} = useBalance({ address })
```

### useChainId

Returns current chain ID.

```typescript
const chainId = useChainId() // number | undefined
```

### useChains

Returns list of supported chains.

```typescript
const chains = useChains() // Chain[]
```

### useSwitchChain

Switch the connected wallet to a different chain.

```typescript
const {
  switchChain,  // (chainId: number) => Promise<void>
  isPending,    // boolean
  error,        // Error | null
} = useSwitchChain()

// Usage
await switchChain(1) // Switch to mainnet
```

### usePublicClient

Returns viem PublicClient for read operations.

```typescript
const { publicClient } = usePublicClient()

// Usage
const data = await publicClient.readContract({
  address: '0x...',
  abi: tokenAbi,
  functionName: 'balanceOf',
  args: [userAddress],
})
```

### useWalletClient

Returns viem WalletClient for write operations.

```typescript
const {
  walletClient,  // WalletClient | undefined
  isLoading,     // boolean
} = useWalletClient()
```

### useGasPrice

Returns current gas price.

```typescript
const {
  gasPrice,  // bigint | undefined
  isLoading, // boolean
  error,     // Error | null
} = useGasPrice()
```

### useConnect / useDisconnect

Connect or disconnect wallet.

```typescript
const { connect, connectors, isPending } = useConnect()
const { disconnect } = useDisconnect()

// Connect with specific connector
await connect({ connector: connectors[0] })

// Disconnect
disconnect()
```

### useSignMessage / useSignTypedData

Sign messages with connected wallet.

```typescript
const { signMessage, isPending } = useSignMessage()
const { signTypedData, isPending } = useSignTypedData()

// Sign message
const signature = await signMessage({ message: 'Hello' })

// Sign typed data (EIP-712)
const signature = await signTypedData({
  domain: { name: 'App', version: '1', chainId: 1 },
  types: { Message: [{ name: 'content', type: 'string' }] },
  primaryType: 'Message',
  message: { content: 'Hello' },
})
```

### useEnsName / useEnsAvatar

Resolve ENS names and avatars.

```typescript
const { ensName } = useEnsName({ address })
const { ensAvatar } = useEnsAvatar({ name: ensName })
```

## Contract Utilities

### getContractByName

Load a specific contract by name for a chain.

```typescript
import { getContractByName } from '@/constants/contracts'

const contract = await getContractByName(chainId, 'Token')
// Returns: {
//   address: '0x...',
//   name: 'Token',
//   description: 'ERC20 Token',
//   abi: [...],
// }
```

### getContractsForChain

Load all contracts deployed on a chain.

```typescript
import { getContractsForChain } from '@/constants/contracts'

const contracts = await getContractsForChain(chainId)
// Returns: {
//   Token: { address, name, description, abi },
//   Staking: { address, name, description, abi },
// }
```

## TransactionDialog Component

### Props Interface

```typescript
interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  params: ContractCallParams
  chainId: number
  onSuccess?: (receipt: TransactionReceipt) => void
  onError?: (error: Error) => void
}

interface ContractCallParams {
  address: `0x${string}`
  abi: Abi
  functionName: string
  args?: unknown[]
  value?: bigint
}
```

### Features

| Feature | Description |
|---------|-------------|
| Tenderly Simulation | Pre-executes transaction to check for reverts |
| Gas Estimation | Shows estimated gas cost before execution |
| AI Summary | Generates human-readable transaction description |
| Chain Switching | Prompts to switch if on wrong chain |
| Error Handling | Displays errors with details |
| Toast Notifications | Shows progress and result |

### Supported Simulation Chains

Tenderly simulation is supported on:
- Ethereum Mainnet (1)
- Sepolia (11155111)
- Polygon (137)
- Arbitrum (42161)
- Optimism (10)
- Base (8453)

Other chains fall back to standard viem simulation.

## Viem Utilities

### Formatting

```typescript
import { formatEther, formatGwei, formatUnits } from 'viem'

// Format from wei
formatEther(1000000000000000000n) // '1'
formatGwei(1000000000n)           // '1'
formatUnits(1000000n, 6)          // '1' (USDC)
```

### Parsing

```typescript
import { parseEther, parseGwei, parseUnits } from 'viem'

// Parse to wei
parseEther('1.5')      // 1500000000000000000n
parseGwei('20')        // 20000000000n
parseUnits('100', 6)   // 100000000n (USDC)
```

### Encoding

```typescript
import { encodeFunctionData, encodeAbiParameters } from 'viem'

// Encode function call
const data = encodeFunctionData({
  abi: tokenAbi,
  functionName: 'transfer',
  args: [recipient, amount],
})

// Encode parameters
const encoded = encodeAbiParameters(
  [{ type: 'address' }, { type: 'uint256' }],
  [recipient, amount]
)
```

### Decoding

```typescript
import { decodeFunctionResult, decodeAbiParameters } from 'viem'

// Decode function result
const result = decodeFunctionResult({
  abi: tokenAbi,
  functionName: 'balanceOf',
  data: '0x...',
})

// Decode parameters
const [address, amount] = decodeAbiParameters(
  [{ type: 'address' }, { type: 'uint256' }],
  data
)
```

## Chain Utilities

```typescript
import { getExplorerUrl, getChainName, getExplorerLink, isTestnet } from '@/lib/config/chains'
import { isTenderlySupported } from '@/lib/web3/tenderly'

// Get block explorer URL
const explorerUrl = getExplorerUrl(chainId)
// 'https://etherscan.io'

// Get chain name
const name = getChainName(chainId)
// 'Ethereum'

// Get full explorer link
const txLink = getExplorerLink(chainId, txHash, 'tx')
// 'https://etherscan.io/tx/0x...'

// Check if testnet
const isTest = isTestnet(chainId)
// true/false

// Check Tenderly support
const supported = isTenderlySupported(chainId)
// true/false
```

## Error Types

Common errors to handle:

| Error | Cause | Solution |
|-------|-------|----------|
| `UserRejected` | User rejected transaction | Show "Transaction cancelled" |
| `InsufficientFunds` | Not enough ETH for gas | Prompt to add funds |
| `ChainMismatch` | Wrong network | Use `useSwitchChain` |
| `ContractFunctionExecutionError` | Contract reverted | Show revert reason |
| `TransactionNotFound` | Invalid tx hash | Retry or check status |
