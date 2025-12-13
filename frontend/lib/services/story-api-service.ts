// Story Protocol Direct API Service
// Fetches IP asset details, license terms, and license tokens from Story Protocol API

import { STORY_API_BASE } from '@/constants/protocols/story'
import type { Address } from 'viem'

// ============================================
// Types
// ============================================

export interface StoryIPAsset {
  ipId: string
  chainId: string
  tokenContract: string
  tokenId: string
  ownerAddress: string
  name?: string
  uri?: string
  registrationDate?: string
  metadata?: {
    name?: string
    description?: string
    image?: string
    hash?: string
  }
  nftMetadata?: {
    name?: string
    description?: string
    image?: {
      cachedUrl?: string
      thumbnailUrl?: string
      originalUrl?: string
    }
    tokenUri?: string
  }
}

export interface StoryLicenseTerms {
  id: string
  licenseTermsId: string
  licenseTemplate: string
  transferable: boolean
  commercialUse: boolean
  commercialAttribution: boolean
  commercialRevShare: number
  derivativesAllowed: boolean
  derivativesAttribution: boolean
  derivativesApproval: boolean
  derivativesReciprocal: boolean
  defaultMintingFee: string
  expiration: string
  currency: string
  uri?: string
}

export interface StoryLicenseToken {
  tokenId: string
  licensorIpId: string
  licenseTermsId: string
  ownerAddress: string
  transferable: boolean
  expiresAt?: string
  mintedAt?: string
  blockNumber?: string
  blockTimestamp?: string
}

export interface StoryAPIResponse<T> {
  data: T[]
  pagination?: {
    limit: number
    offset: number
    total?: number
  }
}

// ============================================
// API Request Handler
// ============================================

async function storyAPIFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${STORY_API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Story API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ============================================
// IP Asset Functions
// ============================================

/**
 * Get full IP asset details by IP ID
 */
export async function getIPAsset(ipId: string): Promise<StoryIPAsset | null> {
  try {
    const result = await storyAPIFetch<StoryAPIResponse<StoryIPAsset>>(
      `/api/v1/assets?ipId=${ipId}`
    )
    return result.data?.[0] || null
  } catch (error) {
    console.error('Failed to fetch IP asset:', error)
    return null
  }
}

/**
 * Get multiple IP assets by IP IDs
 */
export async function getIPAssets(ipIds: string[]): Promise<StoryIPAsset[]> {
  try {
    const results = await Promise.all(ipIds.map(getIPAsset))
    return results.filter((asset): asset is StoryIPAsset => asset !== null)
  } catch (error) {
    console.error('Failed to fetch IP assets:', error)
    return []
  }
}

// ============================================
// License Functions
// ============================================

/**
 * Get license terms attached to an IP asset
 */
export async function getLicenseTerms(ipId: string): Promise<StoryLicenseTerms[]> {
  try {
    const result = await storyAPIFetch<StoryAPIResponse<StoryLicenseTerms>>(
      `/api/v1/licenses/ip/${ipId}/terms`
    )
    return result.data || []
  } catch (error) {
    console.error('Failed to fetch license terms:', error)
    return []
  }
}

/**
 * Get license tokens for an IP asset (minted licenses)
 */
export async function getLicenseTokens(ipId: string): Promise<StoryLicenseToken[]> {
  try {
    const result = await storyAPIFetch<StoryAPIResponse<StoryLicenseToken>>(
      `/api/v1/licenses/tokens?licensorIpId=${ipId}`
    )
    return result.data || []
  } catch (error) {
    console.error('Failed to fetch license tokens:', error)
    return []
  }
}

/**
 * Get license tokens owned by an address
 */
export async function getOwnedLicenseTokens(
  ownerAddress: string
): Promise<StoryLicenseToken[]> {
  try {
    const result = await storyAPIFetch<StoryAPIResponse<StoryLicenseToken>>(
      `/api/v1/licenses/tokens?ownerAddress=${ownerAddress}`
    )
    return result.data || []
  } catch (error) {
    console.error('Failed to fetch owned license tokens:', error)
    return []
  }
}

// ============================================
// Enrichment Functions
// ============================================

export interface EnrichedIPAsset {
  ipAsset: StoryIPAsset | null
  licenseTerms: StoryLicenseTerms[]
  licenseTokens: StoryLicenseToken[]
}

/**
 * Get enriched IP asset data including license terms and tokens
 */
export async function getEnrichedIPAsset(ipId: string): Promise<EnrichedIPAsset> {
  const [ipAsset, licenseTerms, licenseTokens] = await Promise.all([
    getIPAsset(ipId),
    getLicenseTerms(ipId),
    getLicenseTokens(ipId),
  ])

  return {
    ipAsset,
    licenseTerms,
    licenseTokens,
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get display name for an IP asset
 */
export function getIPAssetDisplayName(asset: StoryIPAsset | null): string {
  if (!asset) return 'Unknown IP Asset'
  return (
    asset.nftMetadata?.name ||
    asset.metadata?.name ||
    asset.name ||
    `IP ${asset.ipId.slice(0, 6)}...${asset.ipId.slice(-4)}`
  )
}

/**
 * Get image URL for an IP asset
 */
export function getIPAssetImageUrl(asset: StoryIPAsset | null): string | null {
  if (!asset) return null
  return (
    asset.nftMetadata?.image?.cachedUrl ||
    asset.nftMetadata?.image?.thumbnailUrl ||
    asset.nftMetadata?.image?.originalUrl ||
    asset.metadata?.image ||
    null
  )
}

/**
 * Get license type label from terms
 */
export function getLicenseTypeFromTerms(terms: StoryLicenseTerms): string {
  if (!terms.commercialUse && terms.derivativesAllowed) {
    return 'Non-Commercial Social Remix'
  } else if (terms.commercialUse && !terms.derivativesAllowed) {
    return 'Commercial Use'
  } else if (terms.commercialUse && terms.derivativesAllowed) {
    const revShare = terms.commercialRevShare / 1_000_000
    return `Commercial Remix (${revShare}% rev share)`
  }
  return 'Custom License'
}

/**
 * Format minting fee from terms
 */
export function formatMintingFeeFromTerms(terms: StoryLicenseTerms): string {
  if (!terms.defaultMintingFee || terms.defaultMintingFee === '0') {
    return 'Free'
  }
  const fee = BigInt(terms.defaultMintingFee)
  const formatted = Number(fee) / 1e18
  return `${formatted.toFixed(2)} WIP`
}

/**
 * Convert WIP minting fee to estimated USDC
 * Uses a fixed conversion rate: 1 WIP = 0.1 USDC
 */
export function wipToUsdcEstimate(wipAmount: bigint | string): bigint {
  const wip = typeof wipAmount === 'string' ? BigInt(wipAmount) : wipAmount
  // 1 WIP (18 decimals) = 0.1 USDC (6 decimals)
  // So divide by 10 and adjust decimals (18 to 6 = divide by 10^12)
  return (wip / 10n) / 10n ** 12n
}

/**
 * Get floor price from license token listings
 * Returns the lowest listed price in USDC
 */
export function getFloorPrice(
  listings: Array<{ priceUSDC: bigint | string }>
): bigint | null {
  if (listings.length === 0) return null

  const prices = listings.map((l) =>
    typeof l.priceUSDC === 'string' ? BigInt(l.priceUSDC) : l.priceUSDC
  )

  return prices.reduce((min, p) => (p < min ? p : min), prices[0])
}
