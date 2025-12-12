// =============================================================================
// Hyperlane Self-Hosted Warp Routes
// =============================================================================
// Custom warp route deployments for self-hosted Hyperlane
// Story Aenid <-> Avalanche Fuji
// =============================================================================

import type { WarpRouteDeployment } from '../types'

/**
 * Self-hosted warp routes
 * Token bridging across all 4 self-hosted chains
 */
export const SELF_HOSTED_WARP_ROUTES: WarpRouteDeployment[] = [
  // USDC - Bridging across all 4 chains
  // Sepolia has collateral (real USDC), other chains have synthetics
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chains: [
      {
        chainId: 11155111,
        chainName: 'sepolia',
        routerAddress: '0x2F427125E2Cc9fd050e46bA646B75490176fDe27',
        tokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
        type: 'collateral',
      },
      {
        chainId: 1315,
        chainName: 'storyaenid',
        routerAddress: '0x33641e15d8f590161a47Fe696cF3C819d5636e71',
        tokenAddress: '0x33641e15d8f590161a47Fe696cF3C819d5636e71', // Synthetic (router is token)
        type: 'synthetic',
      },
      {
        chainId: 43113,
        chainName: 'fuji',
        routerAddress: '0x42E86212057aD345B164EeEAc2F410Ca96a68200',
        tokenAddress: '0x42E86212057aD345B164EeEAc2F410Ca96a68200', // Synthetic (router is token)
        type: 'synthetic',
      },
      {
        chainId: 80002,
        chainName: 'polygonamoy',
        routerAddress: '0x6751dcD58F63dB5b1175d8668d7cF2CeE38D07A8',
        tokenAddress: '0x6751dcD58F63dB5b1175d8668d7cF2CeE38D07A8', // Synthetic (router is token)
        type: 'synthetic',
      },
    ],
  },
  // IP Token - Story Aenid <-> Avalanche Fuji only
  {
    symbol: 'IP',
    name: 'IP Token',
    decimals: 18,
    chains: [
      {
        chainId: 1315,
        chainName: 'storyaenid',
        routerAddress: '0x87Da1De8beDC98BfE27EddF3dcfCa8BEbc2425B3',
        tokenAddress: '0x0000000000000000000000000000000000000000', // Native token
        type: 'native',
      },
      {
        chainId: 43113,
        chainName: 'fuji',
        routerAddress: '0x2F427125E2Cc9fd050e46bA646B75490176fDe27',
        tokenAddress: '0x2F427125E2Cc9fd050e46bA646B75490176fDe27', // Synthetic (router is token)
        type: 'synthetic',
      },
    ],
  },
]

/**
 * Get all self-hosted warp routes
 */
export function getSelfHostedWarpRoutes(): WarpRouteDeployment[] {
  return SELF_HOSTED_WARP_ROUTES
}

/**
 * Get self-hosted warp route by symbol
 */
export function getSelfHostedWarpRoute(symbol: string): WarpRouteDeployment | undefined {
  return SELF_HOSTED_WARP_ROUTES.find(r => r.symbol === symbol)
}

/**
 * Get warp routes available on a specific chain
 */
export function getSelfHostedWarpRoutesForChain(chainId: number): WarpRouteDeployment[] {
  return SELF_HOSTED_WARP_ROUTES.filter(route =>
    route.chains.some(c => c.chainId === chainId)
  )
}
