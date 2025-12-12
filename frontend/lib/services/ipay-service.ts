// IPay Subgraph Service
// Handles all queries to the IPay subgraph for marketplace data

import type { Address } from 'viem'
import type {
  IPListing,
  UsageReceipt,
  CreatorAnalytics,
  MarketplaceFilters,
  IPCategory,
} from '@/app/ipay/types'
import { getSubgraphEndpoint } from '@/constants/subgraphs'

// Get IPay subgraph endpoint from constants (Avalanche Fuji = 43113)
const IPAY_SUBGRAPH_URL = getSubgraphEndpoint(43113, 'ipay')

// Subgraph response types
interface SubgraphListing {
  id: string
  storyIPId: string
  creator: { id: string }
  pricePerUse: string
  metadataUri: string
  assetIpfsHash: string
  totalUses: string
  totalRevenue: string
  active: boolean
  createdAt: string
}

interface SubgraphUsage {
  id: string
  listing: { id: string }
  user: { id: string }
  amount: string
  timestamp: string
  txHash: string
}

interface SubgraphCreator {
  id: string
  totalListings: string
  totalRevenue: string
  totalUses: string
  listings: SubgraphListing[]
}

// GraphQL listing fields fragment
const LISTING_FIELDS = `
  id
  storyIPId
  creator { id }
  pricePerUse
  metadataUri
  assetIpfsHash
  totalUses
  totalRevenue
  active
  createdAt
`

// GraphQL query helper
async function querySubgraph<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(IPAY_SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Subgraph query failed: ${response.statusText}`)
  }

  const result = await response.json()
  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Subgraph query error')
  }
  return result.data
}

// Convert subgraph listing to IPListing type
function mapListing(listing: SubgraphListing): IPListing {
  return {
    id: listing.id,
    storyIPId: listing.storyIPId as Address,
    creator: listing.creator.id as Address,
    title: `Listing #${listing.id}`, // Fetched from metadata URI in frontend
    description: '',
    imageUrl: '',
    category: 'other' as IPCategory, // Parsed from metadata in frontend
    pricePerUse: BigInt(listing.pricePerUse),
    assetIpfsHash: listing.assetIpfsHash,
    metadataUri: listing.metadataUri,
    totalUses: parseInt(listing.totalUses),
    totalRevenue: BigInt(listing.totalRevenue),
    isActive: listing.active,
    createdAt: parseInt(listing.createdAt),
  }
}

// Convert subgraph usage to UsageReceipt
function mapUsage(usage: SubgraphUsage): UsageReceipt {
  return {
    id: usage.id,
    listingId: usage.listing.id,
    user: usage.user.id as Address,
    amount: BigInt(usage.amount),
    paymentTxHash: usage.txHash,
    timestamp: parseInt(usage.timestamp),
  }
}

// Build order string from sort option
function getOrderBy(sortBy?: MarketplaceFilters['sortBy']): string {
  const orders: Record<string, string> = {
    newest: 'orderBy: createdAt, orderDirection: desc',
    popular: 'orderBy: totalUses, orderDirection: desc',
    price_low: 'orderBy: pricePerUse, orderDirection: asc',
    price_high: 'orderBy: pricePerUse, orderDirection: desc',
  }
  return orders[sortBy || 'newest'] || orders.newest
}

class IPayService {
  /** Get listings with optional filters */
  async getListings(filters: MarketplaceFilters = {}): Promise<IPListing[]> {
    const conditions: string[] = []

    if (filters.isActive !== undefined) conditions.push(`active: ${filters.isActive}`)
    if (filters.creator) conditions.push(`creator: "${filters.creator.toLowerCase()}"`)
    if (filters.minPrice) {
      conditions.push(`pricePerUse_gte: "${BigInt(parseFloat(filters.minPrice) * 1e6)}"`)
    }
    if (filters.maxPrice) {
      conditions.push(`pricePerUse_lte: "${BigInt(parseFloat(filters.maxPrice) * 1e6)}"`)
    }

    const whereClause = conditions.length > 0 ? `where: { ${conditions.join(', ')} },` : ''
    const query = `
      query GetListings {
        listings(first: 100, ${whereClause} ${getOrderBy(filters.sortBy)}) {
          ${LISTING_FIELDS}
        }
      }
    `
    const data = await querySubgraph<{ listings: SubgraphListing[] }>(query)
    return data.listings.map(mapListing)
  }

  /** Get a single listing by ID */
  async getListingById(id: string): Promise<IPListing | null> {
    const query = `
      query GetListing($id: ID!) {
        listing(id: $id) { ${LISTING_FIELDS} }
      }
    `
    const data = await querySubgraph<{ listing: SubgraphListing | null }>(query, { id })
    return data.listing ? mapListing(data.listing) : null
  }

  /** Get all listings by a specific creator */
  async getListingsByCreator(address: Address): Promise<IPListing[]> {
    const query = `
      query GetListingsByCreator($creator: Bytes!) {
        listings(where: { creator: $creator }, orderBy: createdAt, orderDirection: desc) {
          ${LISTING_FIELDS}
        }
      }
    `
    const data = await querySubgraph<{ listings: SubgraphListing[] }>(query, {
      creator: address.toLowerCase(),
    })
    return data.listings.map(mapListing)
  }

  /** Get usage receipts for a specific user */
  async getReceiptsByUser(address: Address): Promise<UsageReceipt[]> {
    const query = `
      query GetUserReceipts($user: Bytes!) {
        usages(where: { user: $user }, orderBy: timestamp, orderDirection: desc, first: 100) {
          id
          listing { id }
          user { id }
          amount
          timestamp
          txHash
        }
      }
    `
    const data = await querySubgraph<{ usages: SubgraphUsage[] }>(query, {
      user: address.toLowerCase(),
    })
    return data.usages.map(mapUsage)
  }

  /** Get analytics for a creator */
  async getCreatorAnalytics(address: Address): Promise<CreatorAnalytics> {
    const query = `
      query GetCreatorAnalytics($creator: Bytes!) {
        creator(id: $creator) {
          id
          totalListings
          totalRevenue
          totalUses
          listings(first: 10, orderBy: totalRevenue, orderDirection: desc) {
            ${LISTING_FIELDS}
          }
        }
        usages(where: { listing_: { creator: $creator } }, first: 20, orderBy: timestamp, orderDirection: desc) {
          id
          listing { id }
          user { id }
          amount
          timestamp
          txHash
        }
      }
    `

    const data = await querySubgraph<{
      creator: SubgraphCreator | null
      usages: SubgraphUsage[]
    }>(query, { creator: address.toLowerCase() })

    const emptyRevenue: Record<IPCategory, bigint> = {
      images: 0n, music: 0n, code: 0n, data: 0n, templates: 0n, other: 0n,
    }

    if (!data.creator) {
      return {
        totalListings: 0,
        activeListings: 0,
        totalUses: 0,
        totalRevenue: 0n,
        topListings: [],
        recentReceipts: [],
        revenueByCategory: emptyRevenue,
      }
    }

    const listings = data.creator.listings.map(mapListing)

    // Calculate revenue by category (category comes from metadata, default to 'other')
    const revenueByCategory = { ...emptyRevenue }
    for (const listing of listings) {
      revenueByCategory[listing.category] += listing.totalRevenue
    }

    return {
      totalListings: parseInt(data.creator.totalListings),
      activeListings: listings.filter((l) => l.isActive).length,
      totalUses: parseInt(data.creator.totalUses),
      totalRevenue: BigInt(data.creator.totalRevenue),
      topListings: listings,
      recentReceipts: data.usages.map(mapUsage),
      revenueByCategory,
    }
  }
}

// Export singleton instance
export const ipayService = new IPayService()
