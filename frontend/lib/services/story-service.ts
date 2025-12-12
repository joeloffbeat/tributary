// Story Protocol API Service
// Handles all API calls to Story Protocol via our proxy route

import { STORY_API_PROXY } from '@/constants/protocols/story'
import type {
  IPAsset,
  UserCollection,
  OwnedLicenseToken,
  DisputeData,
  TransactionData,
  StoryApiResponse,
  AttachedLicense,
} from '@/lib/types/story'

// ============================================
// Request Types
// ============================================

interface PaginationParams {
  limit?: number
  offset?: number
}

interface AssetQueryParams {
  ownerAddress?: string
  ipId?: string
  tokenContract?: string
  tokenIds?: string[]
  includeLicenses?: boolean
}

interface CollectionQueryParams {
  collectionAddresses?: string[]
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

interface LicenseTokenQueryParams {
  ownerAddress?: string
  licensorIpId?: string
}

interface TransactionQueryParams {
  initiators?: string[]
  ipIds?: string[]
}

interface DisputeQueryParams {
  initiator?: string
  targetIpId?: string
}

// ============================================
// Generic API Request Handler
// ============================================

async function storyApiRequest<T>(
  endpoint: string,
  params: Record<string, unknown> = {},
  pagination: PaginationParams = { limit: 100, offset: 0 }
): Promise<StoryApiResponse<T>> {
  const response = await fetch(STORY_API_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint,
      ...params,
      pagination,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `API request failed: ${response.statusText}`)
  }

  return response.json()
}

// ============================================
// IP Assets API
// ============================================

export async function fetchUserIPAssets(
  address: string,
  options: { includeLicenses?: boolean; pagination?: PaginationParams } = {}
): Promise<IPAsset[]> {
  const { includeLicenses = true, pagination = { limit: 100, offset: 0 } } = options

  const result = await storyApiRequest<IPAsset>(
    '/assets',
    {
      where: { ownerAddress: address },
      includeLicenses,
    },
    pagination
  )

  return result.data || []
}

export async function fetchIPAssetById(ipId: string): Promise<IPAsset | null> {
  const result = await storyApiRequest<IPAsset>(
    '/assets',
    {
      where: { ipId },
      includeLicenses: true,
    },
    { limit: 1, offset: 0 }
  )

  return result.data?.[0] || null
}

export async function fetchIPAssetsWithDerivativeLicenses(
  address: string
): Promise<IPAsset[]> {
  const assets = await fetchUserIPAssets(address, { includeLicenses: true })

  // Filter to only IPAs that have licenses allowing derivatives
  return assets.filter(
    (ipa) =>
      ipa.licenses &&
      ipa.licenses.length > 0 &&
      ipa.licenses.some((l) => l.terms?.derivativesAllowed)
  )
}

// ============================================
// Collections API
// ============================================

export async function fetchUserCollections(
  collectionAddresses: string[],
  options: { orderBy?: string; orderDirection?: 'asc' | 'desc' } = {}
): Promise<UserCollection[]> {
  const { orderBy = 'assetCount', orderDirection = 'desc' } = options

  const result = await storyApiRequest<UserCollection>(
    '/collections',
    {
      where: { collectionAddresses },
      orderBy,
      orderDirection,
    },
    { limit: 50, offset: 0 }
  )

  return result.data || []
}

export async function fetchCollectionsFromAssets(
  assets: IPAsset[]
): Promise<UserCollection[]> {
  if (assets.length === 0) return []

  const collectionAddresses = [...new Set(assets.map((a) => a.tokenContract).filter(Boolean))] as string[]

  if (collectionAddresses.length === 0) return []

  return fetchUserCollections(collectionAddresses)
}

// ============================================
// License Tokens API
// ============================================

export async function fetchUserLicenseTokens(
  address: string,
  pagination: PaginationParams = { limit: 100, offset: 0 }
): Promise<OwnedLicenseToken[]> {
  const result = await storyApiRequest<OwnedLicenseToken>(
    '/licenses/tokens',
    {
      where: { ownerAddress: address },
    },
    pagination
  )

  return result.data || []
}

export async function fetchLicenseTokensByLicensorIp(
  licensorIpId: string,
  ownerAddress?: string
): Promise<OwnedLicenseToken[]> {
  const where: LicenseTokenQueryParams = { licensorIpId }
  if (ownerAddress) {
    where.ownerAddress = ownerAddress
  }

  const result = await storyApiRequest<OwnedLicenseToken>(
    '/licenses/tokens',
    { where },
    { limit: 100, offset: 0 }
  )

  return result.data || []
}

// ============================================
// Transactions API
// ============================================

export async function fetchUserTransactions(
  address: string,
  pagination: PaginationParams = { limit: 100, offset: 0 }
): Promise<TransactionData[]> {
  const result = await storyApiRequest<TransactionData>(
    '/transactions',
    {
      where: { initiators: [address] },
    },
    pagination
  )

  return result.data || []
}

// ============================================
// Disputes API
// ============================================

export async function fetchUserDisputes(address: string): Promise<DisputeData[]> {
  // Fetch disputes initiated by the user
  const result = await storyApiRequest<DisputeData>(
    '/disputes',
    {
      where: { initiator: address },
    },
    { limit: 100, offset: 0 }
  )

  return result.data || []
}

export async function fetchDisputesForIPAsset(ipId: string): Promise<DisputeData[]> {
  const result = await storyApiRequest<DisputeData>(
    '/disputes',
    {
      where: { targetIpId: ipId },
    },
    { limit: 50, offset: 0 }
  )

  return result.data || []
}

export async function fetchAllUserRelatedDisputes(
  address: string,
  userIpIds: string[]
): Promise<DisputeData[]> {
  const allDisputes: DisputeData[] = []
  const seenIds = new Set<string>()

  // Fetch disputes initiated by user
  const initiatedDisputes = await fetchUserDisputes(address)
  for (const dispute of initiatedDisputes) {
    if (!seenIds.has(dispute.id)) {
      allDisputes.push(dispute)
      seenIds.add(dispute.id)
    }
  }

  // Fetch disputes targeting user's IPs (limited to first 10)
  const ipIdsToCheck = userIpIds.slice(0, 10)
  for (const ipId of ipIdsToCheck) {
    try {
      const targetedDisputes = await fetchDisputesForIPAsset(ipId)
      for (const dispute of targetedDisputes) {
        if (!seenIds.has(dispute.id)) {
          allDisputes.push(dispute)
          seenIds.add(dispute.id)
        }
      }
    } catch {
      // Continue with other IPs if one fails
    }
  }

  return allDisputes
}

// ============================================
// IPFS Upload Service
// ============================================

export async function uploadToIPFS(
  content: Record<string, unknown>,
  name: string,
  metadata?: Record<string, unknown>
): Promise<{ url: string; ipfsHash: string }> {
  const response = await fetch('/api/ipfs/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      name,
      metadata,
      cidVersion: 0, // Story Protocol requires CIDv0 (Qm... format)
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to upload to IPFS')
  }

  return response.json()
}

export async function uploadFileToIPFS(
  file: File,
  name?: string
): Promise<{ url: string; ipfsHash: string }> {
  const formData = new FormData()
  formData.append('file', file)
  if (name) {
    formData.append('name', name)
  }

  const response = await fetch('/api/ipfs/file', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to upload file to IPFS')
  }

  return response.json()
}

// ============================================
// Helper Functions
// ============================================

export function getLicenseTypeLabel(terms: Partial<AttachedLicense['terms']> | undefined): string {
  if (!terms) return 'Unknown'

  if (!terms.commercialUse && terms.derivativesAllowed) {
    return 'Non-Commercial Social Remix'
  } else if (terms.commercialUse && !terms.derivativesAllowed) {
    return 'Commercial Use'
  } else if (terms.commercialUse && terms.derivativesAllowed) {
    const revShare = (terms.commercialRevShare || 0) / 1_000_000
    return `Commercial Remix (${revShare}%)`
  }
  return 'Custom License'
}

export function formatMintingFee(fee: bigint | string | undefined): string {
  if (!fee) return 'Free'
  const feeValue = typeof fee === 'bigint' ? fee : BigInt(fee)
  if (feeValue === 0n) return 'Free'
  return `${Number(feeValue) / 1e18} WIP`
}

export function formatRevShare(revShare: number | undefined): string {
  if (!revShare) return '0%'
  return `${revShare / 1_000_000}%`
}

export function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return 'N/A'
  try {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return timestamp
  }
}

export function getAssetDisplayName(asset: IPAsset): string {
  const name = asset.nftMetadata?.name || asset.metadata?.name || asset.name || asset.title
  const shortId = `${asset.ipId.slice(0, 6)}...${asset.ipId.slice(-4)}`
  return name ? `${name} (${shortId})` : shortId
}

export function getAssetImageUrl(asset: IPAsset): string | null {
  if (asset.nftMetadata?.image?.cachedUrl) return asset.nftMetadata.image.cachedUrl
  if (asset.nftMetadata?.image?.thumbnailUrl) return asset.nftMetadata.image.thumbnailUrl
  if (asset.nftMetadata?.image?.originalUrl) return asset.nftMetadata.image.originalUrl
  if (asset.metadata?.image) return asset.metadata.image
  return null
}
