import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { getListingsByToken } from '@/lib/services/tributary/reads'
import type { BuyQuoteRequest, BuyQuote, ListingFill } from '../../types'
import { PLATFORM_FEE_BPS, CREATOR_FEE_BPS, BPS_BASE } from '../../types'

/** POST /api/tributary/quote/buy - Get quote for purchasing royalty tokens */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BuyQuoteRequest
    if (!body.tokenAddress || !body.amount || !body.buyer) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const amount = BigInt(body.amount)
    if (amount <= 0n) {
      return Response.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }
    const quote = await calculateBuyQuote(body.tokenAddress, amount)
    if (!quote.canFill) {
      return Response.json({
        error: 'Insufficient liquidity',
        available: quote.availableAmount,
        requested: amount.toString(),
      }, { status: 400 })
    }
    return Response.json({ quote })
  } catch (error) {
    console.error('Error calculating buy quote:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function calculateBuyQuote(token: Address, amount: bigint): Promise<BuyQuote> {
  const listings = await getListingsByToken(token)
  const active = listings
    .filter((l) => l.isActive && l.amount > l.sold)
    .sort((a, b) => Number(a.pricePerToken - b.pricePerToken))
  const totalAvailable = active.reduce((sum, l) => sum + (l.amount - l.sold), 0n)
  const expires = Math.floor(Date.now() / 1000) + 60

  if (totalAvailable < amount) {
    return {
      canFill: false, availableAmount: totalAvailable.toString(), token,
      amount: amount.toString(), avgPrice: '0', totalCost: '0',
      platformFee: '0', creatorFee: '0', totalWithFees: '0',
      priceImpact: 0, listingsToFill: [], expiresAt: expires,
    }
  }

  let remaining = amount, totalCost = 0n
  const listingsToFill: ListingFill[] = []
  for (const l of active) {
    if (remaining <= 0n) break
    const avail = l.amount - l.sold
    const fill = remaining > avail ? avail : remaining
    const sub = fill * l.pricePerToken
    totalCost += sub
    listingsToFill.push({
      listingId: l.listingId.toString(), seller: l.seller,
      price: l.pricePerToken.toString(), amount: fill.toString(), subtotal: sub.toString(),
    })
    remaining -= fill
  }

  const platformFee = (totalCost * PLATFORM_FEE_BPS) / BPS_BASE
  const creatorFee = (totalCost * CREATOR_FEE_BPS) / BPS_BASE
  const avgPrice = totalCost / amount
  const floor = active[0]?.pricePerToken || 0n
  const priceImpact = floor > 0n ? Number(((avgPrice - floor) * 10000n) / floor) / 100 : 0

  return {
    canFill: true, token, amount: amount.toString(),
    avgPrice: avgPrice.toString(), totalCost: totalCost.toString(),
    platformFee: platformFee.toString(), creatorFee: creatorFee.toString(),
    totalWithFees: (totalCost + platformFee + creatorFee).toString(),
    priceImpact, listingsToFill, expiresAt: expires,
  }
}
