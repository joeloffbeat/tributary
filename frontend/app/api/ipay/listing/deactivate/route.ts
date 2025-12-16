import { NextRequest } from 'next/server'
import { encodeAbiParameters, toHex, concat, pad, type Address } from 'viem'
import {
  getIPayChainConfig,
  isChainSupported,
  DEFAULT_SOURCE_CHAIN_ID,
  STORY_DOMAIN,
  IPAY_RECEIVER_ADDRESS,
  OP_DEACTIVATE_LISTING,
  DEFAULT_ENGINE_URL,
} from '@/constants/ipay'

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || DEFAULT_ENGINE_URL

interface DeactivateListingRequest {
  sourceChainId?: number
  listingId: string | bigint
  creator: Address
}

/**
 * Dispatch Hyperlane message to deactivate a listing on Story Protocol
 * Payload format: (uint256 listingId)
 */
async function dispatchDeactivateListing(params: {
  sourceChainId: number
  listingId: bigint
}): Promise<{ success: boolean; queueId?: string; error?: string }> {
  const { sourceChainId, listingId } = params

  const chainConfig = getIPayChainConfig(sourceChainId)
  if (!chainConfig) {
    return { success: false, error: `Unsupported source chain: ${sourceChainId}` }
  }

  // Encode the payload matching contract's _handleDeactivateListing:
  // (uint256 listingId)
  const payload = encodeAbiParameters(
    [{ type: 'uint256', name: 'listingId' }],
    [listingId]
  )

  // Prepend operation type (1 byte for OP_DEACTIVATE_LISTING)
  const message = concat([toHex(OP_DEACTIVATE_LISTING, { size: 1 }), payload])

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
      return { success: false, error: errorData.message || 'Failed to dispatch deactivate listing message' }
    }

    const { result } = await response.json()
    console.log(`Deactivate listing message queued from chain ${sourceChainId}:`, result.queueId)
    return { success: true, queueId: result.queueId }
  } catch (error) {
    console.error('Error dispatching deactivate listing message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * POST /api/ipay/listing/deactivate
 * Deactivate a listing on Story Protocol via Hyperlane
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DeactivateListingRequest

    // Get source chain from body or header (defaults to Avalanche Fuji)
    const sourceChainHeader = request.headers.get('x-source-chain')
    const sourceChainId = body.sourceChainId ||
      (sourceChainHeader ? parseInt(sourceChainHeader, 10) : DEFAULT_SOURCE_CHAIN_ID)

    // Validate source chain
    if (!isChainSupported(sourceChainId)) {
      return Response.json(
        { error: `Unsupported source chain: ${sourceChainId}. Supported: 43113, 11155111, 80002` },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.listingId) {
      return Response.json(
        { error: 'Missing required field: listingId' },
        { status: 400 }
      )
    }

    // Parse bigint value
    const listingId = typeof body.listingId === 'string'
      ? BigInt(body.listingId)
      : BigInt(body.listingId)

    // Get chain config for response
    const chainConfig = getIPayChainConfig(sourceChainId)!

    // Dispatch the deactivate listing message via Hyperlane
    const result = await dispatchDeactivateListing({
      sourceChainId,
      listingId,
    })

    if (!result.success) {
      return Response.json(
        { error: result.error || 'Failed to deactivate listing' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      queueId: result.queueId,
      sourceChain: chainConfig.chainName,
      sourceChainId,
      listing: {
        listingId: listingId.toString(),
      },
      message: 'Listing deactivation initiated. Changes will appear once the cross-chain message is delivered.',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error deactivating listing:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
