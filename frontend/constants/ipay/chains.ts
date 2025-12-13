// =============================================================================
// iPay Supported Chains Configuration
// =============================================================================
// Multi-chain payment support for x402 payments via Hyperlane
// Source chains: Avalanche Fuji, ETH Sepolia, Polygon Amoy
// Destination chain: Story Aeneid (1315)
// =============================================================================

import type { Address } from 'viem'
import { SELF_HOSTED_DEPLOYMENTS } from '../hyperlane/self-hosted'
import type { IPayChainConfig } from './types'

/**
 * Supported source chains for iPay x402 payments
 * USDC addresses are Circle's official testnet deployments
 */
export const IPAY_SUPPORTED_CHAINS: Record<number, IPayChainConfig> = {
  // Avalanche Fuji Testnet
  43113: {
    chainId: 43113,
    chainName: 'fuji',
    displayName: 'Avalanche Fuji',
    icon: '/chains/avalanche.svg',
    usdc: '0x5425890298aed601595a70AB815c96711a31Bc65' as Address,
    mailbox: SELF_HOSTED_DEPLOYMENTS[43113].mailbox,
    domainId: 43113,
    explorerUrl: 'https://testnet.snowtrace.io',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    isTestnet: true,
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
  },

  // ETH Sepolia Testnet
  11155111: {
    chainId: 11155111,
    chainName: 'sepolia',
    displayName: 'Sepolia',
    icon: '/chains/ethereum.svg',
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as Address,
    mailbox: SELF_HOSTED_DEPLOYMENTS[11155111].mailbox,
    domainId: 11155111,
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://rpc.sepolia.org',
    isTestnet: true,
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },

  // Polygon Amoy Testnet
  80002: {
    chainId: 80002,
    chainName: 'amoy',
    displayName: 'Polygon Amoy',
    icon: '/chains/polygon.svg',
    usdc: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582' as Address,
    mailbox: SELF_HOSTED_DEPLOYMENTS[80002].mailbox,
    domainId: 80002,
    explorerUrl: 'https://amoy.polygonscan.com',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    isTestnet: true,
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18,
    },
  },
}

/**
 * Get chain configuration by chainId
 */
export function getIPayChainConfig(chainId: number): IPayChainConfig | undefined {
  return IPAY_SUPPORTED_CHAINS[chainId]
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(IPAY_SUPPORTED_CHAINS).map(Number)
}

/**
 * Check if a chain is supported for iPay payments
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in IPAY_SUPPORTED_CHAINS
}

/**
 * Get USDC address for a chain
 */
export function getUsdcAddress(chainId: number): Address | undefined {
  return IPAY_SUPPORTED_CHAINS[chainId]?.usdc
}

/**
 * Get mailbox address for a chain
 */
export function getMailboxAddress(chainId: number): Address | undefined {
  return IPAY_SUPPORTED_CHAINS[chainId]?.mailbox
}

/**
 * Get all supported chains as array
 */
export function getAllSupportedChains(): IPayChainConfig[] {
  return Object.values(IPAY_SUPPORTED_CHAINS)
}
