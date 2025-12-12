/**
 * Thirdweb Configuration
 *
 * This file sets up the Thirdweb client and wallet configuration.
 */

import { getSupportedViemChains, getSupportedChainList } from '@/lib/config/chains'
import type { Chain } from 'viem'

// =============================================================================
// Configuration
// =============================================================================

/**
 * Thirdweb Client ID
 * Get yours at https://thirdweb.com/dashboard
 */
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID

if (!clientId) {
  console.warn(
    'NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Wallet connection will not work.'
  )
}

/**
 * Supported chains from app configuration
 */
export const supportedChains: readonly Chain[] = getSupportedViemChains()

/**
 * Get chain IDs for Thirdweb
 */
export function getSupportedChainIds(): number[] {
  return getSupportedChainList().map((c) => c.chain.id)
}

/**
 * Thirdweb app metadata
 */
export const thirdwebMetadata = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'EVM Kit App',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Built with @cipherkuma/evm-kit',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
  icon: process.env.NEXT_PUBLIC_APP_ICON || 'https://avatars.githubusercontent.com/u/179229932',
}

/**
 * Supported wallet types for connection
 */
export const supportedWallets = [
  'io.metamask',
  'com.coinbase.wallet',
  'io.rabby',
  'app.phantom',
  'com.trustwallet.app',
  'me.rainbow',
] as const

/**
 * Export client ID for provider initialization
 */
export { clientId }
