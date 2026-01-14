'use client'

import Link from 'next/link'
import { formatNumber } from '@/lib/utils'

interface HoldingRowProps {
  holding: {
    id: string
    token: {
      id: string
      name: string
      symbol: string
    }
    balance: string
    value: number
    pendingRewards: string
  }
}

export function HoldingRow({ holding }: HoldingRowProps) {
  const hasPending = parseFloat(holding.pendingRewards) > 0

  return (
    <div className="grid grid-cols-6 gap-4 p-4 border-t border-cream-dark items-center">
      <div className="col-span-2">
        <p className="font-title text-xl">{holding.token.name}</p>
        <p className="font-body text-xs text-text-muted">{holding.token.symbol}</p>
      </div>
      <div className="text-right">
        <p className="font-stat">{formatNumber(holding.balance)}</p>
      </div>
      <div className="text-right">
        <p className="font-stat">${formatNumber(holding.value)}</p>
      </div>
      <div className="text-right">
        <p className={`font-stat ${hasPending ? 'text-tributary' : ''}`}>
          ${formatNumber(holding.pendingRewards)}
        </p>
      </div>
      <div className="text-right flex gap-2 justify-end">
        {hasPending && (
          <button className="btn-primary py-2 px-3 text-xs">
            CLAIM
          </button>
        )}
        <Link
          href={`/trade/${holding.token.id}`}
          className="btn-secondary py-2 px-3 text-xs"
        >
          TRADE
        </Link>
      </div>
    </div>
  )
}
