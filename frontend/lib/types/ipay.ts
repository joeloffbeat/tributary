import type { Address } from 'viem'

// IP Categories supported by IPay marketplace
export type IPCategory = 'images' | 'music' | 'code' | 'data' | 'templates' | 'other'

// IP Listing in the marketplace
export type IPListing = {
  id: string
  storyIPId: Address // Story Protocol IP Asset ID
  creator: Address
  title: string
  description: string
  imageUrl: string
  category: IPCategory
  pricePerUse: bigint // Price in USDC (6 decimals)
  assetIpfsHash: string // IPFS hash of the actual asset
  metadataUri: string // Story Protocol metadata URI
  totalUses: number
  totalRevenue: bigint // Total USDC earned
  isActive: boolean
  createdAt: number // Unix timestamp
}

// Usage receipt for tracking payments
export type UsageReceipt = {
  id: string
  listingId: string
  user: Address
  amount: bigint // USDC amount paid
  paymentTxHash: string // Transaction hash on Avalanche
  timestamp: number // Unix timestamp
}

// Parameters for creating a new listing
export type CreateListingParams = {
  title: string
  description: string
  category: IPCategory
  pricePerUse: string // Human-readable USDC amount (e.g., "1.50")
  assetFile: File // The actual IP asset file
  imageFile?: File // Optional preview image
  licenseType: 'non_commercial' | 'commercial_use' | 'commercial_remix'
}

// Filters for marketplace browsing
export type MarketplaceFilters = {
  category?: IPCategory
  minPrice?: string
  maxPrice?: string
  creator?: Address
  searchQuery?: string
  sortBy?: 'newest' | 'popular' | 'price_low' | 'price_high'
  isActive?: boolean
}

// Analytics for creators
export type CreatorAnalytics = {
  totalListings: number
  activeListings: number
  totalUses: number
  totalRevenue: bigint // Total USDC earned across all listings
  topListings: IPListing[]
  recentReceipts: UsageReceipt[]
  revenueByCategory: Record<IPCategory, bigint>
}

// Transaction step tracking
export type IPPayStep = {
  id: 'approve' | 'pay' | 'confirm'
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  txHash?: string
  error?: string
}

// Local storage keys for history
export type TrackedPayment = {
  id: string
  listingId: string
  listingTitle: string
  amount: bigint
  txHash: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
}
