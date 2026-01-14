/**
 * Web3 Interface - Privy/Wagmi Implementation
 *
 * This is the STABLE API that all protocols use.
 *
 * Usage in protocols:
 * ```typescript
 * import { useAccount, useWalletClient, usePublicClient } from '@/lib/web3'
 *
 * function MyComponent() {
 *   const { address, isConnected } = useAccount()
 *   const walletClient = useWalletClient()
 *   const publicClient = usePublicClient()
 *   // ... works with Privy auth provider
 * }
 * ```
 */

// =============================================================================
// Core Hooks (abstraction layer)
// =============================================================================

// Account
export { useAccount, useIsSmartAccount } from './account'

// Clients
export { usePublicClient, useWalletClient } from './clients'

// Chain
export { useChainId, useSwitchChain, useChains } from './chain'

// Balance
export { useBalance } from './balance'

// =============================================================================
// Transaction Hooks
// =============================================================================

export { useSendTransaction, useWaitForTransaction, useGasPrice } from './transaction'

// =============================================================================
// Contract Hooks
// =============================================================================

export { useReadContract, useWriteContract } from './contract'

// =============================================================================
// Connection Hooks
// =============================================================================

export { useConnect, useDisconnect } from './connection'

// =============================================================================
// ENS Hooks
// =============================================================================

export { useEnsName, useEnsAvatar } from './ens'

// =============================================================================
// Signature Hooks
// =============================================================================

export { useSignMessage, useSignTypedData } from './signature'

// =============================================================================
// Components
// =============================================================================

export { ConnectButton } from '@/components/web3/connect-button'

// =============================================================================
// Types
// =============================================================================

export type {
  // Account
  Web3Account,

  // Clients
  UsePublicClientReturn,
  UseWalletClientReturn,

  // Chain
  UseSwitchChainReturn,
  UseChainsReturn,

  // Balance
  UseBalanceParams,
  UseBalanceReturn,

  // Token
  Token,
  UseTokenParams,
  UseTokenReturn,

  // Transaction
  TransactionRequest,
  UseSendTransactionReturn,
  UseWaitForTransactionParams,
  UseWaitForTransactionReturn,

  // Contract
  UseReadContractParams,
  UseReadContractReturn,
  UseWriteContractReturn,

  // Connection
  UseConnectReturn,
  UseDisconnectReturn,

  // ENS
  UseEnsNameParams,
  UseEnsNameReturn,
  UseEnsAvatarParams,
  UseEnsAvatarReturn,

  // Signature
  UseSignMessageReturn,
  UseSignTypedDataReturn,
} from './types'

// Re-export viem types
export type {
  PublicClient,
  WalletClient,
  Chain,
  Address,
  Hash,
  Hex,
} from 'viem'

// =============================================================================
// Utilities (from config)
// =============================================================================

export { supportedChains, getSupportedChainIds } from './config'

// =============================================================================
// Utilities - Import directly from specific modules for better tree-shaking
// =============================================================================

// Common formatting utilities (frequently used)
export { formatAddress, formatBalance, formatUSD, formatTokenAmount, isValidAddress } from './format'

// Chain utilities (frequently used)
export { getChainById, getChainName, getExplorerLink, isTestnet, getExplorerUrl, getChainIcon } from '@/lib/config/chains'

// Asset utilities (frequently used)
export { getChainLogoUrl, getTokenLogoUrl, getChainMetadata, CHAIN_IDS, CHAIN_METADATA } from './assets'

// =============================================================================
// For less common utilities, import directly from their modules:
// - import { ... } from '@/lib/web3/format'
// - import { ... } from '@/lib/config/chains'
// - import { ... } from '@/lib/web3/contracts'
// - import { ... } from '@/lib/web3/eth-transfer'
// - import { ... } from '@/lib/web3/assets'
// - import { ... } from '@/lib/web3/price'
// - import { ... } from '@/lib/web3/ipfs'
// - import { ... } from '@/lib/web3/pinata'
// - import { ... } from '@/lib/web3/tenderly'
// - import { ... } from '@/lib/web3/tenderly-cache'
// - import { ... } from '@/lib/web3/abis'
// - import { ... } from '@/lib/web3/addresses'
// =============================================================================
