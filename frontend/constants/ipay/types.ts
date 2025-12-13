// =============================================================================
// iPay Type Definitions
// =============================================================================
// TypeScript interfaces for iPay multi-chain payment configuration
// =============================================================================

import type { Address } from 'viem'

/**
 * iPay chain configuration interface
 * Defines the structure for supported source chains
 */
export interface IPayChainConfig {
  chainId: number
  chainName: string
  displayName: string
  icon: string
  usdc: Address
  mailbox: Address
  domainId: number
  explorerUrl: string
  rpcUrl: string
  isTestnet: boolean
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

/**
 * Operation types for IPayReceiver contract
 */
export type IPayOperationType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/**
 * Operation type names for display
 */
export type IPayOperationName =
  | 'MINT_LICENSE'
  | 'CREATE_DERIVATIVE'
  | 'REGISTER_IP'
  | 'TRANSFER_LICENSE'
  | 'RAISE_DISPUTE'
  | 'CREATE_LISTING'
  | 'UPDATE_LISTING'
  | 'DEACTIVATE_LISTING'

/**
 * iPay payment request parameters
 */
export interface IPayPaymentRequest {
  sourceChainId: number
  operationType: IPayOperationType
  amount: bigint
  recipient: Address
  data: `0x${string}`
}

/**
 * iPay quote response from API
 */
export interface IPayQuote {
  sourceChainId: number
  destinationChainId: number
  usdcAmount: bigint
  wipAmount: bigint
  gasEstimate: bigint
  expiresAt: number
}

/**
 * Listing data for marketplace operations
 */
export interface IPayListing {
  listingId: bigint
  ipId: Address
  licenseTermsId: bigint
  price: bigint
  seller: Address
  isActive: boolean
  createdAt: number
}

/**
 * IP Asset metadata from Story Protocol
 */
export interface IPAssetMetadata {
  ipId: Address
  name: string
  description?: string
  imageUrl?: string
  creator: Address
  registrationDate: number
}
