import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { getAllVaults, getTokenInfo, getFloorPrice, getListingsByToken } from '@/lib/services/tributary/reads'
import type { VaultSearchResult } from '../../types'

/** GET /api/tributary/metadata/search - Search vaults by name, creator, or category */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const creator = searchParams.get('creator') as Address | null
    const sortBy = searchParams.get('sort') || 'newest'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query && !category && !creator) {
      return Response.json(
        { error: 'Must provide at least one search parameter: q, category, or creator' },
        { status: 400 }
      )
    }

    const results = await searchVaults({ query, category, creator, sortBy, limit, offset })
    return Response.json({
      results: results.items,
      total: results.total,
      hasMore: results.total > offset + limit,
    })
  } catch (error) {
    console.error('Error searching vaults:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function searchVaults(params: {
  query?: string | null
  category?: string | null
  creator?: Address | null
  sortBy: string
  limit: number
  offset: number
}): Promise<{ items: VaultSearchResult[]; total: number }> {
  const allVaults = await getAllVaults()
  let filtered = allVaults.filter((v) => v.isActive)

  // Filter by creator
  if (params.creator) {
    filtered = filtered.filter((v) => v.creator.toLowerCase() === params.creator!.toLowerCase())
  }

  // Get token info and enrich results
  const enriched: VaultSearchResult[] = []
  for (const vault of filtered.slice(params.offset, params.offset + params.limit)) {
    try {
      const [tokenInfo, floorPrice, listings] = await Promise.all([
        getTokenInfo(vault.token),
        getFloorPrice(vault.token),
        getListingsByToken(vault.token),
      ])

      // Filter by query (search in token name/symbol)
      if (params.query) {
        const q = params.query.toLowerCase()
        if (!tokenInfo.name.toLowerCase().includes(q) && !tokenInfo.symbol.toLowerCase().includes(q)) {
          continue
        }
      }

      const vol24h = listings
        .filter((l) => l.createdAt >= BigInt(Math.floor(Date.now() / 1000) - 86400))
        .reduce((sum, l) => sum + l.sold * l.pricePerToken, 0n)

      enriched.push({
        vault: vault.vault,
        tokenAddress: vault.token,
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        creator: vault.creator,
        storyIPId: vault.storyIPId as Address,
        image: '',
        floorPrice: floorPrice.toString(),
        volume24h: vol24h.toString(),
        holderCount: 0,
        currentYield: 0,
      })
    } catch { continue }
  }

  // Sort results
  if (params.sortBy === 'volume') enriched.sort((a, b) => Number(BigInt(b.volume24h) - BigInt(a.volume24h)))
  else if (params.sortBy === 'holders') enriched.sort((a, b) => b.holderCount - a.holderCount)

  return { items: enriched, total: filtered.length }
}
