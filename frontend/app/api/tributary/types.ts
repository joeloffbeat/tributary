import type { Address } from 'viem'

// Fee constants (basis points)
export const PLATFORM_FEE_BPS = 250n // 2.5%
export const CREATOR_FEE_BPS = 500n // 5%
export const BPS_BASE = 10000n

// =============================================================================
// Price Types
// =============================================================================

export interface TokenPrice {
  token: Address
  floorPrice: string
  lastSalePrice: string
  avgPrice24h: string
  priceChange24h: number
  priceChange7d: number
  volume24h: string
  volumeChange24h: number
  totalListings: number
  lastUpdated: number
}

export interface PriceHistoryPoint {
  timestamp: number
  open: string
  high: string
  low: string
  close: string
  volume: string
}

// =============================================================================
// Quote Types
// =============================================================================

export interface BuyQuoteRequest {
  tokenAddress: Address
  amount: string
  buyer: Address
  maxSlippage?: number
}

export interface BuyQuote {
  canFill: boolean
  availableAmount?: string
  token: Address
  amount: string
  avgPrice: string
  totalCost: string
  platformFee: string
  creatorFee: string
  totalWithFees: string
  priceImpact: number
  listingsToFill: ListingFill[]
  expiresAt: number
}

export interface ListingFill {
  listingId: string
  seller: Address
  price: string
  amount: string
  subtotal: string
}

export interface SellQuoteRequest {
  tokenAddress: Address
  amount: string
  seller: Address
  listingPrice?: string
}

export interface SellQuote {
  token: Address
  amount: string
  suggestedPrice: string
  floorPrice: string
  proceeds: string
  platformFee: string
  creatorFee: string
  netProceeds: string
  expiresAt: number
}

// =============================================================================
// Period Types
// =============================================================================

export type Period = '1d' | '7d' | '30d' | '90d'
export type Resolution = 'hourly' | 'daily'

export const PERIOD_SECONDS: Record<Period, number> = {
  '1d': 86400,
  '7d': 604800,
  '30d': 2592000,
  '90d': 7776000,
}

// =============================================================================
// Metadata Types
// =============================================================================

export interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  description?: string
  image?: string
  external_url?: string
  attributes?: Array<{ trait_type: string; value: string | number }>
  vault?: Address
  storyIPId?: Address
  creator?: Address
}

export interface VaultMetadata {
  vault: Address
  tokenAddress: Address
  creator: Address
  createdAt: number
  tokenName: string
  tokenSymbol: string
  totalSupply: string
  circulatingSupply: string
  storyIPId: Address
  ipMetadata: { name: string; description: string; image: string; mediaUrl?: string }
  config: { creatorAllocation: number; salePrice: string }
  state: { phase: 'presale' | 'sale' | 'trading' | 'ended'; tokensRemaining: string; totalDistributed: string; holderCount: number }
}

export interface IPMetadata {
  ipId: Address
  name: string
  description: string
  image: string
  mediaUrl?: string
  mediaType?: string
  registrationDate: number
  licenseTerms?: { commercialUse: boolean; commercialRevenue: number; derivativesAllowed: boolean }
  creator: Address
  creatorName?: string
  externalUrl?: string
  category?: string
  tags?: string[]
}

export interface VaultSearchResult {
  vault: Address
  tokenAddress: Address
  tokenName: string
  tokenSymbol: string
  creator: Address
  storyIPId: Address
  image: string
  category?: string
  floorPrice: string
  volume24h: string
  holderCount: number
  currentYield: number
}

export const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
]

export function resolveIPFSUri(uri: string): string {
  if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`
  return uri
}
