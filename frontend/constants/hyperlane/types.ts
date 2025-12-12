// =============================================================================
// Hyperlane Types
// =============================================================================

import type { Address } from 'viem'

export type HyperlaneMode = 'hosted' | 'self-hosted'

// Chain metadata (non-address info)
export interface ChainMetadata {
  chainId: number
  chainName: string // Hyperlane chain name (lowercase, no spaces)
  displayName: string
  domainId: number // Usually same as chainId
  isTestnet: boolean
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  explorerUrl?: string
  rpcUrl?: string
}

// Full deployment info (combined from separate address files)
export interface HyperlaneDeployment extends ChainMetadata {
  mailbox: Address
  validatorAnnounce: Address
  proxyAdmin?: Address
  interchainAccountRouter?: Address
  interchainAccountIsm?: Address
  testRecipient?: Address
  // ISM Factories
  staticMerkleRootMultisigIsmFactory?: Address
  staticMessageIdMultisigIsmFactory?: Address
  staticAggregationIsmFactory?: Address
  domainRoutingIsmFactory?: Address
  // Hook Factories
  staticAggregationHookFactory?: Address
}

// Warp route chain config
export interface WarpRouteChain {
  chainId: number
  chainName: string
  routerAddress: Address
  tokenAddress: Address
  type: 'native' | 'collateral' | 'synthetic'
}

// Warp route deployment
export interface WarpRouteDeployment {
  symbol: string
  name: string
  decimals: number
  chains: WarpRouteChain[]
}
