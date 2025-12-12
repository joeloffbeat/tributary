// =============================================================================
// Hyperlane Hosted Warp Routes - Index
// =============================================================================
// Auto-generated aggregator for all hosted warp routes
// =============================================================================

import type { WarpRouteDeployment } from '../../types'
import { USDC_WARP_ROUTES } from './usdc'
import { USDT_WARP_ROUTES } from './usdt'
import { STABLECOINS_OTHER_WARP_ROUTES } from './stablecoins-other'
import { ETH_VARIANTS_WARP_ROUTES } from './eth-variants'
import { BTC_VARIANTS_WARP_ROUTES } from './btc-variants'
import { SOL_VARIANTS_WARP_ROUTES } from './sol-variants'
import { TIA_VARIANTS_WARP_ROUTES } from './tia-variants'
import { NATIVE_TOKENS_WARP_ROUTES } from './native-tokens'
import { MEME_TOKENS_WARP_ROUTES } from './meme-tokens'
import { OTHER_TOKENS_WARP_ROUTES } from './other-tokens'

// Re-export individual categories
export { USDC_WARP_ROUTES }
export { USDT_WARP_ROUTES }
export { STABLECOINS_OTHER_WARP_ROUTES }
export { ETH_VARIANTS_WARP_ROUTES }
export { BTC_VARIANTS_WARP_ROUTES }
export { SOL_VARIANTS_WARP_ROUTES }
export { TIA_VARIANTS_WARP_ROUTES }
export { NATIVE_TOKENS_WARP_ROUTES }
export { MEME_TOKENS_WARP_ROUTES }
export { OTHER_TOKENS_WARP_ROUTES }

/**
 * All hosted warp routes combined
 */
export const ALL_HOSTED_WARP_ROUTES: WarpRouteDeployment[] = [
  ...USDC_WARP_ROUTES,
  ...USDT_WARP_ROUTES,
  ...STABLECOINS_OTHER_WARP_ROUTES,
  ...ETH_VARIANTS_WARP_ROUTES,
  ...BTC_VARIANTS_WARP_ROUTES,
  ...SOL_VARIANTS_WARP_ROUTES,
  ...TIA_VARIANTS_WARP_ROUTES,
  ...NATIVE_TOKENS_WARP_ROUTES,
  ...MEME_TOKENS_WARP_ROUTES,
  ...OTHER_TOKENS_WARP_ROUTES,
]

/**
 * Get all hosted warp routes
 */
export function getAllHostedWarpRoutes(): WarpRouteDeployment[] {
  return ALL_HOSTED_WARP_ROUTES
}

/**
 * Get hosted warp route by symbol
 */
export function getHostedWarpRouteBySymbol(symbol: string): WarpRouteDeployment | undefined {
  return ALL_HOSTED_WARP_ROUTES.find(r => r.symbol.toLowerCase() === symbol.toLowerCase())
}

/**
 * Get hosted warp routes for a specific chain
 */
export function getHostedWarpRoutesForChain(chainId: number): WarpRouteDeployment[] {
  return ALL_HOSTED_WARP_ROUTES.filter(route =>
    route.chains.some(c => c.chainId === chainId)
  )
}

/**
 * Get hosted warp routes by category
 */
export function getHostedWarpRoutesByCategory(category: string): WarpRouteDeployment[] {
  switch (category) {
    case 'usdc': return USDC_WARP_ROUTES
    case 'usdt': return USDT_WARP_ROUTES
    case 'stablecoins-other': return STABLECOINS_OTHER_WARP_ROUTES
    case 'eth-variants': return ETH_VARIANTS_WARP_ROUTES
    case 'btc-variants': return BTC_VARIANTS_WARP_ROUTES
    case 'sol-variants': return SOL_VARIANTS_WARP_ROUTES
    case 'tia-variants': return TIA_VARIANTS_WARP_ROUTES
    case 'native-tokens': return NATIVE_TOKENS_WARP_ROUTES
    case 'meme-tokens': return MEME_TOKENS_WARP_ROUTES
    case 'other-tokens': return OTHER_TOKENS_WARP_ROUTES
    default: return []
  }
}
