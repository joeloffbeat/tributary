// =============================================================================
// Hyperlane Hosted Warp Routes - SOL Variants (SOL, jitoSOL, etc.)
// =============================================================================
// Auto-generated from warpRouteConfigs.yaml
// Last updated: 2025-12-12
// =============================================================================

import type { WarpRouteDeployment } from '../../types'

export const SOL_VARIANTS_WARP_ROUTES: WarpRouteDeployment[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    chains: [
      {
        chainId: 33139,
        chainName: 'apechain',
        routerAddress: '0x16eE589E237f2c70aBE91F87a6C0712C836941bb' as `0x${string}`,
        tokenAddress: '0x16eE589E237f2c70aBE91F87a6C0712C836941bb' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    chains: [
      {
        chainId: 999,
        chainName: 'hyperevm',
        routerAddress: '0x96029bcf706FAC4176492F4a05f63f7d23cE78fb' as `0x${string}`,
        tokenAddress: '0x96029bcf706FAC4176492F4a05f63f7d23cE78fb' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    chains: [
      {
        chainId: 24101,
        chainName: 'incentiv',
        routerAddress: '0xfaC24134dbc4b00Ee11114eCDFE6397f389203E3' as `0x${string}`,
        tokenAddress: '0xfaC24134dbc4b00Ee11114eCDFE6397f389203E3' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'SOLX',
    name: 'Solaxy',
    decimals: 18,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x261a172eB72D8D32837D123E8AcC4d2e44117195' as `0x${string}`,
        tokenAddress: '0xe0B7AD7F8F26e2b00C8b47b5Df370f15F90fCF48' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
]
