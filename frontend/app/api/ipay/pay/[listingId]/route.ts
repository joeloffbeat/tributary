import { settlePayment, facilitator } from 'thirdweb/x402'
import { createThirdwebClient } from 'thirdweb'
import { avalancheFuji } from 'thirdweb/chains'
import { USDC_FUJI_ADDRESS } from '@/app/ipay/constants'
import { ipayService } from '@/lib/services/ipay-service'
import { getIPFSUrl } from '@/lib/web3/pinata'
import { NextRequest } from 'next/server'

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
})

const thirdwebFacilitator = facilitator({
  client,
  serverWalletAddress: process.env.THIRDWEB_SERVER_WALLET_ADDRESS!,
})

// Base URL for constructing resource URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params
  const paymentData = request.headers.get('x-payment')

  // Fetch listing details from subgraph
  let listing
  try {
    listing = await ipayService.getListingById(listingId)
  } catch (error) {
    console.error('Failed to fetch listing:', error)
    return Response.json(
      { error: 'Failed to fetch listing details' },
      { status: 500 }
    )
  }

  if (!listing) {
    return Response.json(
      { error: 'Listing not found' },
      { status: 404 }
    )
  }

  if (!listing.isActive) {
    return Response.json(
      { error: 'Listing is not active' },
      { status: 400 }
    )
  }

  // Resource URL for this specific listing payment
  const resourceUrl = `${API_BASE_URL}/api/ipay/pay/${listingId}`

  // Settle payment via x402 - pay directly to the listing creator
  const result = await settlePayment({
    resourceUrl,
    method: 'GET',
    paymentData,
    payTo: listing.creator, // Pay directly to the IP creator
    network: avalancheFuji,
    price: {
      amount: listing.pricePerUse.toString(), // Price from listing (USDC with 6 decimals)
      asset: {
        address: USDC_FUJI_ADDRESS,
      },
    },
    facilitator: thirdwebFacilitator,
  })

  console.log('IPay settlement result:', JSON.stringify(result, null, 2))

  if (result.status === 200) {
    // Payment successful - return asset access
    const assetUrl = getIPFSUrl(listing.assetIpfsHash)

    // Generate a unique receipt ID
    const receiptId = `receipt_${listingId}_${Date.now()}`

    return Response.json({
      success: true,
      assetUrl,
      receiptId,
      listing: {
        id: listing.id,
        title: listing.title,
        creator: listing.creator,
        category: listing.category,
      },
      payment: {
        amount: listing.pricePerUse.toString(),
        currency: 'USDC',
        network: 'avalanche-fuji',
      },
      timestamp: new Date().toISOString(),
    })
  } else {
    // Payment required or failed - return x402 response
    console.error('Settlement failed:', result.status, result.responseBody)
    return Response.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    })
  }
}
