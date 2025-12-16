import { NextRequest, NextResponse } from 'next/server'
import { encodeAbiParameters, keccak256, toHex, concat, pad, type Address } from 'viem'
import {
  IPAY_RECEIVER_ADDRESS,
  STORY_DOMAIN,
  OP_RAISE_DISPUTE,
  getIPayChainConfig,
  DEFAULT_SOURCE_CHAIN_ID,
} from '@/constants/ipay'
import { SELF_HOSTED_DEPLOYMENTS } from '@/constants/hyperlane/self-hosted'

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || 'https://engine.thirdweb.com'

// Dispute tags from Story Protocol (internal use only - not exported from route)
const DISPUTE_TAGS = {
  IMPROPER_REGISTRATION: keccak256(toHex('IMPROPER_REGISTRATION')),
  IMPROPER_USAGE: keccak256(toHex('IMPROPER_USAGE')),
  IMPROPER_PAYMENT: keccak256(toHex('IMPROPER_PAYMENT')),
  CONTENT_STANDARDS_VIOLATION: keccak256(toHex('CONTENT_STANDARDS_VIOLATION')),
} as const

// Default dispute bond amount in WIP (18 decimals)
const DEFAULT_BOND_AMOUNT = BigInt('1000000000000000000') // 1 WIP

/**
 * Dispatch Hyperlane message to raise dispute on Story Protocol
 */
async function dispatchRaiseDisputeMessage(params: {
  messageId: `0x${string}`
  targetIpId: Address
  evidenceHash: `0x${string}`
  disputeTag: `0x${string}`
  bondAmount: bigint
  disputant: Address
}): Promise<{ success: boolean; queueId?: string; error?: string }> {
  const { messageId, targetIpId, evidenceHash, disputeTag, bondAmount, disputant } = params

  // Encode the payload
  const payload = encodeAbiParameters(
    [
      { type: 'bytes32', name: 'messageId' },
      { type: 'address', name: 'targetIpId' },
      { type: 'bytes32', name: 'evidenceHash' },
      { type: 'bytes32', name: 'disputeTag' },
      { type: 'uint256', name: 'bondAmount' },
      { type: 'address', name: 'disputant' },
    ],
    [messageId, targetIpId, evidenceHash, disputeTag, bondAmount, disputant]
  )

  // Prepend operation type
  const message = concat([toHex(OP_RAISE_DISPUTE, { size: 1 }), payload])

  // Convert IPayReceiver address to bytes32
  const recipientBytes32 = pad(IPAY_RECEIVER_ADDRESS, { size: 32 })

  // Get mailbox for source chain (default to Avalanche Fuji)
  const sourceChainId = DEFAULT_SOURCE_CHAIN_ID
  const deployment = SELF_HOSTED_DEPLOYMENTS[sourceChainId]
  if (!deployment) {
    return { success: false, error: `No Hyperlane deployment for chain: ${sourceChainId}` }
  }

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
    console.log('Dispute message queued:', result.queueId)
    return { success: true, queueId: result.queueId }
  } catch (error) {
    console.error('Error dispatching dispute message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * POST /api/ipay/raise-dispute
 * Raise a dispute against an IP Asset on Story Protocol via Hyperlane
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetIpId, evidenceHash, disputeTag, bondAmount, disputant } = body

    // Validate required fields
    if (!targetIpId || !evidenceHash || !disputeTag || !disputant) {
      return NextResponse.json(
        { error: 'Missing required fields: targetIpId, evidenceHash, disputeTag, disputant' },
        { status: 400 }
      )
    }

    // Validate dispute tag
    const validTags = Object.values(DISPUTE_TAGS)
    if (!validTags.includes(disputeTag as any)) {
      return NextResponse.json(
        {
          error: 'Invalid dispute tag',
          validTags: Object.keys(DISPUTE_TAGS),
        },
        { status: 400 }
      )
    }

    // Generate unique message ID
    const timestamp = Date.now()
    const messageId = keccak256(
      toHex(`dispute-${targetIpId}-${timestamp}`)
    )

    // Use provided bond amount or default
    const finalBondAmount = bondAmount ? BigInt(bondAmount) : DEFAULT_BOND_AMOUNT

    // Dispatch Hyperlane message
    const result = await dispatchRaiseDisputeMessage({
      messageId,
      targetIpId: targetIpId as Address,
      evidenceHash: evidenceHash as `0x${string}`,
      disputeTag: disputeTag as `0x${string}`,
      bondAmount: finalBondAmount,
      disputant: disputant as Address,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId,
      queueId: result.queueId,
      targetIpId,
      disputeTag,
      bondAmount: finalBondAmount.toString(),
      disputant,
      targetChain: 'story-aeneid',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in raise-dispute endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ipay/raise-dispute
 * Get valid dispute tags
 */
export async function GET() {
  return NextResponse.json({
    disputeTags: Object.entries(DISPUTE_TAGS).map(([name, hash]) => ({
      name,
      hash,
      description: getTagDescription(name),
    })),
    defaultBondAmount: DEFAULT_BOND_AMOUNT.toString(),
  })
}

function getTagDescription(tag: string): string {
  const descriptions: Record<string, string> = {
    IMPROPER_REGISTRATION: 'The IP was registered without proper ownership or rights',
    IMPROPER_USAGE: 'The IP is being used in violation of license terms',
    IMPROPER_PAYMENT: 'Royalty or payment obligations are not being met',
    CONTENT_STANDARDS_VIOLATION: 'The content violates community or legal standards',
  }
  return descriptions[tag] || 'Unknown dispute type'
}
