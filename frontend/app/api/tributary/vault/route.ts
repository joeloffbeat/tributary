import { NextRequest } from 'next/server'
import type { Address, Hex } from 'viem'
import { TRIBUTARY_CONTRACTS, mantleSepolia } from '@/constants/tributary'
import {
  getVaultsByCreator,
  getVaultByIPId,
  getVaultRecord,
  getVaultInfo,
} from '@/lib/services/tributary/reads'

// Thirdweb Engine URL
const ENGINE_URL = process.env.THIRDWEB_ENGINE_URL || 'https://engine.thirdweb.com'

/** Serialize object with BigInt values to JSON-safe format */
function serializeVault(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === 'bigint' ? value.toString() : value,
    ])
  )
}

interface CreateVaultRequest {
  storyIPId: Hex
  creator: Address
  tokenName: string
  tokenSymbol: string
  totalSupply: string // bigint as string
  creatorAllocation: string // bigint as string (e.g., "20" for 20%)
  paymentToken?: Address
}

/**
 * Create vault via Thirdweb Engine
 */
async function createVaultViaEngine(params: {
  storyIPId: Hex
  tokenName: string
  tokenSymbol: string
  totalSupply: bigint
  creatorAllocation: bigint
  paymentToken: Address
}): Promise<{ success: boolean; queueId?: string; error?: string }> {
  const contracts = TRIBUTARY_CONTRACTS[mantleSepolia.id]

  try {
    const response = await fetch(
      `${ENGINE_URL}/contract/${mantleSepolia.id}/${contracts.factory}/write`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.THIRDWEB_SECRET_KEY}`,
          'x-backend-wallet-address': process.env.THIRDWEB_SERVER_WALLET_ADDRESS!,
        },
        body: JSON.stringify({
          functionName: 'createVault',
          args: [
            {
              storyIPId: params.storyIPId,
              tokenName: params.tokenName,
              tokenSymbol: params.tokenSymbol,
              totalSupply: params.totalSupply.toString(),
              creatorAllocation: params.creatorAllocation.toString(),
              paymentToken: params.paymentToken,
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { success: false, error: errorData.message || 'Failed to create vault' }
    }

    const { result } = await response.json()
    return { success: true, queueId: result.queueId }
  } catch (error) {
    console.error('Error creating vault:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * POST /api/tributary/vault
 * Create a new royalty vault for an IP asset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateVaultRequest

    // Validate required fields
    if (!body.storyIPId || !body.creator || !body.tokenName || !body.tokenSymbol) {
      return Response.json(
        { error: 'Missing required fields: storyIPId, creator, tokenName, tokenSymbol' },
        { status: 400 }
      )
    }

    // Parse and validate token parameters
    const totalSupply = BigInt(body.totalSupply || 0)
    if (totalSupply <= 0n) {
      return Response.json({ error: 'Total supply must be greater than 0' }, { status: 400 })
    }

    const creatorAllocation = BigInt(body.creatorAllocation || 0)
    if (creatorAllocation < 0n || creatorAllocation > 100n) {
      return Response.json({ error: 'Creator allocation must be between 0-100' }, { status: 400 })
    }

    const contracts = TRIBUTARY_CONTRACTS[mantleSepolia.id]
    const paymentToken = body.paymentToken || contracts.usdc

    const result = await createVaultViaEngine({
      storyIPId: body.storyIPId,
      tokenName: body.tokenName,
      tokenSymbol: body.tokenSymbol,
      totalSupply,
      creatorAllocation,
      paymentToken,
    })

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 })
    }

    return Response.json({
      success: true,
      queueId: result.queueId,
      vault: {
        storyIPId: body.storyIPId,
        creator: body.creator,
        tokenName: body.tokenName,
        tokenSymbol: body.tokenSymbol,
      },
      message: 'Vault creation initiated. It will appear once the transaction is confirmed.',
    })
  } catch (error) {
    console.error('Error creating vault:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/tributary/vault?address=0x...&creator=0x...&ipId=0x...
 * Get vault(s) by address, creator, or IP ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address') as Address | null
    const creator = searchParams.get('creator') as Address | null
    const ipId = searchParams.get('ipId') as Hex | null

    if (!address && !creator && !ipId) {
      return Response.json(
        { error: 'Must provide address, creator, or ipId query parameter' },
        { status: 400 }
      )
    }

    // Query by address
    if (address) {
      const [record, info] = await Promise.all([
        getVaultRecord(address),
        getVaultInfo(address),
      ])
      return Response.json({ vault: serializeVault({ ...record, ...info }) })
    }

    // Query by creator
    if (creator) {
      const vaultAddresses = await getVaultsByCreator(creator)
      const vaults = await Promise.all(
        vaultAddresses.map(async (addr) => {
          const [record, info] = await Promise.all([
            getVaultRecord(addr),
            getVaultInfo(addr),
          ])
          return serializeVault({ ...record, ...info })
        })
      )
      return Response.json({ vaults })
    }

    // Query by IP ID
    if (ipId) {
      const vaultAddress = await getVaultByIPId(ipId)
      if (vaultAddress === '0x0000000000000000000000000000000000000000') {
        return Response.json({ error: 'Vault not found for this IP' }, { status: 404 })
      }
      const [record, info] = await Promise.all([
        getVaultRecord(vaultAddress),
        getVaultInfo(vaultAddress),
      ])
      return Response.json({ vault: serializeVault({ ...record, ...info }) })
    }

    return Response.json({ error: 'Invalid query' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching vault:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
