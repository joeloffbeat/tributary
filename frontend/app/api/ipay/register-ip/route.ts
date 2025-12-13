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

/**
 * Encode license terms for cross-chain message
 */
function encodeLicenseTerms(terms: LicenseTermsInput): `0x${string}` {
  const mintingFee = terms.defaultMintingFee
    ? parseEther(terms.defaultMintingFee)
    : 0n

  return encodeAbiParameters(
    [
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
    [
      true, // transferable
      STORY_CONTRACTS.ROYALTY_POLICY_LAP, // royaltyPolicy
      mintingFee, // defaultMintingFee
      0n, // expiration (0 = no expiration)
      terms.commercialUse, // commercialUse
      terms.commercialAttribution, // commercialAttribution
      '0x0000000000000000000000000000000000000000' as Address, // commercializerChecker
      '0x' as `0x${string}`, // commercializerCheckerData
      terms.commercialRevShare * 1_000_000, // commercialRevShare (basis points)
      0n, // commercialRevCeiling
      terms.derivativesAllowed, // derivativesAllowed
      terms.derivativesAttribution, // derivativesAttribution
      terms.derivativesApproval, // derivativesApproval
      terms.derivativesReciprocal, // derivativesReciprocal
      0n, // derivativeRevCeiling
      STORY_CONTRACTS.WIP_TOKEN, // currency
      '', // uri
    ]
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

  const chainConfig = getIPayChainConfig(sourceChainId)
  if (!chainConfig) {
    return { success: false, error: `Unsupported source chain: ${sourceChainId}` }
  }

  // Get mailbox address for source chain
  const deployment = SELF_HOSTED_DEPLOYMENTS[sourceChainId]
  if (!deployment) {
    return { success: false, error: `No Hyperlane deployment for chain: ${sourceChainId}` }
  }

  // Encode the payload for mint and register
  const payload = encodeAbiParameters(
    [
      { type: 'bytes32', name: 'messageId' },
      { type: 'address', name: 'creator' },
      { type: 'string', name: 'ipMetadataUri' },
      { type: 'string', name: 'nftMetadataUri' },
      { type: 'bytes', name: 'licenseTerms' },
    ],
    [messageId, creator, ipMetadataUri, nftMetadataUri, encodedLicenseTerms]
  )

  // Prepend operation type (1 byte for OP_REGISTER_IP)
  const message = concat([toHex(OP_REGISTER_IP, { size: 1 }), payload])

  // Convert IPayReceiver address to bytes32 (padded)
  const recipientBytes32 = pad(IPAY_RECEIVER_ADDRESS, { size: 32 })

  try {
    const response = await fetch(
      `${ENGINE_URL}/contract/${sourceChainId}/${deployment.mailbox}/write`,
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
      return { success: false, error: errorData.message || 'Failed to dispatch Hyperlane message' }
    }

    const { result } = await response.json()
    console.log('IP Registration message queued:', result.queueId)
    return { success: true, queueId: result.queueId }
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
  try {
    const body = await request.json()

    // Check if this is a "mint new IP" request
    if (body.ipMetadataUri && body.nftMetadataUri && body.licenseTerms) {
      const { sourceChainId, creator, ipMetadataUri, nftMetadataUri, licenseTerms } = body

      // Validate required fields
      if (!sourceChainId || !creator || !ipMetadataUri || !nftMetadataUri) {
        return NextResponse.json(
          { error: 'Missing required fields for mint and register' },
          { status: 400 }
        )
      }

      // Generate unique message ID
      const timestamp = Date.now()
      const messageId = keccak256(
        toHex(`mint-register-ip-${creator}-${timestamp}`)
      )

      // Encode license terms
      const encodedLicenseTerms = encodeLicenseTerms(licenseTerms)

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
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        )
      }

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
    const { nftContract, tokenId, requester } = body

    if (!nftContract || !tokenId || !requester) {
      return NextResponse.json(
        { error: 'Missing required fields: nftContract, tokenId, requester' },
        { status: 400 }
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

    const response = await fetch(
      `${ENGINE_URL}/contract/${sourceChainId}/${deployment.mailbox}/write`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.THIRDWEB_SECRET_KEY}`,
          'x-backend-wallet-address': process.env.THIRDWEB_SERVER_WALLET_ADDRESS!,
        },
        body: JSON.stringify({
          functionName: 'dispatch',
          args: [STORY_DOMAIN.toString(), recipientBytes32, message],
          txOverrides: { value: '0' },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.message || 'Dispatch failed' },
        { status: 500 }
      )
    }

    const { result } = await response.json()

    return NextResponse.json({
      success: true,
      messageId,
      queueId: result.queueId,
      nftContract,
      tokenId,
      requester,
      targetChain: 'story-aeneid',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in register-ip endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
