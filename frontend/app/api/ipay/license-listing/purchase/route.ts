import { settlePayment, facilitator } from 'thirdweb/x402'
import { createThirdwebClient, defineChain } from 'thirdweb'
import { ipayService } from '@/lib/services/ipay-service'
import { NextRequest } from 'next/server'
import { encodeAbiParameters, keccak256, toHex, concat, pad, type Address } from 'viem'
import {
  getIPayChainConfig,
  isChainSupported,
  DEFAULT_SOURCE_CHAIN_ID,
  STORY_DOMAIN,
  IPAY_RECEIVER_ADDRESS,
  OP_PURCHASE_LICENSE_LISTING,
  DEFAULT_ENGINE_URL,
} from '@/constants/ipay'

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
})

const thirdwebFacilitator = facilitator({
  client,
  serverWalletAddress: process.env.THIRDWEB_SERVER_WALLET_ADDRESS!,
})

// Base URL for constructing resource URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || DEFAULT_ENGINE_URL

/**
 * Dispatch Hyperlane message to purchase a license listing on Story Protocol
 * Payload format: (bytes32 messageId, uint256 listingId, address buyer, uint256 usdcAmount)
 */
async function dispatchPurchaseLicenseListing(params: {
  sourceChainId: number
  messageId: `0x${string}`
  listingId: bigint
  buyer: Address
  usdcAmount: bigint
}): Promise<{ success: boolean; queueId?: string; error?: string }> {
  const { sourceChainId, messageId, listingId, buyer, usdcAmount } = params

  const chainConfig = getIPayChainConfig(sourceChainId)
  if (!chainConfig) {
    return { success: false, error: `Unsupported source chain: ${sourceChainId}` }
  }

  // Encode the payload matching contract's _handlePurchaseLicenseListing:
  // (bytes32 messageId, uint256 listingId, address buyer, uint256 usdcAmount)
  const payload = encodeAbiParameters(
    [
      { type: 'bytes32', name: 'messageId' },
      { type: 'uint256', name: 'listingId' },
      { type: 'address', name: 'buyer' },
      { type: 'uint256', name: 'usdcAmount' },
    ],
    [messageId, listingId, buyer, usdcAmount]
  )

  // Prepend operation type (1 byte for OP_PURCHASE_LICENSE_LISTING)
  const message = concat([toHex(OP_PURCHASE_LICENSE_LISTING, { size: 1 }), payload])

  // Convert IPayReceiver address to bytes32 (padded)
  const recipientBytes32 = pad(IPAY_RECEIVER_ADDRESS, { size: 32 })

  try {
    const response = await fetch(
      `${ENGINE_URL}/contract/${sourceChainId}/${chainConfig.mailbox}/write`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.THIRDWEB_SECRET_KEY}`,
          'x-backend-wallet-address': process.env.THIRDWEB_SERVER_WALLET_ADDRESS!,
        },
        body: JSON.stringify({
          functionName: 'dispatch',
          args: [
            STORY_DOMAIN.toString(),
            recipientBytes32,
            message,
          ],
          txOverrides: {
            value: '0',
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Hyperlane dispatch failed:', errorData)
      return { success: false, error: errorData.message || 'Failed to dispatch purchase license listing message' }
    }

    const { result } = await response.json()
    console.log(`Purchase license listing message queued from chain ${sourceChainId}:`, result.queueId)
    return { success: true, queueId: result.queueId }
  } catch (error) {
    console.error('Error dispatching purchase license listing message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * GET /api/ipay/license-listing/purchase?listingId=X&buyer=0x...
 * Purchase a listed license token via x402 payment + Hyperlane cross-chain message
 */
export async function GET(request: NextRequest) {
  const paymentData = request.headers.get('x-payment')
  const { searchParams } = new URL(request.url)

  const listingIdParam = searchParams.get('listingId')
  const buyerParam = searchParams.get('buyer')

  if (!listingIdParam || !buyerParam) {
    return Response.json(
      { error: 'Missing required query params: listingId, buyer' },
      { status: 400 }
    )
  }

  // Get source chain from header or query param (defaults to Avalanche Fuji)
  const sourceChainHeader = request.headers.get('x-source-chain')
  const sourceChainParam = searchParams.get('sourceChain')
  const sourceChainId = parseInt(sourceChainHeader || sourceChainParam || String(DEFAULT_SOURCE_CHAIN_ID), 10)

  // Validate source chain
  if (!isChainSupported(sourceChainId)) {
    return Response.json(
      { error: `Unsupported source chain: ${sourceChainId}. Supported: 43113, 11155111, 80002` },
      { status: 400 }
    )
  }

  // Get chain configuration
  const chainConfig = getIPayChainConfig(sourceChainId)!

  // Fetch license listing details from subgraph
  let licenseListing
  try {
    licenseListing = await ipayService.getLicenseListingById(listingIdParam)
  } catch (error) {
    console.error('Failed to fetch license listing:', error)
    return Response.json(
      { error: 'Failed to fetch license listing details' },
      { status: 500 }
    )
  }

  if (!licenseListing) {
    return Response.json(
      { error: 'License listing not found' },
      { status: 404 }
    )
  }

  if (!licenseListing.isActive) {
    return Response.json(
      { error: 'License listing is not active' },
      { status: 400 }
    )
  }

  // Create thirdweb chain from config
  const sourceNetwork = defineChain({
    id: chainConfig.chainId,
    name: chainConfig.displayName,
    nativeCurrency: chainConfig.nativeCurrency,
    rpc: chainConfig.rpcUrl,
    testnet: true, // All supported chains are testnets
  })

  // Resource URL for this specific license listing purchase
  const resourceUrl = `${API_BASE_URL}/api/ipay/license-listing/purchase?listingId=${listingIdParam}&buyer=${buyerParam}`

  // Settle payment via x402 using chain-specific USDC
  const result = await settlePayment({
    resourceUrl,
    method: 'GET',
    paymentData,
    payTo: licenseListing.seller, // Pay directly to the license token seller
    network: sourceNetwork,
    price: {
      amount: licenseListing.price.toString(), // Price from listing (USDC with 6 decimals)
      asset: {
        address: chainConfig.usdc,
      },
    },
    facilitator: thirdwebFacilitator,
  })

  console.log(`License listing purchase settlement on ${chainConfig.displayName}:`, JSON.stringify(result, null, 2))

  if (result.status === 200) {
    // Payment successful - dispatch cross-chain message to transfer license token

    // Generate a unique message ID for cross-chain tracking
    const timestamp = Date.now()
    const messageId = keccak256(
      toHex(`license-purchase-${listingIdParam}-${buyerParam}-${timestamp}`)
    )

    // Dispatch Hyperlane message to Story Protocol
    const crossChainResult = await dispatchPurchaseLicenseListing({
      sourceChainId,
      messageId,
      listingId: BigInt(listingIdParam),
      buyer: buyerParam as Address,
      usdcAmount: licenseListing.price,
    })

    if (crossChainResult.success) {
      console.log('Cross-chain license purchase initiated:', crossChainResult.queueId)
    } else {
      console.error('Cross-chain dispatch failed:', crossChainResult.error)
    }

    return Response.json({
      success: true,
      listing: {
        id: licenseListing.id,
        licenseTokenId: licenseListing.licenseTokenId,
        seller: licenseListing.seller,
        price: licenseListing.price.toString(),
      },
      buyer: buyerParam,
      payment: {
        amount: licenseListing.price.toString(),
        currency: 'USDC',
        sourceChain: chainConfig.chainName,
        sourceChainId,
      },
      crossChain: {
        dispatched: crossChainResult.success,
        messageId,
        queueId: crossChainResult.queueId,
        targetChain: 'story-aeneid',
        error: crossChainResult.error,
      },
      message: 'License token purchase initiated. The token will be transferred once the cross-chain message is delivered.',
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
