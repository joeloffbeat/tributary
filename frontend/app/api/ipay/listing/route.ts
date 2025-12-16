import { NextRequest } from 'next/server'
import { encodeAbiParameters, toHex, concat, pad, type Address } from 'viem'
import {
  getIPayChainConfig,
  isChainSupported,
  DEFAULT_SOURCE_CHAIN_ID,
  STORY_DOMAIN,
  IPAY_RECEIVER_ADDRESS,
  OP_CREATE_LISTING,
  DEFAULT_ENGINE_URL,
} from '@/constants/ipay'

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || DEFAULT_ENGINE_URL

interface CreateListingRequest {
  sourceChainId?: number
  ipId: Address
  creator: Address
  title: string
  description: string
  category: string
  priceUSDC: bigint | string
  assetIpfsHash: string
  metadataUri: string
}

/**
 * Dispatch Hyperlane message to create a listing on Story Protocol
 * Payload format: (address ipId, address creator, string title, string description, string category, uint256 priceUSDC, string assetIpfsHash, string metadataUri)
 */
async function dispatchCreateListing(params: {
  sourceChainId: number
  ipId: Address
  creator: Address
  title: string
  description: string
  category: string
  priceUSDC: bigint
  assetIpfsHash: string
  metadataUri: string
}): Promise<{ success: boolean; queueId?: string; error?: string }> {
  const { sourceChainId, ipId, creator, title, description, category, priceUSDC, assetIpfsHash, metadataUri } = params

  // Get chain config for source chain
  const chainConfig = getIPayChainConfig(sourceChainId)
  if (!chainConfig) {
    return { success: false, error: `Unsupported source chain: ${sourceChainId}` }
  }

  // Encode the payload matching contract's _handleCreateListing:
  // (address ipId, address creator, string title, string description, string category, uint256 priceUSDC, string assetIpfsHash, string metadataUri)
  const payload = encodeAbiParameters(
    [
      { type: 'address', name: 'ipId' },
      { type: 'address', name: 'creator' },
      { type: 'string', name: 'title' },
      { type: 'string', name: 'description' },
      { type: 'string', name: 'category' },
      { type: 'uint256', name: 'priceUSDC' },
      { type: 'string', name: 'assetIpfsHash' },
      { type: 'string', name: 'metadataUri' },
    ],
    [ipId, creator, title, description, category, priceUSDC, assetIpfsHash, metadataUri]
  )

  // Prepend operation type (1 byte for OP_CREATE_LISTING)
  const message = concat([toHex(OP_CREATE_LISTING, { size: 1 }), payload])

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
      return { success: false, error: errorData.message || 'Failed to dispatch create listing message' }
    }

    const { result } = await response.json()
    console.log(`Create listing message queued from chain ${sourceChainId}:`, result.queueId)
    return { success: true, queueId: result.queueId }
  } catch (error) {
    console.error('Error dispatching create listing message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * POST /api/ipay/listing
 * Create a new listing on Story Protocol via Hyperlane
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateListingRequest

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
    if (!body.ipId || !body.creator || !body.title) {
      return Response.json(
        { error: 'Missing required fields: ipId, creator, title' },
        { status: 400 }
      )
    }

    // Parse bigint values
    const priceUSDC = typeof body.priceUSDC === 'string'
      ? BigInt(body.priceUSDC)
      : BigInt(body.priceUSDC || 0)

    if (priceUSDC <= 0n) {
      return Response.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Get chain config for response
    const chainConfig = getIPayChainConfig(sourceChainId)!

    // Dispatch the create listing message via Hyperlane
    const result = await dispatchCreateListing({
      sourceChainId,
      ipId: body.ipId,
      creator: body.creator,
      title: body.title,
      description: body.description || '',
      category: body.category || 'art',
      priceUSDC,
      assetIpfsHash: body.assetIpfsHash || '',
      metadataUri: body.metadataUri || '',
    })

    if (!result.success) {
      return Response.json(
        { error: result.error || 'Failed to create listing' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      queueId: result.queueId,
      sourceChain: chainConfig.chainName,
      sourceChainId,
      listing: {
        ipId: body.ipId,
        creator: body.creator,
        title: body.title,
        priceUSDC: priceUSDC.toString(),
        category: body.category || 'art',
      },
      message: 'Listing creation initiated. The listing will appear on Story Protocol once the cross-chain message is delivered.',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error creating listing:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
