import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { getFloorPrice, getListingsByToken } from '@/lib/services/tributary/reads'
import type { TokenPrice } from '../../types'

/**
 * GET /api/tributary/price/[tokenAddress]
 * Get current price data for a royalty token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenAddress: string }> }
) {
  try {
    const { tokenAddress } = await params
    const token = tokenAddress as Address

    if (!token || !token.startsWith('0x')) {
      return Response.json({ error: 'Invalid token address' }, { status: 400 })
    }

    const priceData = await fetchTokenPrice(token)

    if (!priceData) {
      return Response.json({ error: 'Token not found' }, { status: 404 })
    }

    return Response.json({ price: priceData })
  } catch (error) {
    console.error('Error fetching token price:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fetchTokenPrice(token: Address): Promise<TokenPrice | null> {
  try {
    const [floorPrice, listings] = await Promise.all([
      getFloorPrice(token),
      getListingsByToken(token),
    ])

    const activeListings = listings.filter((l) => l.isActive && l.amount > l.sold)
    const soldListings = listings.filter((l) => l.sold > 0n)

    const lastSalePrice = soldListings.length > 0
      ? soldListings.sort((a, b) => Number(b.createdAt - a.createdAt))[0].pricePerToken
      : 0n

    const now = BigInt(Math.floor(Date.now() / 1000))
    const volume24h = soldListings
      .filter((l) => l.createdAt >= now - 86400n)
      .reduce((sum, l) => sum + (l.sold * l.pricePerToken), 0n)

    const avgPrice24h = activeListings.length > 0
      ? activeListings.reduce((sum, l) => sum + l.pricePerToken, 0n) / BigInt(activeListings.length)
      : 0n

    return {
      token,
      floorPrice: floorPrice.toString(),
      lastSalePrice: lastSalePrice.toString(),
      avgPrice24h: avgPrice24h.toString(),
      priceChange24h: 0,
      priceChange7d: 0,
      volume24h: volume24h.toString(),
      volumeChange24h: 0,
      totalListings: activeListings.length,
      lastUpdated: Math.floor(Date.now() / 1000),
    }
  } catch {
    return null
  }
}
