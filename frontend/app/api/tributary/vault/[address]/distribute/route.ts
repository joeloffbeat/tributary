import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { mantleSepolia } from '@/constants/tributary'
import { isValidVault, getVaultInfo } from '@/lib/services/tributary/reads'

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || 'https://engine.thirdweb.com'

interface RouteParams {
  params: Promise<{ address: string }>
}

/**
 * Distribute royalties via Thirdweb Engine
 */
async function distributeViaEngine(vault: Address): Promise<{
  success: boolean
  queueId?: string
  error?: string
}> {
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
          functionName: 'distribute',
          args: [],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { success: false, error: errorData.message || 'Failed to distribute' }
    }

    const { result } = await response.json()
    return { success: true, queueId: result.queueId }
  } catch (error) {
    console.error('Error distributing from vault:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * POST /api/tributary/vault/[address]/distribute
 * Trigger distribution of pending royalties to token holders
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { address: vaultAddress } = await params

    if (!vaultAddress || !vaultAddress.startsWith('0x')) {
      return Response.json({ error: 'Invalid vault address' }, { status: 400 })
    }

    const vault = vaultAddress as Address

    // Validate vault exists
    const isValid = await isValidVault(vault)
    if (!isValid) {
      return Response.json({ error: 'Vault not found' }, { status: 404 })
    }

    // Check pending distribution amount
    const vaultInfo = await getVaultInfo(vault)
    const pendingAmount = vaultInfo.pendingDistribution

    if (pendingAmount <= 0n) {
      return Response.json(
        { error: 'No pending royalties to distribute' },
        { status: 400 }
      )
    }

    const result = await distributeViaEngine(vault)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 })
    }

    return Response.json({
      success: true,
      queueId: result.queueId,
      distribution: {
        vault,
        amount: pendingAmount.toString(),
      },
      message: 'Distribution initiated. Holders can claim once confirmed.',
    })
  } catch (error) {
    console.error('Error distributing from vault:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
