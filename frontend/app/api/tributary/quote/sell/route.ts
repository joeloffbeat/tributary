import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { getTokenBalance, getFloorPrice } from '@/lib/services/tributary/reads'
import type { SellQuoteRequest, SellQuote } from '../../types'
import { PLATFORM_FEE_BPS, CREATOR_FEE_BPS, BPS_BASE } from '../../types'

/**
 * POST /api/tributary/quote/sell
 * Get quote for selling royalty tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SellQuoteRequest

    if (!body.tokenAddress || !body.amount || !body.seller) {
      return Response.json(
        { error: 'Missing required fields: tokenAddress, amount, seller' },
        { status: 400 }
      )
    }

    const amount = BigInt(body.amount)
    if (amount <= 0n) {
      return Response.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    const balance = await getTokenBalance(body.tokenAddress, body.seller)
    if (balance < amount) {
      return Response.json({
        error: 'Insufficient token balance',
        balance: balance.toString(),
        requested: amount.toString(),
      }, { status: 400 })
    }

    const quote = await calculateSellQuote(
      body.tokenAddress,
      amount,
      body.listingPrice ? BigInt(body.listingPrice) : undefined
    )

    return Response.json({ quote })
  } catch (error) {
    console.error('Error calculating sell quote:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function calculateSellQuote(
  token: Address,
  amount: bigint,
  listingPrice?: bigint
): Promise<SellQuote> {
  const floorPrice = await getFloorPrice(token)
  const pricePerToken = listingPrice || floorPrice
  const proceeds = amount * pricePerToken

  const platformFee = (proceeds * PLATFORM_FEE_BPS) / BPS_BASE
  const creatorFee = (proceeds * CREATOR_FEE_BPS) / BPS_BASE
  const netProceeds = proceeds - platformFee - creatorFee

  const suggestedPrice = floorPrice > 0n ? (floorPrice * 98n) / 100n : pricePerToken

  return {
    token,
    amount: amount.toString(),
    suggestedPrice: suggestedPrice.toString(),
    floorPrice: floorPrice.toString(),
    proceeds: proceeds.toString(),
    platformFee: platformFee.toString(),
    creatorFee: creatorFee.toString(),
    netProceeds: netProceeds.toString(),
    expiresAt: Math.floor(Date.now() / 1000) + 60,
  }
}
