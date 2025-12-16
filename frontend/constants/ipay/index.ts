// =============================================================================
// iPay Constants
// =============================================================================
// Central exports for iPay multi-chain payment configuration
// =============================================================================

import type { Address } from 'viem'

// Re-export all types
export * from './types'

// Re-export chain configurations
export * from './chains'

// Re-export operation types
export * from './operations'

// =============================================================================
// Story Protocol (Destination Chain) Constants
// =============================================================================

/** Story Protocol chain ID (Aeneid testnet) */
export const STORY_CHAIN_ID = 1315

/** Story Protocol Hyperlane domain ID */
export const STORY_DOMAIN = 1315

/** Default source chain for payments (Avalanche Fuji) */
export const DEFAULT_SOURCE_CHAIN_ID = 43113

// =============================================================================
// IPayReceiver Contract (on Story Protocol)
// =============================================================================

/** IPayReceiver contract address on Story Aeneid */
export const IPAY_RECEIVER_ADDRESS = '0x84cfED6aD4B772eB5293409639cFEb0364d0c347' as Address

// =============================================================================
// Token Configuration
// =============================================================================

/** USDC decimals (same across all chains) */
export const USDC_DECIMALS = 6

/** WIP (Wrapped IP) token decimals on Story Protocol */
export const WIP_DECIMALS = 18

/**
 * USDC to WIP conversion rate
 * 1 USDC = 10 WIP (scaled to 18 decimals)
 * This accounts for the decimal difference (6 vs 18)
 */
export const USDC_TO_WIP_RATE = 10n * 10n ** 18n

/**
 * Minimum payment amount in USDC (0.01 USDC)
 */
export const MIN_PAYMENT_USDC = 10000n // 0.01 USDC in 6 decimals

/**
 * Maximum payment amount in USDC (10,000 USDC)
 */
export const MAX_PAYMENT_USDC = 10000000000n // 10,000 USDC in 6 decimals

// =============================================================================
// Default License Configuration
// =============================================================================

/** Default PIL license terms ID on Story Protocol */
export const DEFAULT_LICENSE_TERMS_ID = 1n

// =============================================================================
// Thirdweb Engine Configuration
// =============================================================================

/** Default Thirdweb Engine URL */
export const DEFAULT_ENGINE_URL = 'https://engine.thirdweb.com'

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert USDC amount to WIP amount
 * @param usdcAmount - Amount in USDC (6 decimals)
 * @returns Amount in WIP (18 decimals)
 */
export function usdcToWip(usdcAmount: bigint): bigint {
  // 1 USDC (1e6) = 10 WIP (10e18)
  // Formula: usdcAmount * 10 * 10^12 (to convert from 6 to 18 decimals and multiply by 10)
  return usdcAmount * 10n * 10n ** 12n
}

/**
 * Convert WIP amount to USDC amount
 * @param wipAmount - Amount in WIP (18 decimals)
 * @returns Amount in USDC (6 decimals)
 */
export function wipToUsdc(wipAmount: bigint): bigint {
  // Inverse of above: divide by 10 and convert decimals
  return wipAmount / (10n * 10n ** 12n)
}

/**
 * Format USDC amount for display
 * @param amount - Amount in USDC smallest unit (6 decimals)
 * @returns Formatted string
 */
export function formatUsdc(amount: bigint): string {
  const value = Number(amount) / 10 ** USDC_DECIMALS
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}

/**
 * Format WIP amount for display
 * @param amount - Amount in WIP smallest unit (18 decimals)
 * @returns Formatted string
 */
export function formatWip(amount: bigint): string {
  const value = Number(amount) / 10 ** WIP_DECIMALS
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

/**
 * Parse USDC string to bigint
 * @param value - Human readable USDC value (e.g., "1.5")
 * @returns Amount in smallest unit
 */
export function parseUsdc(value: string): bigint {
  const parsed = parseFloat(value)
  if (isNaN(parsed)) return 0n
  return BigInt(Math.floor(parsed * 10 ** USDC_DECIMALS))
}
