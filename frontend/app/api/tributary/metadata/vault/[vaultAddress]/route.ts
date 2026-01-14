import { NextRequest } from 'next/server'
import type { Address, Hex } from 'viem'
import { getVaultInfo, getTokenInfo, getFloorPrice } from '@/lib/services/tributary/reads'
import type { VaultMetadata } from '../../../types'
import { resolveIPFSUri, IPFS_GATEWAYS } from '../../../types'

/** GET /api/tributary/metadata/vault/[vaultAddress] - Get comprehensive vault metadata */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vaultAddress: string }> }
) {
  try {
    const { vaultAddress } = await params
    const vault = vaultAddress as Address
    if (!vault || !vault.startsWith('0x')) {
      return Response.json({ error: 'Invalid vault address' }, { status: 400 })
    }
    const metadata = await fetchVaultMetadata(vault)
    if (!metadata) {
      return Response.json({ error: 'Vault not found' }, { status: 404 })
    }
    return Response.json({ metadata })
  } catch (error) {
    console.error('Error fetching vault metadata:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fetchVaultMetadata(vault: Address): Promise<VaultMetadata | null> {
  try {
    const vaultInfo = await getVaultInfo(vault)
    const tokenInfo = await getTokenInfo(vaultInfo.royaltyToken)
    const floorPrice = await getFloorPrice(vaultInfo.royaltyToken)

    // Fetch IP metadata
    const ipMeta = await fetchIPMetadata(vaultInfo.storyIPId)
    const creatorBalance = tokenInfo.totalSupply / 10n // Assume 10% creator allocation
    const circulating = tokenInfo.totalSupply - creatorBalance

    // Determine phase based on vault state
    const phase = determinePhase(vaultInfo)

    return {
      vault,
      tokenAddress: vaultInfo.royaltyToken,
      creator: vaultInfo.creator,
      createdAt: Number(vaultInfo.lastDistributionTime) || Math.floor(Date.now() / 1000),
      tokenName: tokenInfo.name,
      tokenSymbol: tokenInfo.symbol,
      totalSupply: tokenInfo.totalSupply.toString(),
      circulatingSupply: circulating.toString(),
      storyIPId: vaultInfo.storyIPId as Address,
      ipMetadata: {
        name: ipMeta?.name || tokenInfo.name,
        description: ipMeta?.description || '',
        image: ipMeta?.image ? resolveIPFSUri(ipMeta.image) : '',
        mediaUrl: ipMeta?.mediaUrl,
      },
      config: {
        creatorAllocation: 10,
        salePrice: floorPrice.toString(),
      },
      state: {
        phase,
        tokensRemaining: circulating.toString(),
        totalDistributed: vaultInfo.totalDistributed.toString(),
        holderCount: 0, // Would need subgraph query
      },
    }
  } catch {
    return null
  }
}

function determinePhase(info: Awaited<ReturnType<typeof getVaultInfo>>): VaultMetadata['state']['phase'] {
  if (!info.isActive) return 'ended'
  if (info.totalDistributed > 0n) return 'trading'
  return 'sale'
}

async function fetchIPMetadata(ipId: Hex): Promise<{ name?: string; description?: string; image?: string; mediaUrl?: string } | null> {
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const res = await fetch(`${gateway}${ipId}`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) return res.json()
    } catch { continue }
  }
  return null
}
