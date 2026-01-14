// Story Protocol API Service (via Next.js proxy)
// Fetches IP assets with licenses from Story Protocol API v4

import { STORY_API_PROXY } from '@/constants/protocols/story'

// ============================================
// Types (Story API v4 response format)
// ============================================

export interface StoryLicenseTerms {
  commercialAttribution: boolean
  commercialRevCeiling: string
  commercialRevShare: number
  commercialUse: boolean
  commercializerChecker: string
  commercializerCheckerData: string
  currency: string
  defaultMintingFee: string
  derivativeRevCeiling: string
  derivativesAllowed: boolean
  derivativesApproval: boolean
  derivativesAttribution: boolean
  derivativesReciprocal: boolean
  expiration: string
  royaltyPolicy: string
  transferable: boolean
  uri: string
}

export interface StoryLicensingConfig {
  commercialRevShare: number
  disabled: boolean
  expectGroupRewardPool: string
  expectMinimumGroupRewardShare: number
  hookData: string
  isSet: boolean
  licensingHook: string
  mintingFee: string
}

export interface StoryLicense {
  createdAt: string
  licenseTemplateId: string
  licenseTermsId: string
  licensingConfig: StoryLicensingConfig
  templateMetadataUri: string
  templateName: string
  terms: StoryLicenseTerms
  updatedAt: string
}

export interface StoryNftImage {
  cachedUrl?: string
  contentType?: string
  originalUrl?: string
  pngUrl?: string
  size?: number
  thumbnailUrl?: string
}

export interface StoryNftMetadata {
  name?: string
  description?: string
  image?: StoryNftImage
  tokenUri?: string
  tokenId?: string
  tokenType?: string
  contract_address?: string
  nft_id?: string
  timeLastUpdated?: string
  contract?: {
    address?: string
    chain?: string
    name?: string
    symbol?: string
    tokenType?: string
    totalSupply?: string
  }
  collection?: {
    name?: string
    slug?: string
  }
}

export interface StoryIPAsset {
  ipId: string
  chainId: string
  tokenContract: string
  tokenId: string
  ownerAddress: string
  name?: string
  title?: string
  description?: string
  uri?: string
  registrationDate?: string
  createdAt?: string
  lastUpdatedAt?: string
  blockNumber?: number
  txHash?: string
  ancestorsCount?: number
  descendantsCount?: number
  parentsCount?: number
  childrenCount?: number
  isInGroup?: boolean
  rootIPs?: string[]
  ipaMetadataUri?: string
  nftMetadata?: StoryNftMetadata
  licenses?: StoryLicense[]
  moderationStatus?: {
    adult?: string
    medical?: string
    racy?: string
    spoof?: string
    violence?: string
  }
  infringementStatus?: Array<{
    isInfringing?: boolean
    providerName?: string
    status?: string
  }>
}

export interface StoryAPIResponse {
  data: StoryIPAsset[]
  pagination?: {
    hasMore: boolean
    limit: number
    offset: number
    total: number
  }
}

// ============================================
// API Request Handler (via Next.js proxy)
// ============================================

async function storyAPIFetch<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(STORY_API_PROXY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      ...body,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `Story API error: ${response.status}`)
  }

  return response.json()
}

// ============================================
// IP Asset Functions
// ============================================

export interface FetchIPAssetsOptions {
  ownerAddress?: string
  ipIds?: string[]
  tokenContract?: string
  limit?: number
  offset?: number
  orderBy?: 'blockNumber' | 'createdAt'
  orderDirection?: 'asc' | 'desc'
}

/**
 * Fetch IP assets with licenses from Story API v4
 * This is the main function to get all IP asset data in one call
 */
export async function fetchIPAssets(options: FetchIPAssetsOptions = {}): Promise<StoryAPIResponse> {
  const {
    ownerAddress,
    ipIds,
    tokenContract,
    limit = 50,
    offset = 0,
    orderBy = 'blockNumber',
    orderDirection = 'desc',
  } = options

  const where: Record<string, unknown> = {}
  if (ownerAddress) where.ownerAddress = ownerAddress
  if (ipIds && ipIds.length > 0) where.ipIds = ipIds
  if (tokenContract) where.tokenContract = tokenContract

  const result = await storyAPIFetch<StoryAPIResponse>('/assets', {
    includeLicenses: true,
    orderBy,
    orderDirection,
    pagination: { limit, offset },
    where: Object.keys(where).length > 0 ? where : undefined,
  })

  return result
}

/**
 * Fetch IP assets owned by an address
 */
export async function fetchIPAssetsByOwner(ownerAddress: string): Promise<StoryIPAsset[]> {
  const result = await fetchIPAssets({ ownerAddress })
  return result.data || []
}

/**
 * Fetch a single IP asset by ID (from cached data or API)
 */
export async function fetchIPAssetById(ipId: string): Promise<StoryIPAsset | null> {
  const result = await fetchIPAssets({ ipIds: [ipId] })
  return result.data?.[0] || null
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
    asset.name ||
    asset.title ||
    `IP ${asset.ipId.slice(0, 6)}...${asset.ipId.slice(-4)}`
  )
}

/**
 * Get image URL for an IP asset
 */
export function getIPAssetImageUrl(asset: StoryIPAsset | null): string | null {
  if (!asset) return null
  const img = asset.nftMetadata?.image
  if (!img) return null
  return img.cachedUrl || img.thumbnailUrl || img.pngUrl || img.originalUrl || null
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
 * Get license type from a StoryLicense object
 */
export function getLicenseType(license: StoryLicense): string {
  return getLicenseTypeFromTerms(license.terms)
}

/**
 * Format minting fee from a StoryLicense object
 */
export function formatMintingFee(license: StoryLicense): string {
  // Use licensing config minting fee if set, otherwise use terms default
  const fee = license.licensingConfig?.mintingFee || license.terms.defaultMintingFee
  if (!fee || fee === '0') {
    return 'Free'
  }
  const formatted = Number(BigInt(fee)) / 1e18
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
