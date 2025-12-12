// =============================================================================
// Hyperlane Hosted Warp Routes - Meme/Social Tokens
// =============================================================================
// Auto-generated from warpRouteConfigs.yaml
// Last updated: 2025-12-12
// =============================================================================

import type { WarpRouteDeployment } from '../../types'

export const MEME_TOKENS_WARP_ROUTES: WarpRouteDeployment[] = [
  {
    symbol: 'BRETT',
    name: 'Brett',
    decimals: 18,
    chains: [
      {
        chainId: 8453,
        chainName: 'base',
        routerAddress: '0x9Fe693789E93319cc0F8A00FB4597Ea4fD4b08cA' as `0x${string}`,
        tokenAddress: '0x532f27101965dd16442E59d40670FaF5eBB142E4' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 543210,
        chainName: 'zeronetwork',
        routerAddress: '0xf7F253769c36CC7e1B01988CFf3aE198dea2c172' as `0x${string}`,
        tokenAddress: '0xf7F253769c36CC7e1B01988CFf3aE198dea2c172' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'Boop',
    name: 'Boop',
    decimals: 18,
    chains: [
      {
        chainId: 33139,
        chainName: 'apechain',
        routerAddress: '0x1BBBd56299717A9eAf90393157137Ca4A308d965' as `0x${string}`,
        tokenAddress: '0x1BBBd56299717A9eAf90393157137Ca4A308d965' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 42161,
        chainName: 'arbitrum',
        routerAddress: '0x1BBBd56299717A9eAf90393157137Ca4A308d965' as `0x${string}`,
        tokenAddress: '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'Fartcoin',
    name: 'Fartcoin',
    decimals: 6,
    chains: [
      {
        chainId: 33139,
        chainName: 'apechain',
        routerAddress: '0x5FC9b323013DAcF2d56046F9ff0f61c95c6A466B' as `0x${string}`,
        tokenAddress: '0x5FC9b323013DAcF2d56046F9ff0f61c95c6A466B' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'MIGGLES',
    name: 'Mister Miggles',
    decimals: 18,
    chains: [
      {
        chainId: 8453,
        chainName: 'base',
        routerAddress: '0x9C417D68dE6Acb6a9b0fBeD56767F1f3548A48a1' as `0x${string}`,
        tokenAddress: '0xB1a03EdA10342529bBF8EB700a06C60441fEf25d' as `0x${string}`,
        type: 'collateral',
      },
      {
        chainId: 543210,
        chainName: 'zeronetwork',
        routerAddress: '0xEE7bF7bB7575163edd413e36E9f06a124b51B9fa' as `0x${string}`,
        tokenAddress: '0xEE7bF7bB7575163edd413e36E9f06a124b51B9fa' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'PENGU',
    name: 'Pudgy Penguins',
    decimals: 6,
    chains: [
      {
        chainId: 33139,
        chainName: 'apechain',
        routerAddress: '0x9Eaf39A97d56119236a356225B339fE7383549B3' as `0x${string}`,
        tokenAddress: '0x9Eaf39A97d56119236a356225B339fE7383549B3' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
  {
    symbol: 'PEPE',
    name: 'Pepe',
    decimals: 18,
    chains: [
      {
        chainId: 33139,
        chainName: 'apechain',
        routerAddress: '0x46C41c67471bF859A4453512a7dc1B2431b45993' as `0x${string}`,
        tokenAddress: '0x46C41c67471bF859A4453512a7dc1B2431b45993' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 42161,
        chainName: 'arbitrum',
        routerAddress: '0x46C41c67471bF859A4453512a7dc1B2431b45993' as `0x${string}`,
        tokenAddress: '0x25d887ce7a35172c62febfd67a1856f20faebb00' as `0x${string}`,
        type: 'collateral',
      },
    ],
  },
  {
    symbol: 'TRUMP',
    name: 'OFFICIAL TRUMP',
    decimals: 18,
    chains: [
      {
        chainId: 42161,
        chainName: 'arbitrum',
        routerAddress: '0x5155EB1bcD30189915cF84717550Acfa537068bF' as `0x${string}`,
        tokenAddress: '0x5155EB1bcD30189915cF84717550Acfa537068bF' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 43114,
        chainName: 'avalanche',
        routerAddress: '0x0e2A546a53678ee8F8605748193a8c114fA0317F' as `0x${string}`,
        tokenAddress: '0x0e2A546a53678ee8F8605748193a8c114fA0317F' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 8453,
        chainName: 'base',
        routerAddress: '0x53c0499e7E4aBD3e7994ca161523FD50A12Bb8C8' as `0x${string}`,
        tokenAddress: '0x53c0499e7E4aBD3e7994ca161523FD50A12Bb8C8' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 747,
        chainName: 'flowmainnet',
        routerAddress: '0xD3378b419feae4e3A4Bb4f3349DBa43a1B511760' as `0x${string}`,
        tokenAddress: '0xD3378b419feae4e3A4Bb4f3349DBa43a1B511760' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 478,
        chainName: 'form',
        routerAddress: '0x8528bAa7d1d386E7967603e480fa2B558a23644c' as `0x${string}`,
        tokenAddress: '0x8528bAa7d1d386E7967603e480fa2B558a23644c' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 10,
        chainName: 'optimism',
        routerAddress: '0xe36c02471e708a9f16da58168da744b059a1c6fe' as `0x${string}`,
        tokenAddress: '0xe36c02471e708a9f16da58168da744b059a1c6fe' as `0x${string}`,
        type: 'synthetic',
      },
      {
        chainId: 480,
        chainName: 'worldchain',
        routerAddress: '0x0fC7b3518C03BfA5e01995285b1eF3c4B55c8922' as `0x${string}`,
        tokenAddress: '0x0fC7b3518C03BfA5e01995285b1eF3c4B55c8922' as `0x${string}`,
        type: 'synthetic',
      },
    ],
  },
]
