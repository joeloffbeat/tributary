import { NextRequest, NextResponse } from 'next/server'
import { encodeAbiParameters, keccak256, toHex, concat, pad, type Address } from 'viem'

// Hyperlane contract addresses
const AVALANCHE_FUJI_MAILBOX = '0x60c3ca08D3df3F5fA583c535D9E44F3629F52452' as Address
const IPAY_RECEIVER_STORY = '0xA5fa941d3c000ec425Fa7aDcAA0a9f5Bdb807f0F' as Address
const STORY_DOMAIN_ID = 1315

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || 'https://engine.thirdweb.com'

// Operation type for dispute filing
const OP_RAISE_DISPUTE = 5

// Dispute tags from Story Protocol
export const DISPUTE_TAGS = {
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
  const recipientBytes32 = pad(IPAY_RECEIVER_STORY, { size: 32 })

  try {
    const response = await fetch(
      `${ENGINE_URL}/contract/43113/${AVALANCHE_FUJI_MAILBOX}/write`,
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
            STORY_DOMAIN_ID.toString(),
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
