// =============================================================================
// Hyperlane Hosted Warp Routes - Other Stablecoins (DAI, EURC, etc.)
// =============================================================================
// Auto-generated from warpRouteConfigs.yaml
// Last updated: 2025-12-12
// =============================================================================

import type { WarpRouteDeployment } from '../../types'

export const STABLECOINS_OTHER_WARP_ROUTES: WarpRouteDeployment[] = [
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    chains: [
      {
        chainId: 42161,
        chainName: 'arbitrum',
        routerAddress: '0x1e59F72de6c00c456f7F42708FE8b6b0782E84C6' as `0x${string}`,
        tokenAddress: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 56,
        chainName: 'bsc',
        routerAddress: '0x7379A18963039eA1284050b585f422e8156c9eC0' as `0x${string}`,
        tokenAddress: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 137,
        chainName: 'polygon',
        routerAddress: '0x1E71a8d870F0C491d4fCC965A59493b8B7564949' as `0x${string}`,
        tokenAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    chains: [
      {
        chainId: 42161,
        chainName: 'arbitrum',
        routerAddress: '0xEb881635A2Dd87d2b7C0F7B206810fa2A1956552' as `0x${string}`,
        tokenAddress: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 56,
        chainName: 'bsc',
        routerAddress: '0xEb881635A2Dd87d2b7C0F7B206810fa2A1956552' as `0x${string}`,
        tokenAddress: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 59144,
        chainName: 'linea',
        routerAddress: '0xdF17853b7a56499d7d6CAe0cEa3003EfC8257B5b' as `0x${string}`,
        tokenAddress: '0xdF17853b7a56499d7d6CAe0cEa3003EfC8257B5b' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 137,
        chainName: 'polygon',
        routerAddress: '0xEb881635A2Dd87d2b7C0F7B206810fa2A1956552' as `0x${string}`,
        tokenAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'EURC',
    name: 'Euro Coin',
    decimals: 6,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x236f7CCE81558b36cE0D866017ECF006be7d5c30' as `0x${string}`,
        tokenAddress: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 698,
        chainName: 'matchain',
        routerAddress: '0xA452bDb132Cdf8d11E070786D78907ddB95C5120' as `0x${string}`,
        tokenAddress: '0x633268639892C73Fa7340Ec1da4e397cf3913c8C' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'fastUSD',
    name: 'fastUSD',
    decimals: 18,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x9AD81058c6C3Bf552C9014CB30E824717A0ee21b' as `0x${string}`,
        tokenAddress: '0x15700B564Ca08D9439C58cA5053166E8317aa138' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 1329,
        chainName: 'sei',
        routerAddress: '0xeA895A7Ff45d8d3857A04c1E38A362f3bd9a076f' as `0x${string}`,
        tokenAddress: '0x37a4dD9CED2b19Cfe8FAC251cd727b5787E45269' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'USDB',
    name: 'USDB',
    decimals: 18,
    chains: [
      {
        chainId: 81457,
        chainName: 'blast',
        routerAddress: '0x1CF975C9bF2DF76c43a14405066007f8393142E9' as `0x${string}`,
        tokenAddress: '0x4300000000000000000000000000000000000003' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 543210,
        chainName: 'zeronetwork',
        routerAddress: '0xB11a9606f3e470abD00b1bbB28AffAC3126c2Acb' as `0x${string}`,
        tokenAddress: '0xB11a9606f3e470abD00b1bbB28AffAC3126c2Acb' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'USDN',
    name: 'Noble Dollar',
    decimals: 6,
    chains: [
      {
        chainId: 1313161555,
        chainName: 'auroratestnet',
        routerAddress: '0x2d10ad108d26384329Ac879476Ae0F4cc0531DEC' as `0x${string}`,
        tokenAddress: '0x2d10ad108d26384329Ac879476Ae0F4cc0531DEC' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'USDSC',
    name: 'Startale USD',
    decimals: 6,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x36f586A30502AE3afb555b8aA4dCc05d233c2ecE' as `0x${string}`,
        tokenAddress: '0x3f99231dD03a9F0E7e3421c92B7b90fbe012985a' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 1868,
        chainName: 'soneium',
        routerAddress: '0x36f586A30502AE3afb555b8aA4dCc05d233c2ecE' as `0x${string}`,
        tokenAddress: '0x3f99231dD03a9F0E7e3421c92B7b90fbe012985a' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'mUSD',
    name: 'MetaMask USD',
    decimals: 6,
    chains: [
      {
        chainId: 56,
        chainName: 'bsc',
        routerAddress: '0x36f586A30502AE3afb555b8aA4dCc05d233c2ecE' as `0x${string}`,
        tokenAddress: '0xaca92e438df0b2401ff60da7e4337b687a2435da' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x36f586A30502AE3afb555b8aA4dCc05d233c2ecE' as `0x${string}`,
        tokenAddress: '0xaca92e438df0b2401ff60da7e4337b687a2435da' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 59144,
        chainName: 'linea',
        routerAddress: '0x36f586A30502AE3afb555b8aA4dCc05d233c2ecE' as `0x${string}`,
        tokenAddress: '0xaca92e438df0b2401ff60da7e4337b687a2435da' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'oXAUT',
    name: 'OpenXAUT',
    decimals: 6,
    chains: [
      {
        chainId: 43114,
        chainName: 'avalanche',
        routerAddress: '0x118b30d28e5dB274f2376910038F66b1C33bD00a' as `0x${string}`,
        tokenAddress: '0x30974f73A4ac9E606Ed80da928e454977ac486D2' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 8453,
        chainName: 'base',
        routerAddress: '0x0fcf8DAE34efB101e7dF535550370da4e53Ab960' as `0x${string}`,
        tokenAddress: '0x30974f73A4ac9E606Ed80da928e454977ac486D2' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 42220,
        chainName: 'celo',
        routerAddress: '0x53a81819DFD46730116B89dBCb096DAcC4e73cEA' as `0x${string}`,
        tokenAddress: '0x30974f73A4ac9E606Ed80da928e454977ac486D2' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x9A9C33115455a929D3d821CEE4A01e38241bF375' as `0x${string}`,
        tokenAddress: '0x0797c6f55f5c9005996A55959A341018cF69A963' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 480,
        chainName: 'worldchain',
        routerAddress: '0xEa0ad8Fc869f5Ab97a859c3af110367865699a8d' as `0x${string}`,
        tokenAddress: '0x30974f73A4ac9E606Ed80da928e454977ac486D2' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'tUSD',
    name: 'tUSD',
    decimals: 6,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x69B1A59e98D94E1B9647C08Cb295Fc52597D20f0' as `0x${string}`,
        tokenAddress: '0x722a851B6798D65b80526562Fc3a36E19b1F883b' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
]
