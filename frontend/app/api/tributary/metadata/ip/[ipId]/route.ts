import { NextRequest } from 'next/server'
import type { Address } from 'viem'
import type { IPMetadata } from '../../../types'
import { resolveIPFSUri, IPFS_GATEWAYS } from '../../../types'

/** GET /api/tributary/metadata/ip/[ipId] - Get Story Protocol IP asset metadata */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ipId: string }> }
) {
  try {
    const { ipId } = await params
    const ip = ipId as Address
    if (!ip || !ip.startsWith('0x')) {
      return Response.json({ error: 'Invalid IP ID' }, { status: 400 })
    }
    const metadata = await fetchIPMetadata(ip)
    if (!metadata) {
      return Response.json({ error: 'IP asset not found' }, { status: 404 })
    }
    return Response.json({ metadata })
  } catch (error) {
    console.error('Error fetching IP metadata:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fetchIPMetadata(ipId: Address): Promise<IPMetadata | null> {
  // In production: Query Story Protocol for tokenURI, then fetch IPFS
  // For now, try to fetch directly assuming ipId maps to IPFS hash
  const rawMeta = await fetchFromIPFS(ipId)
  if (!rawMeta) return null

  return {
    ipId,
    name: (rawMeta.name as string) || 'Unknown',
    description: (rawMeta.description as string) || '',
    image: rawMeta.image ? resolveIPFSUri(rawMeta.image as string) : '',
    mediaUrl: rawMeta.animation_url ? resolveIPFSUri(rawMeta.animation_url as string) : undefined,
    mediaType: detectMediaType(rawMeta.animation_url as string),
    registrationDate: (rawMeta.registrationDate as number) || Math.floor(Date.now() / 1000),
    licenseTerms: rawMeta.licenseTerms as IPMetadata['licenseTerms'],
    creator: (rawMeta.creator as Address) || ipId,
    creatorName: rawMeta.creatorName as string,
    externalUrl: rawMeta.external_url as string,
    category: rawMeta.category as string,
    tags: rawMeta.tags as string[],
  }
}

async function fetchFromIPFS(hash: string): Promise<Record<string, unknown> | null> {
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const res = await fetch(`${gateway}${hash}`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) return res.json()
    } catch { continue }
  }
  return null
}

function detectMediaType(url?: string): string | undefined {
  if (!url) return undefined
  if (url.match(/\.(mp4|webm|mov)$/i)) return 'video'
  if (url.match(/\.(mp3|wav|ogg)$/i)) return 'audio'
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image'
  return undefined
}
