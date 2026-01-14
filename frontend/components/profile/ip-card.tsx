'use client'

import Link from 'next/link'
import { CheckCircle, PlusCircle } from 'lucide-react'

interface IPCardProps {
  ip: {
    id: string
    name: string
    type: string
    hasVault: boolean
    vaultAddress?: string
  }
}

export function IPCard({ ip }: IPCardProps) {
  return (
    <div className="card-premium p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-title text-2xl mb-1">{ip.name}</h3>
          <p className="font-body text-xs text-text-muted">{ip.type}</p>
        </div>
        {ip.hasVault ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : null}
      </div>

      {ip.hasVault ? (
        <Link
          href={`/vault/${ip.vaultAddress}`}
          className="btn-secondary w-full text-center block"
        >
          MANAGE VAULT
        </Link>
      ) : (
        <Link
          href={`/create?ip=${ip.id}`}
          className="btn-primary w-full text-center flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          CREATE VAULT
        </Link>
      )}
    </div>
  )
}
