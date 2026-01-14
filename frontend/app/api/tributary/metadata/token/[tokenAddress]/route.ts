import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import { getTokenInfo, getVaultInfo } from '@/lib/services/tributary/reads'
import type { TokenMetadata } from '../../../types'
import { resolveIPFSUri, IPFS_GATEWAYS } from '../../../types'

/** GET /api/tributary/metadata/token/[tokenAddress] - Get ERC-20 token metadata */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenAddress: string }> }
) {
  try {
    const { tokenAddress } = await params
    const token = tokenAddress as Address
    if (!token || !token.startsWith('0x')) {
      return Response.json({ error: 'Invalid token address' }, { status: 400 })
    }
    const metadata = await fetchTokenMetadata(token)
    if (!metadata) {
      return Response.json({ error: 'Token not found' }, { status: 404 })
    }
    return Response.json(metadata)
  } catch (error) {
    console.error('Error fetching token metadata:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fetchTokenMetadata(token: Address): Promise<TokenMetadata | null> {
  try {
    const tokenInfo = await getTokenInfo(token)
    const vaultInfo = await getVaultInfo(tokenInfo.vault)

    // Try to fetch IP metadata for image/description
    let image: string | undefined
    let description: string | undefined
    try {
      const ipData = await fetchIPFSMetadata(vaultInfo.storyIPId)
      if (ipData) {
        image = ipData.image ? resolveIPFSUri(ipData.image as string) : undefined
        description = ipData.description as string
      }
    } catch { /* IP metadata optional */ }

    return {
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      decimals: tokenInfo.decimals,
      totalSupply: tokenInfo.totalSupply.toString(),
      description,
      image,
      vault: tokenInfo.vault,
      storyIPId: vaultInfo.storyIPId as Address,
      creator: tokenInfo.creator,
      attributes: [
        { trait_type: 'Type', value: 'Royalty Token' },
        { trait_type: 'Vault', value: tokenInfo.vault },
      ],
    }
  } catch {
    return null
  }
}

async function fetchIPFSMetadata(ipId: Address): Promise<Record<string, unknown> | null> {
  // In production, query Story Protocol for token URI then fetch IPFS
  // For now, return null (would need Story Protocol SDK integration)
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const res = await fetch(`${gateway}${ipId}`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) return res.json()
    } catch { continue }
  }
  return null
}
