import { NextRequest } from 'next/server'
import { encodeAbiParameters, toHex, concat, pad, type Address } from 'viem'
import {
  getIPayChainConfig,
  isChainSupported,
  DEFAULT_SOURCE_CHAIN_ID,
  STORY_DOMAIN,
  IPAY_RECEIVER_ADDRESS,
  OP_LIST_LICENSE_TOKEN,
  DEFAULT_ENGINE_URL,
} from '@/constants/ipay'

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || DEFAULT_ENGINE_URL

interface ListLicenseTokenRequest {
  sourceChainId?: number
  licenseTokenId: string | bigint
  seller: Address
  priceUSDC: string | bigint
}

/**
 * Dispatch Hyperlane message to list a license token for sale on Story Protocol
 * Payload format: (uint256 licenseTokenId, address seller, uint256 priceUSDC)
 *
 * Note: The seller must have deposited the license token to the IPayReceiver contract
 * before calling this API. Use the contract's depositLicenseToken() function.
 */
async function dispatchListLicenseToken(params: {
  sourceChainId: number
  licenseTokenId: bigint
  seller: Address
  priceUSDC: bigint
}): Promise<{ success: boolean; queueId?: string; error?: string }> {
  const { sourceChainId, licenseTokenId, seller, priceUSDC } = params

  const chainConfig = getIPayChainConfig(sourceChainId)
  if (!chainConfig) {
    return { success: false, error: `Unsupported source chain: ${sourceChainId}` }
  }

  // Encode the payload matching contract's _handleListLicenseToken:
  // (uint256 licenseTokenId, address seller, uint256 priceUSDC)
  const payload = encodeAbiParameters(
    [
      { type: 'uint256', name: 'licenseTokenId' },
      { type: 'address', name: 'seller' },
      { type: 'uint256', name: 'priceUSDC' },
    ],
    [licenseTokenId, seller, priceUSDC]
  )

  // Prepend operation type (1 byte for OP_LIST_LICENSE_TOKEN)
  const message = concat([toHex(OP_LIST_LICENSE_TOKEN, { size: 1 }), payload])

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
      return { success: false, error: errorData.message || 'Failed to dispatch list license token message' }
    }

    const { result } = await response.json()
    console.log(`List license token message queued from chain ${sourceChainId}:`, result.queueId)
    return { success: true, queueId: result.queueId }
  } catch (error) {
    console.error('Error dispatching list license token message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * POST /api/ipay/license-listing
 * List a license token for sale on Story Protocol via Hyperlane
 *
 * Prerequisites:
 * 1. User must own a license token
 * 2. User must deposit the license token to IPayReceiver using depositLicenseToken()
 * 3. Then call this API to create the listing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ListLicenseTokenRequest

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
    if (!body.licenseTokenId || !body.seller || !body.priceUSDC) {
      return Response.json(
        { error: 'Missing required fields: licenseTokenId, seller, priceUSDC' },
        { status: 400 }
      )
    }

    // Parse bigint values
    const licenseTokenId = typeof body.licenseTokenId === 'string'
      ? BigInt(body.licenseTokenId)
      : BigInt(body.licenseTokenId)

    const priceUSDC = typeof body.priceUSDC === 'string'
      ? BigInt(body.priceUSDC)
      : BigInt(body.priceUSDC)

    if (priceUSDC <= 0n) {
      return Response.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Get chain config for response
    const chainConfig = getIPayChainConfig(sourceChainId)!

    // Dispatch the list license token message via Hyperlane
    const result = await dispatchListLicenseToken({
      sourceChainId,
      licenseTokenId,
      seller: body.seller,
      priceUSDC,
    })

    if (!result.success) {
      return Response.json(
        { error: result.error || 'Failed to list license token' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      queueId: result.queueId,
      sourceChain: chainConfig.chainName,
      sourceChainId,
      listing: {
        licenseTokenId: licenseTokenId.toString(),
        seller: body.seller,
        priceUSDC: priceUSDC.toString(),
      },
      message: 'License token listing initiated. The listing will appear once the cross-chain message is delivered.',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error listing license token:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
