import { settlePayment, facilitator } from 'thirdweb/x402'
import { createThirdwebClient, defineChain } from 'thirdweb'
import { ipayService } from '@/lib/services/ipay-service'
import { getIPFSUrl } from '@/lib/web3/pinata'
import { NextRequest } from 'next/server'
import { encodeAbiParameters, keccak256, toHex, concat, pad, type Address } from 'viem'
import {
  getIPayChainConfig,
  isChainSupported,
  DEFAULT_SOURCE_CHAIN_ID,
  STORY_DOMAIN,
  IPAY_RECEIVER_ADDRESS,
  OP_MINT_LICENSE,
  DEFAULT_LICENSE_TERMS_ID,
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
 * Dispatch Hyperlane message to IPayReceiver on Story Protocol
 * Uses Thirdweb Engine to send transaction from server wallet
 * Payload format: (bytes32 messageId, address ipId, uint256 licenseTermsId, uint256 usdcAmount, address recipient, uint256 listingId)
 */
async function dispatchHyperlaneMessage(params: {
  sourceChainId: number
  messageId: `0x${string}`
  ipId: Address
  licenseTermsId: bigint
  usdcAmount: bigint
  recipient: Address
  listingId: bigint
}): Promise<{ success: boolean; queueId?: string; error?: string }> {
  const { sourceChainId, messageId, ipId, licenseTermsId, usdcAmount, recipient, listingId } = params

  // Get chain config for source chain
  const chainConfig = getIPayChainConfig(sourceChainId)
  if (!chainConfig) {
    return { success: false, error: `Unsupported source chain: ${sourceChainId}` }
  }

  // Encode the payload matching contract's _handleMintLicense:
  // (bytes32 messageId, address ipId, uint256 licenseTermsId, uint256 usdcAmount, address recipient, uint256 listingId)
  const payload = encodeAbiParameters(
    [
      { type: 'bytes32', name: 'messageId' },
      { type: 'address', name: 'ipId' },
      { type: 'uint256', name: 'licenseTermsId' },
      { type: 'uint256', name: 'usdcAmount' },
      { type: 'address', name: 'recipient' },
      { type: 'uint256', name: 'listingId' },
    ],
    [messageId, ipId, licenseTermsId, usdcAmount, recipient, listingId]
  )

  // Prepend operation type (1 byte for OP_MINT_LICENSE)
  const message = concat([toHex(OP_MINT_LICENSE, { size: 1 }), payload])

  // Convert IPayReceiver address to bytes32 (padded)
  const recipientBytes32 = pad(IPAY_RECEIVER_ADDRESS, { size: 32 })

  try {
    // Call Thirdweb Engine to dispatch via chain-specific Mailbox
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
            value: '0', // Self-hosted Hyperlane uses MerkleTreeHook (no fee required)
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Hyperlane dispatch failed:', errorData)
      return { success: false, error: errorData.message || 'Failed to dispatch Hyperlane message' }
    }

    const { result } = await response.json()
    console.log(`Hyperlane message queued from chain ${sourceChainId}:`, result.queueId)
    return { success: true, queueId: result.queueId }
  } catch (error) {
    console.error('Error dispatching Hyperlane message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params
  const paymentData = request.headers.get('x-payment')

  // Get source chain from header or query param (defaults to Avalanche Fuji)
  const { searchParams } = new URL(request.url)
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

  // Get recipient address from query params (required for cross-chain license minting)
  const recipientParam = searchParams.get('recipient')

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

  // Create thirdweb chain from config
  const sourceNetwork = defineChain({
    id: chainConfig.chainId,
    name: chainConfig.displayName,
    nativeCurrency: chainConfig.nativeCurrency,
    rpc: chainConfig.rpcUrl,
    testnet: chainConfig.isTestnet ? true : undefined,
  })

  // Resource URL for this specific listing payment
  const resourceUrl = `${API_BASE_URL}/api/ipay/pay/${listingId}`

  // Settle payment via x402 using chain-specific USDC
  const result = await settlePayment({
    resourceUrl,
    method: 'GET',
    paymentData,
    payTo: listing.creator, // Pay directly to the IP creator
    network: sourceNetwork,
    price: {
      amount: listing.pricePerUse.toString(), // Price from listing (USDC with 6 decimals)
      asset: {
        address: chainConfig.usdc,
      },
    },
    facilitator: thirdwebFacilitator,
  })

  console.log(`IPay settlement on ${chainConfig.displayName}:`, JSON.stringify(result, null, 2))

  if (result.status === 200) {
    // Payment successful - return asset access
    const assetUrl = getIPFSUrl(listing.assetIpfsHash)

    // Generate a unique receipt ID and message ID for cross-chain tracking
    const timestamp = Date.now()
    const receiptId = `receipt_${listingId}_${timestamp}`
    const messageId = keccak256(
      toHex(`ipay-${listingId}-${timestamp}-${listing.creator}`)
    )

    // Dispatch Hyperlane message to Story Protocol for license minting
    let crossChainResult: { success: boolean; queueId?: string; error?: string } = {
      success: false,
      error: 'Cross-chain dispatch skipped',
    }

    const zeroAddress = '0x0000000000000000000000000000000000000000'
    const hasValidIpId = listing.storyIPId && listing.storyIPId !== zeroAddress

    if (hasValidIpId && recipientParam) {
      console.log(`Dispatching Hyperlane message from ${chainConfig.displayName}...`)
      crossChainResult = await dispatchHyperlaneMessage({
        sourceChainId,
        messageId,
        ipId: listing.storyIPId,
        licenseTermsId: DEFAULT_LICENSE_TERMS_ID,
        usdcAmount: listing.pricePerUse,
        recipient: recipientParam as Address,
        listingId: BigInt(listingId),
      })

      if (crossChainResult.success) {
        console.log('Cross-chain license minting initiated:', crossChainResult.queueId)
      } else {
        console.error('Cross-chain dispatch failed:', crossChainResult.error)
      }
    } else {
      console.log('Skipping cross-chain dispatch:', {
        hasValidIpId,
        hasRecipient: !!recipientParam,
      })
    }

    return Response.json({
      success: true,
      assetUrl,
      receiptId,
      listing: {
        id: listing.id,
        title: listing.title,
        creator: listing.creator,
        category: listing.category,
        storyIPId: listing.storyIPId,
      },
      payment: {
        amount: listing.pricePerUse.toString(),
        currency: 'USDC',
        sourceChain: chainConfig.chainName,
        sourceChainId,
      },
      crossChain: {
        dispatched: crossChainResult.success,
        messageId: hasValidIpId ? messageId : undefined,
        queueId: crossChainResult.queueId,
        targetChain: 'story-aeneid',
        error: crossChainResult.error,
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
