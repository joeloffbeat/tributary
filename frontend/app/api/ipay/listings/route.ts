import { NextRequest } from 'next/server'
import { ipayService } from '@/lib/services/ipay-service'
import type { MarketplaceFilters } from '@/lib/types/ipay'

/**
 * GET /api/ipay/listings
 * Proxy endpoint for fetching listings from the subgraph
 * Supports filtering via query parameters
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Parse filter parameters
  const filters: MarketplaceFilters = {}

  const category = searchParams.get('category')
  if (category) {
    filters.category = category as MarketplaceFilters['category']
  }

  const minPrice = searchParams.get('minPrice')
  if (minPrice) {
    filters.minPrice = minPrice
  }

  const maxPrice = searchParams.get('maxPrice')
  if (maxPrice) {
    filters.maxPrice = maxPrice
  }

  const creator = searchParams.get('creator')
  if (creator) {
    filters.creator = creator as `0x${string}`
  }

  const sortBy = searchParams.get('sortBy')
  if (sortBy) {
    filters.sortBy = sortBy as MarketplaceFilters['sortBy']
  }

  const isActive = searchParams.get('isActive')
  if (isActive !== null) {
    filters.isActive = isActive === 'true'
  }

  try {
    const listings = await ipayService.getListings(filters)

    // Serialize BigInt values for JSON response
    const serializedListings = listings.map((listing) => ({
      ...listing,
      pricePerUse: listing.pricePerUse.toString(),
      totalRevenue: listing.totalRevenue.toString(),
    }))

    return Response.json({
      success: true,
      listings: serializedListings,
      count: serializedListings.length,
    })
  } catch (error) {
    console.error('Failed to fetch listings:', error)
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch listings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
