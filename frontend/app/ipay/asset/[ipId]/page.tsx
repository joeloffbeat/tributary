'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAccount, ConnectButton } from '@/lib/web3'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ipayService } from '@/lib/services/ipay-service'
import { AssetHeader } from '../../components/asset-detail/asset-header'
import { PricingCard } from '../../components/asset-detail/pricing-card'
import { UsageHistory } from '../../components/asset-detail/usage-history'
import { ReceiptModal } from '../../components/shared/receipt-modal'
import type { IPListing, UsageReceipt } from '../../types'

export default function AssetDetailPage() {
  const params = useParams()
  const ipId = params.ipId as string
  const { isConnected } = useAccount()

  const [listing, setListing] = useState<IPListing | null>(null)
  const [usages, setUsages] = useState<UsageReceipt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Receipt modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState<UsageReceipt | null>(null)

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      if (!ipId) return
      setIsLoading(true)
      setError(null)

      try {
        const data = await ipayService.getListingById(ipId)
        if (!data) {
          setError('Listing not found')
          return
        }
        setListing(data)
        // TODO: Fetch usages for this listing from subgraph
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing')
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [ipId])

  const handlePaymentSuccess = (receipt: UsageReceipt) => {
    setCurrentReceipt(receipt)
    setReceiptModalOpen(true)
    // Update usage count locally
    if (listing) {
      setListing({ ...listing, totalUses: listing.totalUses + 1 })
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/ipay">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
          </Button>
        </Link>
        <div className="text-center py-20">
          <AlertCircle className="h-16 w-16 mx-auto mb-6 text-destructive" />
          <h1 className="text-2xl font-bold mb-4">{error || 'Listing not found'}</h1>
          <p className="text-muted-foreground mb-8">
            The IP asset you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/ipay">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link href="/ipay">
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Button>
      </Link>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Asset details */}
        <div className="lg:col-span-2 space-y-8">
          <AssetHeader listing={listing} />
          <UsageHistory listingId={listing.id} usages={usages} />
        </div>

        {/* Right column - Pricing */}
        <div className="space-y-4">
          {!isConnected ? (
            <div className="p-6 rounded-lg border bg-card text-center">
              <p className="text-muted-foreground mb-4">Connect wallet to purchase</p>
              <ConnectButton />
            </div>
          ) : (
            <PricingCard listing={listing} onPaymentSuccess={handlePaymentSuccess} />
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
        receipt={currentReceipt}
        listing={listing}
      />
    </div>
  )
}
