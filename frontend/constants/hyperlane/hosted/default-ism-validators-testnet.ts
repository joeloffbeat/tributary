// =============================================================================
// Hyperlane Hosted - Default ISM Validators (Testnet)
// =============================================================================
// Source: https://docs.hyperlane.xyz/docs/reference/default-ism-validators
// Last updated: 2025-01-12
// Note: Only EVM chains included (Solana, Starknet, Cosmos, SVM chains excluded)
// =============================================================================

import type { Address } from 'viem'

/**
 * Default ISM validator addresses for official Hyperlane deployments (Testnet)
 * Key: chainId, Value: Array of validator addresses
 *
 * These are the validators used in the default Interchain Security Module (ISM)
 * for each chain. Messages are considered valid when threshold signatures are met.
 */
export const HOSTED_DEFAULT_ISM_VALIDATORS_TESTNET: Record<number, Address[]> = {
  // =============================================================================
  // TESTNETS (EVM ONLY)
  // =============================================================================

  // Arbitrum Sepolia (421614) - Threshold: 1 of 1
  421614: [
    '0x09fabfbca0b8bf042e2a1161ee5010d147b0f603', // Abacus Works
  ],

  // Arcadia Testnet v2 (1098411886) - Threshold: 1 of 1
  1098411886: [
    '0xd39cd388ce3f616bc81be6dd3ec9348d7cdf4dff', // Abacus Works
  ],

  // Aurora Testnet (1313161555) - Threshold: 1 of 1
  1313161555: [
    '0xab1a2c76bf4cced43fde7bc1b5b57b9be3e7f937', // Abacus Works
  ],

  // Basecamp Testnet (1000001114) - Threshold: 1 of 1
  // Note: Using domainId as key
  1000001114: [
    '0x84441e39ed5251410aa2baa72e7747c46d1e5e9d', // Abacus Works
  ],

  // Base Sepolia (84532) - Threshold: 1 of 1
  84532: [
    '0x82e3b437a2944e3ff00258c93e72cd1ba5e0e921', // Abacus Works
  ],

  // BSC Testnet (97) - Threshold: 2 of 3
  97: [
    '0x242d8a855a8c932dec51f7999ae7d1e48b10c95e', // Abacus Works
    '0xf620f5e3d25a3ae848fec74bccae5de3edcd8796', // Abacus Works
    '0x1f030345963c54ff8229720dd3a711c15c554aeb', // Abacus Works
  ],

  // CarrChain Testnet (76672) - Threshold: 1 of 1
  76672: [
    '0xa96dfc4d8c6cabb510701732ee01e52a75776205', // Abacus Works
  ],

  // Celo Sepolia (11142220) - Threshold: 1 of 1
  11142220: [
    '0x4a5cfcfd7f793f4ceba170c3decbe43bd8253ef6', // Abacus Works
  ],

  // Citrea Testnet (5115) - Threshold: 1 of 1
  5115: [
    '0x60d7380a41eb95c49be18f141efd2fde5e3dba20', // Abacus Works
  ],

  // Coti Testnet (7082400) - Threshold: 1 of 1
  7082400: [
    '0x5c535dff16237a2cae97c97f9556404cd230c9c0', // Abacus Works
  ],

  // Fuji (43113) - Threshold: 2 of 3
  43113: [
    '0xd8154f73d04cc7f7f0c332793692e6e6f6b2402e', // Abacus Works
    '0x895ae30bc83ff1493b9cf7781b0b813d23659857', // Abacus Works
    '0x43e915573d9f1383cbf482049e4a012290759e7f', // Abacus Works
  ],

  // GIWA Sepolia (91342) - Threshold: 1 of 1
  91342: [
    '0xc170bef56759e35740ac2d3d0fece33bd9acb90b', // Abacus Works
  ],

  // Hyperliquid EVM Testnet (998) - Threshold: 1 of 1
  998: [
    '0xea673a92a23ca319b9d85cc16b248645cd5158da', // Abacus Works
  ],

  // Incentiv Testnet v2 (28802) - Threshold: 1 of 1
  28802: [
    '0x3133eeb96fd96f9f99291088613edf7401149e6f', // Abacus Works
  ],

  // MegaETH Testnet (6342) - Threshold: 1 of 1
  6342: [
    '0xf5c8a82f966d2ec8563a2012ccf556ee3f4b25ef', // Abacus Works
  ],

  // Mode Testnet (919) - Threshold: 1 of 1
  919: [
    '0x9a9de3e406ab3e4ff12aa03ca9b868b48dc40402', // Abacus Works
  ],

  // Monad Testnet (10143) - Threshold: 1 of 1
  10143: [
    '0x734628f55694d2a5f4de3e755ccb40ecd72b16d9', // Abacus Works
  ],

  // Neura Testnet (267) - Threshold: 1 of 1
  267: [
    '0xc14514a91d0ee90ba3070abb6bfb45a10e6d341d', // Abacus Works
  ],

  // Optimism Sepolia (11155420) - Threshold: 1 of 1
  11155420: [
    '0x03efe4d0632ee15685d7e8f46dea0a874304aa29', // Abacus Works
  ],

  // Polygon Amoy (80002) - Threshold: 1 of 1
  80002: [
    '0xf0290b06e446b320bd4e9c4a519420354d7ddccd', // Abacus Works
  ],

  // Scroll Sepolia (534351) - Threshold: 2 of 3
  534351: [
    '0xbe18dbd758afb367180260b524e6d4bcd1cb6d05', // Abacus Works
    '0x9a11ed23ae962974018ab45bc133caabff7b3271', // Abacus Works
    '0x7867bea3c9761fe64e6d124b171f91fd5dd79644', // Abacus Works
  ],

  // Sepolia (11155111) - Threshold: 2 of 3
  11155111: [
    '0xb22b65f202558adf86a8bb2847b76ae1036686a5', // Abacus Works
    '0x469f0940684d147defc44f3647146cb90dd0bc8e', // Abacus Works
    '0xd3c75dcf15056012a4d74c483a0c6ea11d8c2b83', // Abacus Works
  ],

  // Somnia Testnet (50312) - Threshold: 1 of 1
  50312: [
    '0xb3b27a27bfa94002d344e9cf5217a0e3502e018b', // Abacus Works
  ],

  // Subtensor Testnet (945) - Threshold: 1 of 1
  945: [
    '0xbe2cd57e9fd46b12107cfec7a2db61aa23edbe33', // Abacus Works
  ],
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a chain has hosted default ISM validators (testnet)
 */
export const hasHostedDefaultIsmValidatorsTestnet = (chainId: number): boolean =>
  chainId in HOSTED_DEFAULT_ISM_VALIDATORS_TESTNET

/**
 * Get default ISM validators for a chain (testnet)
 */
export const getHostedDefaultIsmValidatorsTestnet = (
  chainId: number
): Address[] | undefined => HOSTED_DEFAULT_ISM_VALIDATORS_TESTNET[chainId]

/**
 * Get all chain IDs with default ISM validators (testnet)
 */
export const getHostedDefaultIsmValidatorsTestnetChainIds = (): number[] =>
  Object.keys(HOSTED_DEFAULT_ISM_VALIDATORS_TESTNET).map(Number)

/**
 * Count of supported chains with default ISM validators (testnet)
 */
export const HOSTED_DEFAULT_ISM_VALIDATORS_TESTNET_COUNT = Object.keys(
  HOSTED_DEFAULT_ISM_VALIDATORS_TESTNET
).length
