import { NextRequest, NextResponse } from 'next/server'
import {
  encodeAbiParameters,
  keccak256,
  toHex,
  concat,
  pad,
  parseEther,
  type Address,
} from 'viem'
import {
  IPAY_RECEIVER_ADDRESS,
  STORY_DOMAIN,
  OP_REGISTER_IP,
  OP_MINT_AND_REGISTER_IP,
  getIPayChainConfig,
} from '@/constants/ipay'
import { STORY_CONTRACTS } from '@/constants/protocols/story'
import { SELF_HOSTED_DEPLOYMENTS } from '@/constants/hyperlane/self-hosted'

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || 'https://engine.thirdweb.com'

// License terms structure for encoding
type LicenseTermsInput = {
  commercialUse: boolean
  commercialAttribution: boolean
  commercialRevShare: number
  derivativesAllowed: boolean
  derivativesAttribution: boolean
  derivativesApproval: boolean
  derivativesReciprocal: boolean
  defaultMintingFee: string
}

// PIL License Terms tuple type for ABI encoding
const PIL_TERMS_TUPLE = {
  type: 'tuple',
  components: [
    { type: 'bool', name: 'transferable' },
    { type: 'address', name: 'royaltyPolicy' },
    { type: 'uint256', name: 'defaultMintingFee' },
    { type: 'uint256', name: 'expiration' },
    { type: 'bool', name: 'commercialUse' },
    { type: 'bool', name: 'commercialAttribution' },
    { type: 'address', name: 'commercializerChecker' },
    { type: 'bytes', name: 'commercializerCheckerData' },
    { type: 'uint32', name: 'commercialRevShare' },
    { type: 'uint256', name: 'commercialRevCeiling' },
    { type: 'bool', name: 'derivativesAllowed' },
    { type: 'bool', name: 'derivativesAttribution' },
    { type: 'bool', name: 'derivativesApproval' },
    { type: 'bool', name: 'derivativesReciprocal' },
    { type: 'uint256', name: 'derivativeRevCeiling' },
    { type: 'address', name: 'currency' },
    { type: 'string', name: 'uri' },
  ],
} as const

/**
 * Encode license terms for cross-chain message
 * Must be encoded as a tuple to match Solidity struct decoding
 */
function encodeLicenseTerms(terms: LicenseTermsInput): `0x${string}` {
  const mintingFee = terms.defaultMintingFee
    ? parseEther(terms.defaultMintingFee)
    : 0n

  return encodeAbiParameters(
    [PIL_TERMS_TUPLE],
    [{
      transferable: true,
      royaltyPolicy: STORY_CONTRACTS.ROYALTY_POLICY_LAP,
      defaultMintingFee: mintingFee,
      expiration: 0n,
      commercialUse: terms.commercialUse,
      commercialAttribution: terms.commercialAttribution,
      commercializerChecker: '0x0000000000000000000000000000000000000000' as Address,
      commercializerCheckerData: '0x' as `0x${string}`,
      commercialRevShare: Math.floor(terms.commercialRevShare * 100), // 0-100 percentage to basis points (10000 = 100%)
      commercialRevCeiling: 0n,
      derivativesAllowed: terms.derivativesAllowed,
      derivativesAttribution: terms.derivativesAttribution,
      derivativesApproval: terms.derivativesApproval,
      derivativesReciprocal: terms.derivativesReciprocal,
      derivativeRevCeiling: 0n,
      currency: STORY_CONTRACTS.WIP_TOKEN,
      uri: '',
    }]
  )
}

/**
 * Dispatch Hyperlane message to mint and register IP on Story Protocol
 */
async function dispatchMintAndRegisterIPMessage(params: {
  sourceChainId: number
  messageId: `0x${string}`
  creator: Address
  ipMetadataUri: string
  nftMetadataUri: string
  encodedLicenseTerms: `0x${string}`
}): Promise<{ success: boolean; queueId?: string; error?: string }> {
  const { sourceChainId, messageId, creator, ipMetadataUri, nftMetadataUri, encodedLicenseTerms } = params

  console.log('dispatchMintAndRegisterIPMessage called with:', {
    sourceChainId,
    messageId,
    creator,
    ipMetadataUri,
    nftMetadataUri,
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
  console.log('Using Hyperlane deployment:', { chainId: deployment.chainId, mailbox: deployment.mailbox })

  // Encode the payload for mint and register
  // NOTE: collectionParams is the 6th param - empty bytes means use existing/default collection
  const collectionParams = '0x' as `0x${string}` // Empty bytes = use existing collection or default SPG NFT
  const payload = encodeAbiParameters(
    [
      { type: 'bytes32', name: 'messageId' },
      { type: 'address', name: 'creator' },
      { type: 'string', name: 'ipMetadataUri' },
      { type: 'string', name: 'nftMetadataUri' },
      { type: 'bytes', name: 'licenseTerms' },
      { type: 'bytes', name: 'collectionParams' }, // Required 6th param
    ],
    [messageId, creator, ipMetadataUri, nftMetadataUri, encodedLicenseTerms, collectionParams]
  )

  // Prepend operation type (1 byte for OP_MINT_AND_REGISTER_IP = 9)
  const message = concat([toHex(OP_MINT_AND_REGISTER_IP, { size: 1 }), payload])
  console.log('Encoded message length:', message.length, 'bytes')

  // Convert IPayReceiver address to bytes32 (padded)
  const recipientBytes32 = pad(IPAY_RECEIVER_ADDRESS, { size: 32 })
  console.log('Recipient (IPayReceiver):', IPAY_RECEIVER_ADDRESS)

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
    recipient: recipientBytes32,
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
      return { success: false, error: (errorData.message as string) || (errorData.error as string) || 'Failed to dispatch Hyperlane message' }
    }

    const data = JSON.parse(responseText)
    console.log('IP Registration message queued:', data.result?.queueId)
    return { success: true, queueId: data.result?.queueId }
  } catch (error) {
    console.error('Error dispatching IP registration message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * POST /api/ipay/register-ip
 * Register a new IP Asset on Story Protocol via Hyperlane cross-chain messaging
 *
 * Supports two modes:
 * 1. Existing NFT: { nftContract, tokenId, requester }
 * 2. Mint new IP: { sourceChainId, creator, ipMetadataUri, nftMetadataUri, licenseTerms }
 */
export async function POST(request: NextRequest) {
  console.log('=== Register IP API Called ===')

  try {
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))

    // Check if this is a "mint new IP" request
    if (body.ipMetadataUri && body.nftMetadataUri && body.licenseTerms) {
      console.log('Processing mint new IP request')
      const { sourceChainId, creator, ipMetadataUri, nftMetadataUri, licenseTerms } = body

      // Validate required fields
      if (!sourceChainId || !creator || !ipMetadataUri || !nftMetadataUri) {
        return NextResponse.json(
          { error: 'Missing required fields for mint and register' },
          { status: 400 }
        )
      }

      console.log('Mint new IP params:', { sourceChainId, creator, ipMetadataUri, nftMetadataUri })
      console.log('License terms:', licenseTerms)

      // Generate unique message ID
      const timestamp = Date.now()
      const messageId = keccak256(
        toHex(`mint-register-ip-${creator}-${timestamp}`)
      )
      console.log('Generated messageId:', messageId)

      // Encode license terms
      const encodedLicenseTerms = encodeLicenseTerms(licenseTerms)
      console.log('Encoded license terms length:', encodedLicenseTerms.length)

      // Dispatch Hyperlane message
      const result = await dispatchMintAndRegisterIPMessage({
        sourceChainId,
        messageId,
        creator: creator as Address,
        ipMetadataUri,
        nftMetadataUri,
        encodedLicenseTerms,
      })

      if (!result.success) {
        console.error('Mint new IP dispatch failed:', result.error)
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        )
      }

      console.log('Mint new IP success - queueId:', result.queueId)
      return NextResponse.json({
        success: true,
        messageId,
        queueId: result.queueId,
        creator,
        sourceChainId,
        targetChain: 'story-aeneid',
        timestamp: new Date().toISOString(),
      })
    }

    // Legacy mode: Register existing NFT
    console.log('Processing legacy register existing NFT request')
    const { nftContract, tokenId, requester } = body

    if (!nftContract || !tokenId || !requester) {
      console.error('Missing required fields for legacy mode:', { nftContract, tokenId, requester })
      return NextResponse.json(
        { error: 'Missing required fields: nftContract, tokenId, requester' },
        { status: 400 }
      )
    }

    // Validate environment variables
    if (!process.env.THIRDWEB_SECRET_KEY) {
      console.error('Missing THIRDWEB_SECRET_KEY environment variable')
      return NextResponse.json(
        { error: 'Server configuration error: missing Thirdweb credentials' },
        { status: 500 }
      )
    }
    if (!process.env.THIRDWEB_SERVER_WALLET_ADDRESS) {
      console.error('Missing THIRDWEB_SERVER_WALLET_ADDRESS environment variable')
      return NextResponse.json(
        { error: 'Server configuration error: missing server wallet address' },
        { status: 500 }
      )
    }

    // Generate unique message ID
    const timestamp = Date.now()
    const messageId = keccak256(
      toHex(`register-ip-${nftContract}-${tokenId}-${timestamp}`)
    )

    // Encode payload for existing NFT
    const payload = encodeAbiParameters(
      [
        { type: 'bytes32', name: 'messageId' },
        { type: 'address', name: 'nftContract' },
        { type: 'uint256', name: 'tokenId' },
        { type: 'address', name: 'requester' },
      ],
      [messageId, nftContract as Address, BigInt(tokenId), requester as Address]
    )

    const message = concat([toHex(OP_REGISTER_IP, { size: 1 }), payload])
    const recipientBytes32 = pad(IPAY_RECEIVER_ADDRESS, { size: 32 })

    // Default to Avalanche Fuji
    const sourceChainId = 43113
    const deployment = SELF_HOSTED_DEPLOYMENTS[sourceChainId]

    const requestUrl = `${ENGINE_URL}/contract/${sourceChainId}/${deployment.mailbox}/write`
    console.log('Legacy mode - Dispatching Hyperlane message:', {
      url: requestUrl,
      sourceChainId,
      mailbox: deployment.mailbox,
      destinationDomain: STORY_DOMAIN,
    })

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.THIRDWEB_SECRET_KEY}`,
        'x-backend-wallet-address': process.env.THIRDWEB_SERVER_WALLET_ADDRESS,
      },
      body: JSON.stringify({
        functionName: 'dispatch',
        args: [STORY_DOMAIN.toString(), recipientBytes32, message],
        txOverrides: { value: '0' },
      }),
    })

    const responseText = await response.text()
    console.log('Legacy mode - Thirdweb Engine response status:', response.status)
    console.log('Legacy mode - Thirdweb Engine response:', responseText)

    if (!response.ok) {
      let errorData: Record<string, unknown> = {}
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { rawResponse: responseText }
      }
      console.error('Legacy mode - Hyperlane dispatch failed:', errorData)
      return NextResponse.json(
        { success: false, error: (errorData.message as string) || (errorData.error as string) || 'Dispatch failed' },
        { status: 500 }
      )
    }

    const data = JSON.parse(responseText)
    console.log('Legacy mode - IP Registration message queued:', data.result?.queueId)

    return NextResponse.json({
      success: true,
      messageId,
      queueId: data.result?.queueId,
      nftContract,
      tokenId,
      requester,
      targetChain: 'story-aeneid',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('=== Error in register-ip endpoint ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
