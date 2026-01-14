/**
 * Web3 Configuration
 *
 * This file sets up the chain configuration for wagmi/Privy.
 */

import { getSupportedViemChains, getSupportedChainList } from '@/lib/config/chains'
import type { Chain } from 'viem'

// =============================================================================
// Configuration
// =============================================================================

/**
 * Supported chains from app configuration
 */
export const supportedChains: readonly Chain[] = getSupportedViemChains()

/**
 * Get chain IDs for configuration
 */
export function getSupportedChainIds(): number[] {
  return getSupportedChainList().map((c) => c.chain.id)
}

/**
 * App metadata
 */
export const appMetadata = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'EVM Kit App',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Built with @cipherkuma/evm-kit',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
  icon: process.env.NEXT_PUBLIC_APP_ICON || 'https://avatars.githubusercontent.com/u/179229932',
}
