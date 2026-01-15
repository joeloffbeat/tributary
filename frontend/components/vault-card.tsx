'use client'

import Link from 'next/link'
import Image from 'next/image'
import { shortenAddress } from '@/lib/utils'
import { Vault } from 'lucide-react'

interface VaultCardProps {
  vault: {
    id: string
    token: {
      name: string
      symbol: string
    }
    creator: string
    dividendBps: string
    tradingFeeBps: string
    totalDeposited: string
    pool?: {
      reserveQuote: string
      volumeQuote: string
    }
    // IP Asset data
    imageUrl?: string | null
    ipName?: string
  }
}

export function VaultCard({ vault }: VaultCardProps) {
  // Calculate price from pool reserves
  const price = vault.pool
    ? parseFloat(vault.pool.reserveQuote) / 10000 // 10K fixed supply
    : null

  const displayName = vault.ipName || vault.token.name

  return (
    <Link href={`/vault/${vault.id}`}>
      <div className="h-full flex flex-col cursor-pointer hover:bg-muted/30 transition-all">
        {/* Image Section - Square */}
        <div className="relative aspect-square w-full overflow-hidden">
          {vault.imageUrl ? (
            <Image
              src={vault.imageUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/20">
              <Vault className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Token Info */}
          <div className="mb-3">
            <h3 className="font-title text-2xl text-text-primary mb-1 truncate">
              {displayName}
            </h3>
            <p className="font-body text-xs text-text-secondary">
              ${vault.token.symbol.toUpperCase()} • {shortenAddress(vault.creator)}
            </p>
          </div>

          {/* Stats Row: Price | Dividend | Trade Fee */}
          <div className="flex items-center justify-between text-center mt-auto">
            <div>
              <p className="font-stat text-lg">{price ? `$${price.toFixed(2)}` : '-'}</p>
              <p className="font-body text-[10px] text-text-muted">PRICE</p>
            </div>
            <div className="h-8 w-px bg-muted" />
            <div>
              <p className="font-stat text-lg text-tributary">
                {(parseInt(vault.dividendBps) / 100).toFixed(1)}%
              </p>
              <p className="font-body text-[10px] text-text-muted">DIVIDEND</p>
            </div>
            <div className="h-8 w-px bg-muted" />
            <div>
              <p className="font-stat text-lg">
                {(parseInt(vault.tradingFeeBps) / 100).toFixed(1)}%
              </p>
              <p className="font-body text-[10px] text-text-muted">FEE</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
