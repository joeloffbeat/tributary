import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import {
  getVaultRecord,
  getVaultInfo,
  getDistribution,
  getTokenInfo,
} from '@/lib/services/tributary/reads'

interface RouteParams {
  params: Promise<{ address: string }>
}

/**
 * GET /api/tributary/vault/[address]
 * Get detailed vault info including token details and recent distributions
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { address: vaultAddress } = await params

    if (!vaultAddress || !vaultAddress.startsWith('0x')) {
      return Response.json({ error: 'Invalid vault address' }, { status: 400 })
    }

    const address = vaultAddress as Address

    // Fetch vault record and info
    const [record, info] = await Promise.all([
      getVaultRecord(address),
      getVaultInfo(address),
    ])

    if (!record.isActive) {
      return Response.json({ error: 'Vault not found or inactive' }, { status: 404 })
    }

    // Fetch token info
    const tokenInfo = await getTokenInfo(info.royaltyToken)

    // Fetch recent distributions (last 10)
    const distributions = []
    for (let i = 0; i < 10; i++) {
      try {
        const dist = await getDistribution(address, BigInt(i))
        if (dist.amount > 0n) {
          distributions.push({
            id: i.toString(),
            amount: dist.amount.toString(),
            timestamp: Number(dist.timestamp),
            snapshotId: dist.snapshotId.toString(),
            totalClaimed: dist.totalClaimed.toString(),
          })
        }
      } catch {
        // No more distributions
        break
      }
    }

    return Response.json({
      vault: {
        address,
        tokenAddress: info.royaltyToken,
        storyIPId: record.storyIPId,
        creator: record.creator,
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        totalSupply: tokenInfo.totalSupply.toString(),
        totalDeposited: info.totalDeposited.toString(),
        totalDistributed: info.totalDistributed.toString(),
        pendingDistribution: info.pendingDistribution.toString(),
        lastDistributionTime: Number(info.lastDistributionTime),
        isActive: info.isActive,
        createdAt: Number(record.createdAt),
        distributions,
      },
    })
  } catch (error) {
    console.error('Error fetching vault details:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
