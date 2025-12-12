// =============================================================================
// Hyperlane Hosted Warp Routes - Native Chain Tokens (BNB, POL, etc.)
// =============================================================================
// Auto-generated from warpRouteConfigs.yaml
// Last updated: 2025-12-12
// =============================================================================

import type { WarpRouteDeployment } from '../../types'

export const NATIVE_TOKENS_WARP_ROUTES: WarpRouteDeployment[] = [
  {
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    chains: [
      {
        chainId: 56,
        chainName: 'bsc',
        routerAddress: '0x8d0e034611B691683377d2fC9958122a30F7DAab' as `0x${string}`,
        tokenAddress: '0x8d0e034611B691683377d2fC9958122a30F7DAab' as `0x${string}`,
        type: 'native',
      },
    ],
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    chains: [
      {
        chainId: 56,
        chainName: 'bsc',
        routerAddress: '0xb11d99AD37872068B14b5b9eeb3CE1A4E2244744' as `0x${string}`,
        tokenAddress: '0xb11d99AD37872068B14b5b9eeb3CE1A4E2244744' as `0x${string}`,
        type: 'native',
      },
      {
        chainId: 543210,
        chainName: 'zeronetwork',
        routerAddress: '0xa32ea8B73C03eb21A8dC6126D9D0D65D1F8FC65d' as `0x${string}`,
        tokenAddress: '0xa32ea8B73C03eb21A8dC6126D9D0D65D1F8FC65d' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    chains: [
      {
        chainId: 56,
        chainName: 'bsc',
        routerAddress: '0xdd615fCfed0E2BE65041053DA12C3C95C6A16957' as `0x${string}`,
        tokenAddress: '0xdd615fCfed0E2BE65041053DA12C3C95C6A16957' as `0x${string}`,
        type: 'native',
      },
    ],
  },
  {
    symbol: 'LYX',
    name: 'Bridged LUKSO (Hyperlane)',
    decimals: 18,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0xC210B2cB65ed3484892167F5e05F7ab496Ab0598' as `0x${string}`,
        tokenAddress: '0xC210B2cB65ed3484892167F5e05F7ab496Ab0598' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 42,
        chainName: 'lukso',
        routerAddress: '0xC210B2cB65ed3484892167F5e05F7ab496Ab0598' as `0x${string}`,
        tokenAddress: '0xC210B2cB65ed3484892167F5e05F7ab496Ab0598' as `0x${string}`,
        type: 'native',
      },
    ],
  },
  {
    symbol: 'OP',
    name: 'Optimism',
    decimals: 18,
    chains: [
      {
        chainId: 10,
        chainName: 'optimism',
        routerAddress: '0x0Ea3C23A4dC198c289D5443ac302335aBc86E6b1' as `0x${string}`,
        tokenAddress: '0x4200000000000000000000000000000000000042' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 5330,
        chainName: 'superseed',
        routerAddress: '0x4e128A1b613A9C9Ecf650FeE461c353612559fcf' as `0x${string}`,
        tokenAddress: '0x4e128A1b613A9C9Ecf650FeE461c353612559fcf' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'POL',
    name: 'Polygon Ecosystem Token',
    decimals: 18,
    chains: [
      {
        chainId: 137,
        chainName: 'polygon',
        routerAddress: '0x0a6364152EA7a487C697a36Eb2522f48bC62fB4c' as `0x${string}`,
        tokenAddress: '0x0a6364152EA7a487C697a36Eb2522f48bC62fB4c' as `0x${string}`,
        type: 'native',
      },
    ],
  },
  {
    symbol: 'POL',
    name: 'Polygon Ecosystem Token',
    decimals: 18,
    chains: [
      {
        chainId: 137,
        chainName: 'polygon',
        routerAddress: '0x76Af114f7Ebe96C02a3e4AB10f1511a7A66057A1' as `0x${string}`,
        tokenAddress: '0x76Af114f7Ebe96C02a3e4AB10f1511a7A66057A1' as `0x${string}`,
        type: 'native',
      },
      {
        chainId: 543210,
        chainName: 'zeronetwork',
        routerAddress: '0x3d7dBc3dab88C0e3c3Dcb6901a6163bb02417e6B' as `0x${string}`,
        tokenAddress: '0x3d7dBc3dab88C0e3c3Dcb6901a6163bb02417e6B' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'eXRD',
    name: 'E-RADIX',
    decimals: 18,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x94a766ebdfbBFF21428b6C504Be7405e74c02774' as `0x${string}`,
        tokenAddress: '0x6468e79A80C0eaB0F9A2B574c8d5bC374Af59414' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
]
