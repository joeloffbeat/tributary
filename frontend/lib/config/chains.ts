import { mantleSepoliaTestnet } from 'viem/chains'
import { defineChain, type Chain } from 'viem'

// =============================================================================
// Custom Chain Definitions
// =============================================================================

// Story Aeneid Testnet - using defineChain for proper Privy compatibility
const storyAeneid = defineChain({
  id: 1315,
  name: 'Story Aeneid Testnet',
  network: 'story-aeneid',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://aeneid.storyrpc.io'] },
  },
  blockExplorers: {
    default: { name: 'Story Explorer', url: 'https://aeneid.explorer.story.foundation' },
  },
  testnet: true,
})

// =============================================================================
// Chain Configuration Type
// =============================================================================

export interface ChainConfig {
  chain: Chain
  name: string
  shortName: string
  rpcUrl: string
  explorerUrl: string
  iconUrl: string
  isTestnet: boolean
}

// =============================================================================
// Icon Helper
// =============================================================================

function getIconUrl(name: string): string {
  return `https://icons.llamao.fi/icons/chains/rsz_${name}.jpg`
}

// =============================================================================
// Supported Chains (Only Mantle Sepolia and Story Aeneid)
// =============================================================================

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  'mantle-sepolia': {
    chain: mantleSepoliaTestnet,
    name: 'Mantle Sepolia',
    shortName: 'MNT-SEP',
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    explorerUrl: 'https://explorer.sepolia.mantle.xyz',
    iconUrl: '/mantle.png',
    isTestnet: true,
  },
  'story-aeneid': {
    chain: storyAeneid,
    name: 'Story Aeneid',
    shortName: 'STORY',
    rpcUrl: 'https://aeneid.storyrpc.io',
    explorerUrl: 'https://aeneid.explorer.story.foundation',
    iconUrl: '/story.png',
    isTestnet: true,
  },
}

// =============================================================================
// Chain Getters
// =============================================================================

export function getSupportedChainList(): ChainConfig[] {
  return Object.values(SUPPORTED_CHAINS)
}

export function getSupportedViemChains(): Chain[] {
  return getSupportedChainList().map((c) => c.chain)
}

export function getSupportedChainIds(): number[] {
  return getSupportedChainList().map((c) => c.chain.id)
}

export function getChainById(chainId: number): ChainConfig | undefined {
  return getSupportedChainList().find((c) => c.chain.id === chainId)
}

export function getChainByName(name: string): ChainConfig | undefined {
  return SUPPORTED_CHAINS[name.toLowerCase()]
}

export function isChainSupported(chainId: number): boolean {
  return getSupportedChainIds().includes(chainId)
}

export function getChainTransports(): Record<number, string> {
  const chains = getSupportedChainList()
  const transports: Record<number, string> = {}

  for (const chain of chains) {
    transports[chain.chain.id] = chain.rpcUrl
  }

  return transports
}

export function getDefaultChain(): ChainConfig {
  // Default to Mantle Sepolia (primary chain for contracts)
  return SUPPORTED_CHAINS['mantle-sepolia']
}

// =============================================================================
// Convenience Exports
// =============================================================================

export const SUPPORTED_CHAIN_LIST = getSupportedChainList()
export const SUPPORTED_VIEM_CHAINS = getSupportedViemChains()
export const SUPPORTED_CHAIN_IDS = getSupportedChainIds()

// Chain IDs for easy reference
export const MANTLE_SEPOLIA_CHAIN_ID = 5003
export const STORY_AENEID_CHAIN_ID = 1315

// =============================================================================
// Additional Utility Functions
// =============================================================================

export function getChainName(chainId: number): string {
  const chain = getChainById(chainId)
  return chain?.name ?? `Chain ${chainId}`
}

export function getExplorerUrl(chainId: number): string {
  const chain = getChainById(chainId)
  return chain?.explorerUrl ?? ''
}

export function getExplorerLink(chainId: number, hash: string, type: 'tx' | 'address' = 'tx'): string {
  const explorerUrl = getExplorerUrl(chainId)
  if (!explorerUrl) return ''
  return `${explorerUrl}/${type}/${hash}`
}

export function isTestnet(chainId: number): boolean {
  const chain = getChainById(chainId)
  return chain?.isTestnet ?? true
}

export function getChainIcon(chainId: number): string {
  const chain = getChainById(chainId)
  return chain?.iconUrl ?? ''
}
