// =============================================================================
// Tributary Chain Configuration
// =============================================================================
// Mantle Sepolia configuration for Tributary marketplace
// =============================================================================

import { defineChain, type Address } from 'viem'

/**
 * Mantle Sepolia chain definition
 * Chain ID: 5003
 */
export const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Sepolia Explorer',
      url: 'https://sepolia.mantlescan.xyz',
    },
  },
  testnet: true,
})

/**
 * Tributary contract addresses per chain
 * Deployed contracts from contracts/deployments/mantle-sepolia.json
 */
export const TRIBUTARY_CONTRACTS = {
  [mantleSepolia.id]: {
    factory: '0x1D00e9fEC4748e07E178FaF1778c4B95E74CDA30' as Address,
    marketplace: '0x8e25b6a75907F8DDf28e15558759802d7922A898' as Address,
    amm: '0xee4c62bb881cF0364333D5754Ef0551a39BA4426' as Address,
    mockUsdt: '0x5a8Ba59Fcc42Cb80f4c655C60F8a2684543FB3A2' as Address,
    treasury: '0x32FE11d9900D63350016374BE98ff37c3Af75847' as Address,
  },
} as const

/**
 * Supported chains for Tributary
 */
export const SUPPORTED_CHAINS = [mantleSepolia] as const

/**
 * Get chain by ID
 */
export function getTributaryChain(chainId: number) {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId)
}

/**
 * Get contract addresses for a chain
 */
export function getTributaryContracts(chainId: number) {
  return TRIBUTARY_CONTRACTS[chainId as keyof typeof TRIBUTARY_CONTRACTS]
}

/**
 * Check if chain is supported by Tributary
 */
export function isTributaryChainSupported(chainId: number): boolean {
  return chainId in TRIBUTARY_CONTRACTS
}
