import { NextRequest, NextResponse } from 'next/server'
import { encodeAbiParameters, keccak256, toHex, concat, pad, type Address } from 'viem'
import {
  getIPayChainConfig,
  isChainSupported,
  DEFAULT_SOURCE_CHAIN_ID,
  STORY_DOMAIN,
  IPAY_RECEIVER_ADDRESS,
  OP_CREATE_DERIVATIVE_WITH_LICENSE,
  DEFAULT_ENGINE_URL,
} from '@/constants/ipay'
import { SELF_HOSTED_DEPLOYMENTS } from '@/constants/hyperlane/self-hosted'

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || DEFAULT_ENGINE_URL

interface CreateDerivativeRequest {
  sourceChainId?: number
  creator: Address
  licenseTokenIds: (string | bigint)[]
  ipMetadataUri: string
  nftMetadataUri: string
  collectionAddress?: Address
}

/**
 * Dispatch Hyperlane message to create a derivative IP using owned license tokens
 * Payload format: (bytes32 messageId, address creator, uint256[] licenseTokenIds, string ipMetadataUri, string nftMetadataUri, address collectionAddress)
 */
async function dispatchCreateDerivativeWithLicense(params: {
  sourceChainId: number
  messageId: `0x${string}`
  creator: Address
  licenseTokenIds: bigint[]
  ipMetadataUri: string
  nftMetadataUri: string
  collectionAddress: Address
}): Promise<{ success: boolean; queueId?: string; error?: string }> {
  const { sourceChainId, messageId, creator, licenseTokenIds, ipMetadataUri, nftMetadataUri, collectionAddress } = params

  console.log('dispatchCreateDerivativeWithLicense called with:', {
    sourceChainId,
    messageId,
    creator,
    licenseTokenIds: licenseTokenIds.map(id => id.toString()),
    ipMetadataUri,
    nftMetadataUri,
    collectionAddress,
  })

  const chainConfig = getIPayChainConfig(sourceChainId)
  if (!chainConfig) {
    console.error('Unsupported source chain:', sourceChainId)
    return { success: false, error: `Unsupported source chain: ${sourceChainId}` }
  }

  // Get mailbox address for source chain
  const deployment = SELF_HOSTED_DEPLOYMENTS[sourceChainId]
  if (!deployment) {
    console.error('No Hyperlane deployment for chain:', sourceChainId)
    return { success: false, error: `No Hyperlane deployment for chain: ${sourceChainId}` }
  }

  // Encode the payload matching contract's _handleCreateDerivativeWithLicense:
  // (bytes32 messageId, address creator, uint256[] licenseTokenIds, string ipMetadataUri, string nftMetadataUri, address collectionAddress)
  const payload = encodeAbiParameters(
    [
      { type: 'bytes32', name: 'messageId' },
      { type: 'address', name: 'creator' },
      { type: 'uint256[]', name: 'licenseTokenIds' },
      { type: 'string', name: 'ipMetadataUri' },
      { type: 'string', name: 'nftMetadataUri' },
      { type: 'address', name: 'collectionAddress' },
    ],
    [messageId, creator, licenseTokenIds, ipMetadataUri, nftMetadataUri, collectionAddress]
  )

  // Prepend operation type (1 byte for OP_CREATE_DERIVATIVE_WITH_LICENSE)
  const message = concat([toHex(OP_CREATE_DERIVATIVE_WITH_LICENSE, { size: 1 }), payload])
  console.log('Encoded message length:', message.length, 'bytes')

  // Convert IPayReceiver address to bytes32 (padded)
  const recipientBytes32 = pad(IPAY_RECEIVER_ADDRESS, { size: 32 })

  // Validate environment variables
  if (!process.env.THIRDWEB_SECRET_KEY) {
    console.error('Missing THIRDWEB_SECRET_KEY environment variable')
    return { success: false, error: 'Server configuration error: missing Thirdweb credentials' }
  }
  if (!process.env.THIRDWEB_SERVER_WALLET_ADDRESS) {
    console.error('Missing THIRDWEB_SERVER_WALLET_ADDRESS environment variable')
    return { success: false, error: 'Server configuration error: missing server wallet address' }
  }

  const requestUrl = `${ENGINE_URL}/contract/${sourceChainId}/${deployment.mailbox}/write`
  console.log('Dispatching Hyperlane message:', {
    url: requestUrl,
    sourceChainId,
    mailbox: deployment.mailbox,
    destinationDomain: STORY_DOMAIN,
  })

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.THIRDWEB_SECRET_KEY}`,
        'x-backend-wallet-address': process.env.THIRDWEB_SERVER_WALLET_ADDRESS,
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
    })

    const responseText = await response.text()
    console.log('Thirdweb Engine response status:', response.status)
    console.log('Thirdweb Engine response:', responseText)

    if (!response.ok) {
      let errorData: Record<string, unknown> = {}
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { rawResponse: responseText }
      }
      console.error('Hyperlane dispatch failed:', errorData)
      return {
        success: false,
        error: (errorData.message as string) || (errorData.error as string) || 'Failed to dispatch Hyperlane message'
      }
    }

    const data = JSON.parse(responseText)
    console.log('Create derivative message queued:', data.result?.queueId)
    return { success: true, queueId: data.result?.queueId }
  } catch (error) {
    console.error('Error dispatching create derivative message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * POST /api/ipay/derivative
 * Create a derivative IP using owned license tokens via Hyperlane cross-chain messaging
 *
 * Prerequisites:
 * 1. User must own license token(s) for the parent IP(s)
 * 2. The license terms must allow derivatives
 */
export async function POST(request: NextRequest) {
  console.log('=== Create Derivative API Called ===')

  try {
    const body = await request.json() as CreateDerivativeRequest
    console.log('Request body:', JSON.stringify(body, null, 2))

    // Get source chain from body or header (defaults to Avalanche Fuji)
    const sourceChainHeader = request.headers.get('x-source-chain')
    const sourceChainId = body.sourceChainId ||
      (sourceChainHeader ? parseInt(sourceChainHeader, 10) : DEFAULT_SOURCE_CHAIN_ID)

    // Validate source chain
    if (!isChainSupported(sourceChainId)) {
      return NextResponse.json(
        { error: `Unsupported source chain: ${sourceChainId}. Supported: 43113, 11155111, 80002` },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.creator || !body.licenseTokenIds || body.licenseTokenIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: creator, licenseTokenIds (array)' },
        { status: 400 }
      )
    }

    if (!body.ipMetadataUri || !body.nftMetadataUri) {
      return NextResponse.json(
        { error: 'Missing required fields: ipMetadataUri, nftMetadataUri' },
        { status: 400 }
      )
    }

    // Parse license token IDs to bigint array
    const licenseTokenIds = body.licenseTokenIds.map(id =>
      typeof id === 'string' ? BigInt(id) : BigInt(id)
    )

    // Use zero address if no collection specified (will use default SPG NFT)
    const collectionAddress = body.collectionAddress || '0x0000000000000000000000000000000000000000' as Address

    // Generate unique message ID
    const timestamp = Date.now()
    const messageId = keccak256(
      toHex(`derivative-${body.creator}-${licenseTokenIds.join('-')}-${timestamp}`)
    )
    console.log('Generated messageId:', messageId)

    // Dispatch Hyperlane message
    const result = await dispatchCreateDerivativeWithLicense({
      sourceChainId,
      messageId,
      creator: body.creator,
      licenseTokenIds,
      ipMetadataUri: body.ipMetadataUri,
      nftMetadataUri: body.nftMetadataUri,
      collectionAddress,
    })

    if (!result.success) {
      console.error('Create derivative dispatch failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Get chain config for response
    const chainConfig = getIPayChainConfig(sourceChainId)!

    console.log('Create derivative success - queueId:', result.queueId)
    return NextResponse.json({
      success: true,
      messageId,
      queueId: result.queueId,
      sourceChain: chainConfig.chainName,
      sourceChainId,
      derivative: {
        creator: body.creator,
        licenseTokenIds: licenseTokenIds.map(id => id.toString()),
        ipMetadataUri: body.ipMetadataUri,
        nftMetadataUri: body.nftMetadataUri,
        collectionAddress,
      },
      targetChain: 'story-aeneid',
      message: 'Derivative IP creation initiated. The derivative will be created once the cross-chain message is delivered.',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('=== Error in create derivative endpoint ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
