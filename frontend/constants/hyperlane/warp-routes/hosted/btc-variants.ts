// =============================================================================
// Hyperlane Hosted Warp Routes - BTC Variants (WBTC, CBBTC, etc.)
// =============================================================================
// Auto-generated from warpRouteConfigs.yaml
// Last updated: 2025-12-12
// =============================================================================

import type { WarpRouteDeployment } from '../../types'

export const BTC_VARIANTS_WARP_ROUTES: WarpRouteDeployment[] = [
  {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 8453,
        chainName: 'base',
        routerAddress: '0x66477F84bd21697c7781fc3992b3163463e3B224' as `0x${string}`,
        tokenAddress: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x7710d2FC9A2E0452b28a2cBf550429b579347199' as `0x${string}`,
        tokenAddress: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 5330,
        chainName: 'superseed',
        routerAddress: '0x0a78BC3CBBC79C4C6E5d4e5b2bbD042E58e93484' as `0x${string}`,
        tokenAddress: '0x6f36dbd829de9b7e077db8a35b480d4329ceb331' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 8453,
        chainName: 'base',
        routerAddress: '0x2A872Ae01375A5ca7e044cb0e75cb97621Ca954A' as `0x${string}`,
        tokenAddress: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 543210,
        chainName: 'zeronetwork',
        routerAddress: '0x3f7F02453518A55C0c6F89F0A6A8ab6c22Da01Df' as `0x${string}`,
        tokenAddress: '0x3f7F02453518A55C0c6F89F0A6A8ab6c22Da01Df' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0xfF5C22ea202258143557f6cc3bDe174dde6E8fE1' as `0x${string}`,
        tokenAddress: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 747,
        chainName: 'flowmainnet',
        routerAddress: '0xA0197b2044D28b08Be34d98b23c9312158Ea9A18' as `0x${string}`,
        tokenAddress: '0xA0197b2044D28b08Be34d98b23c9312158Ea9A18' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'uBTC',
    name: 'uBTC',
    decimals: 18,
    chains: [
      {
        chainId: 288,
        chainName: 'boba',
        routerAddress: '0xFA3198ecF05303a6d96E57a45E6c815055D255b1' as `0x${string}`,
        tokenAddress: '0xFA3198ecF05303a6d96E57a45E6c815055D255b1' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 223,
        chainName: 'bsquared',
        routerAddress: '0x0FC41a92F526A8CD22060A4052e156502D6B9db0' as `0x${string}`,
        tokenAddress: '0x796e4D53067FF374B89b2Ac101ce0c1f72ccaAc2' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0xa582e9e96F5D58A1202ad216E89926283a5dD056' as `0x${string}`,
        tokenAddress: '0xa582e9e96F5D58A1202ad216E89926283a5dD056' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 6900,
        chainName: 'nibiru',
        routerAddress: '0xd59be1Da2e9B30b6f7aB27b2D08f841B39c349fa' as `0x${string}`,
        tokenAddress: '0xd59be1Da2e9B30b6f7aB27b2D08f841B39c349fa' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 1868,
        chainName: 'soneium',
        routerAddress: '0x61F2993a644762A345b483ADF0d6351C5EdFB3b5' as `0x${string}`,
        tokenAddress: '0x61F2993a644762A345b483ADF0d6351C5EdFB3b5' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 1923,
        chainName: 'swell',
        routerAddress: '0xFA3198ecF05303a6d96E57a45E6c815055D255b1' as `0x${string}`,
        tokenAddress: '0xFA3198ecF05303a6d96E57a45E6c815055D255b1' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 42161,
        chainName: 'arbitrum',
        routerAddress: '0x3CDbaBE5Bf4E6cfE10A2A326E0ad31b2d16398D4' as `0x${string}`,
        tokenAddress: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 56,
        chainName: 'bsc',
        routerAddress: '0xD42Af909d323D88e0E933B6c50D3e91c279004ca' as `0x${string}`,
        tokenAddress: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 137,
        chainName: 'polygon',
        routerAddress: '0xfF00e814A0dCB9a614585c212C78Fdc596d02e47' as `0x${string}`,
        tokenAddress: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 2632500,
        chainName: 'coti',
        routerAddress: '0x8C39B1fD0e6260fdf20652Fc436d25026832bfEA' as `0x${string}`,
        tokenAddress: '0x8C39B1fD0e6260fdf20652Fc436d25026832bfEA' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x5c43f06EF93bb0a2cd3C0f7b832AbA1F4d6575Ea' as `0x${string}`,
        tokenAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'WBTC',
    name: 'WBTC',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x5B4e223DE74ef8c3218e66EEcC541003CAB3121A' as `0x${string}`,
        tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0xd0d5271926f352c0161b0365a4156E2Bc0f99FAD' as `0x${string}`,
        tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 478,
        chainName: 'form',
        routerAddress: '0x0dc95Af5156fb0cC34a8c9BD646B748B9989A956' as `0x${string}`,
        tokenAddress: '0x0dc95Af5156fb0cC34a8c9BD646B748B9989A956' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x55A66567dFEc91e7Af39e0feb06009F35E8D68a9' as `0x${string}`,
        tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 999,
        chainName: 'hyperevm',
        routerAddress: '0xE2B36A37bD98ba81658dC5454F2dB2F98438d140' as `0x${string}`,
        tokenAddress: '0xE2B36A37bD98ba81658dC5454F2dB2F98438d140' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x745C75868237F3635c486fe166639Cc4706512A9' as `0x${string}`,
        tokenAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 34443,
        chainName: 'mode',
        routerAddress: '0x3c38fC01159E7BE0685653A0C896eA49F2BAa7c1' as `0x${string}`,
        tokenAddress: '0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 534352,
        chainName: 'scroll',
        routerAddress: '0x10a5263ACED246fCD0977f1a3C6A238a14183096' as `0x${string}`,
        tokenAddress: '0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 543210,
        chainName: 'zeronetwork',
        routerAddress: '0xe6ca7C4A9652Fe93190Bd84363f2056Df1fb9A94' as `0x${string}`,
        tokenAddress: '0xe6ca7C4A9652Fe93190Bd84363f2056Df1fb9A94' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x0E993E49df1b7412DED493EAAf806730b74378b9' as `0x${string}`,
        tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x6cFC3e0579F3706E6f2E4BC039e8372b868F3CA5' as `0x${string}`,
        tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 24101,
        chainName: 'incentiv',
        routerAddress: '0x0292593D416Cb765E0e8FF77b32fA7e465958FEE' as `0x${string}`,
        tokenAddress: '0x0292593D416Cb765E0e8FF77b32fA7e465958FEE' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0xABb5E5b46112Ca652481d1117459dc289a1Ee282' as `0x${string}`,
        tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 5888,
        chainName: 'mantra',
        routerAddress: '0xc7960A4Baa8d9Db795890b56Af874F3a24c20123' as `0x${string}`,
        tokenAddress: '0xc7960A4Baa8d9Db795890b56Af874F3a24c20123' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'enzoBTC',
    name: 'Lorenzo Wrapped Bitcoin',
    decimals: 8,
    chains: [
      {
        chainId: 56,
        chainName: 'bsc',
        routerAddress: '0xba06D7f285C6B0d5EacC50ceA931163B23Ab889c' as `0x${string}`,
        tokenAddress: '0x6A9A65B84843F5fD4aC9a0471C4fc11AFfFBce4a' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 999,
        chainName: 'hyperevm',
        routerAddress: '0xcb98BD947B58445Fc4815f10285F44De42129918' as `0x${string}`,
        tokenAddress: '0xcb98BD947B58445Fc4815f10285F44De42129918' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'pumpBTC.sei',
    name: 'pumpBTC.sei',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x179149B7E74910d2A58b2a737e1a8B6F44388882' as `0x${string}`,
        tokenAddress: '0xe9ebd666954B7F0B5B044704c86B126651f6235d' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 1329,
        chainName: 'sei',
        routerAddress: '0x64310A6176979ac8a752fFC98c0FBbC4CF861ACe' as `0x${string}`,
        tokenAddress: '0x64310A6176979ac8a752fFC98c0FBbC4CF861ACe' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'pumpBTC.stk',
    name: 'pumpBTC.stk',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x4564da2DD9BaDE637c85a1B5BFC14eF5099096BC' as `0x${string}`,
        tokenAddress: '0xfa78Ea5d8C39E0a8852aBAAF88aE4D32349b7D02' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'pumpBTC.uni',
    name: 'pumpBTC.uni',
    decimals: 8,
    chains: [
      {
        chainId: 1,
        chainName: 'ethereum',
        routerAddress: '0x791a257977a147B501dA11013C826063FF2d881e' as `0x${string}`,
        tokenAddress: '0x2Cd2644EdAB51CB2122f37e03E5f997661d49cfE' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 130,
        chainName: 'unichain',
        routerAddress: '0x854B2BCd07e55A71A05CE90921E419B2dBACB483' as `0x${string}`,
        tokenAddress: '0x854B2BCd07e55A71A05CE90921E419B2dBACB483' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'stBTC',
    name: 'Lorenzo stBTC',
    decimals: 18,
    chains: [
      {
        chainId: 56,
        chainName: 'bsc',
        routerAddress: '0xA0B3b527A15218f980Ceb33df049Dd58D3Da8223' as `0x${string}`,
        tokenAddress: '0xf6718b2701d4a6498ef77d7c152b2137ab28b8a3' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 999,
        chainName: 'hyperevm',
        routerAddress: '0xd2bb5f4d89Ee1e497489503Bdc9a7c9CeBB3918E' as `0x${string}`,
        tokenAddress: '0xd2bb5f4d89Ee1e497489503Bdc9a7c9CeBB3918E' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
]
