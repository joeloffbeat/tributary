// =============================================================================
// Hyperlane Hosted Warp Routes
// =============================================================================
// Official Hyperlane warp route deployments
// Re-exports from hosted/ directory for backward compatibility
// Source: https://github.com/hyperlane-xyz/hyperlane-registry
// =============================================================================

import type { WarpRouteDeployment } from '../types'

// Import all routes from the hosted/ directory
import {
  ALL_HOSTED_WARP_ROUTES,
  getAllHostedWarpRoutes as _getAllHostedWarpRoutes,
  getHostedWarpRouteBySymbol,
  getHostedWarpRoutesForChain as _getHostedWarpRoutesForChain,
  getHostedWarpRoutesByCategory,
  // Category exports
  USDC_WARP_ROUTES,
  USDT_WARP_ROUTES,
  STABLECOINS_OTHER_WARP_ROUTES,
  ETH_VARIANTS_WARP_ROUTES,
  BTC_VARIANTS_WARP_ROUTES,
  SOL_VARIANTS_WARP_ROUTES,
  TIA_VARIANTS_WARP_ROUTES,
  NATIVE_TOKENS_WARP_ROUTES,
  MEME_TOKENS_WARP_ROUTES,
  OTHER_TOKENS_WARP_ROUTES,
} from './hosted/index'

// Re-export all category arrays
export {
  USDC_WARP_ROUTES,
  USDT_WARP_ROUTES,
  STABLECOINS_OTHER_WARP_ROUTES,
  ETH_VARIANTS_WARP_ROUTES,
  BTC_VARIANTS_WARP_ROUTES,
  SOL_VARIANTS_WARP_ROUTES,
  TIA_VARIANTS_WARP_ROUTES,
  NATIVE_TOKENS_WARP_ROUTES,
  MEME_TOKENS_WARP_ROUTES,
  OTHER_TOKENS_WARP_ROUTES,
  getHostedWarpRoutesByCategory,
}

/**
 * All official Hyperlane warp routes (204 routes across 10 categories)
 * Categories: USDC, USDT, other stablecoins, ETH variants, BTC variants,
 *            SOL variants, TIA variants, native tokens, meme tokens, other tokens
 */
export const HOSTED_WARP_ROUTES: WarpRouteDeployment[] = ALL_HOSTED_WARP_ROUTES

/**
 * Get all hosted warp routes
 */
export function getHostedWarpRoutes(): WarpRouteDeployment[] {
  return ALL_HOSTED_WARP_ROUTES
}

/**
 * Get hosted warp route by symbol
 * Note: Multiple routes may exist for the same symbol (different chain combinations)
 * This returns the first match
 */
export function getHostedWarpRoute(symbol: string): WarpRouteDeployment | undefined {
  return getHostedWarpRouteBySymbol(symbol)
}

/**
 * Get all hosted warp routes matching a symbol
 */
export function getHostedWarpRoutesBySymbol(symbol: string): WarpRouteDeployment[] {
  return ALL_HOSTED_WARP_ROUTES.filter(r => r.symbol.toLowerCase() === symbol.toLowerCase())
}

/**
 * Get warp routes available on a specific chain
 */
export function getHostedWarpRoutesForChain(chainId: number): WarpRouteDeployment[] {
  return _getHostedWarpRoutesForChain(chainId)
}

/**
 * Get warp route count statistics
 */
export function getHostedWarpRouteStats(): {
  total: number
  byCategory: Record<string, number>
} {
  return {
    total: ALL_HOSTED_WARP_ROUTES.length,
    byCategory: {
      usdc: USDC_WARP_ROUTES.length,
      usdt: USDT_WARP_ROUTES.length,
      'stablecoins-other': STABLECOINS_OTHER_WARP_ROUTES.length,
      'eth-variants': ETH_VARIANTS_WARP_ROUTES.length,
      'btc-variants': BTC_VARIANTS_WARP_ROUTES.length,
      'sol-variants': SOL_VARIANTS_WARP_ROUTES.length,
      'tia-variants': TIA_VARIANTS_WARP_ROUTES.length,
      'native-tokens': NATIVE_TOKENS_WARP_ROUTES.length,
      'meme-tokens': MEME_TOKENS_WARP_ROUTES.length,
      'other-tokens': OTHER_TOKENS_WARP_ROUTES.length,
    },
  }
}
