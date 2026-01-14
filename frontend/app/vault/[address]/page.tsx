'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useVaultDetail } from '@/hooks/use-vault-detail'
import { VaultHeader } from './components/vault-header'
import { VaultTabs } from './components/vault-tabs'

export default function VaultDetailPage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = use(params)
  const { data: vault, isLoading, error } = useVaultDetail(address)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-tributary animate-spin" />
        <p className="font-body text-text-secondary mt-4">LOADING VAULT...</p>
      </div>
    )
  }

  if (error || !vault) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="font-body text-text-secondary mb-4">VAULT NOT FOUND</p>
        <Link href="/marketplace" className="btn-secondary">
          BACK TO MARKETPLACE
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Back Link */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 font-body text-sm text-text-secondary hover:text-tributary mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        BACK TO MARKETPLACE
      </Link>

      {/* Header */}
      <VaultHeader vault={vault} />

      {/* Tabs */}
      <VaultTabs vault={vault} />
    </div>
  )
}
