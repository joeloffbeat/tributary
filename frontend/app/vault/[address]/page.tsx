'use client'

import { useParams } from 'next/navigation'

export default function VaultDetailPage() {
  const params = useParams()
  const address = params.address as string

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="font-title text-5xl text-primary mb-4">Vault Detail</h1>
      <p className="font-body text-muted-foreground mb-4">
        VAULT ADDRESS: {address?.slice(0, 6)}...{address?.slice(-4)}
      </p>
      {/* Vault detail content will be implemented in prompt 15 */}
    </div>
  )
}
