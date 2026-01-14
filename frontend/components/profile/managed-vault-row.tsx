'use client'

import Link from 'next/link'
import { formatNumber } from '@/lib/utils'

interface ManagedVaultRowProps {
  vault: {
    id: string
    token: {
      id: string
      name: string
      symbol: string
    }
    totalDeposited: string
    totalDistributed: string
    pendingDistribution: string
    isActive: boolean
  }
}

export function ManagedVaultRow({ vault }: ManagedVaultRowProps) {
  const hasPending = parseFloat(vault.pendingDistribution) > 0

  return (
    <div className="grid grid-cols-6 gap-4 p-4 border-t border-cream-dark items-center">
      <div className="col-span-2">
        <p className="font-title text-xl">{vault.token.name}</p>
        <p className="font-body text-xs text-text-muted">{vault.token.symbol}</p>
      </div>
      <div className="text-right">
        <p className="font-stat">${formatNumber(vault.totalDeposited)}</p>
      </div>
      <div className="text-right">
        <p className="font-stat">${formatNumber(vault.totalDistributed)}</p>
      </div>
      <div className="text-right">
        <p className={`font-stat ${hasPending ? 'text-tributary' : ''}`}>
          ${formatNumber(vault.pendingDistribution)}
        </p>
      </div>
      <div className="text-right flex gap-2 justify-end">
        {hasPending && (
          <button className="btn-primary py-2 px-3 text-xs">
            DISTRIBUTE
          </button>
        )}
        <Link
          href={`/vault/${vault.id}`}
          className="btn-secondary py-2 px-3 text-xs"
        >
          MANAGE
        </Link>
      </div>
    </div>
  )
}
