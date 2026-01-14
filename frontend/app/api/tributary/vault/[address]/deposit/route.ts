import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { mantleSepolia } from '@/constants/tributary'
import { isValidVault } from '@/lib/services/tributary/reads'

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || 'https://engine.thirdweb.com'

interface DepositRequest {
  amount: string // USDC amount as string (with decimals)
}

interface RouteParams {
  params: Promise<{ address: string }>
}

/**
 * Deposit royalty via Thirdweb Engine
 */
async function depositRoyaltyViaEngine(
  vault: Address,
  amount: bigint
): Promise<{ success: boolean; queueId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${ENGINE_URL}/contract/${mantleSepolia.id}/${vault}/write`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.THIRDWEB_SECRET_KEY}`,
          'x-backend-wallet-address': process.env.THIRDWEB_SERVER_WALLET_ADDRESS!,
        },
        body: JSON.stringify({
          functionName: 'depositRoyalty',
          args: [amount.toString()],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { success: false, error: errorData.message || 'Failed to deposit' }
    }

    const { result } = await response.json()
    return { success: true, queueId: result.queueId }
  } catch (error) {
    console.error('Error depositing to vault:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * POST /api/tributary/vault/[address]/deposit
 * Deposit royalties into a vault for distribution
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { address: vaultAddress } = await params
    const body = await request.json() as DepositRequest

    if (!vaultAddress || !vaultAddress.startsWith('0x')) {
      return Response.json({ error: 'Invalid vault address' }, { status: 400 })
    }

    const vault = vaultAddress as Address

    // Validate vault exists
    const isValid = await isValidVault(vault)
    if (!isValid) {
      return Response.json({ error: 'Vault not found' }, { status: 404 })
    }

    // Validate amount
    if (!body.amount) {
      return Response.json({ error: 'Amount is required' }, { status: 400 })
    }

    const amount = BigInt(body.amount)
    if (amount <= 0n) {
      return Response.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    const result = await depositRoyaltyViaEngine(vault, amount)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 })
    }

    return Response.json({
      success: true,
      queueId: result.queueId,
      deposit: {
        vault,
        amount: body.amount,
      },
      message: 'Deposit initiated. Tokens will be available for distribution once confirmed.',
    })
  } catch (error) {
    console.error('Error depositing to vault:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
