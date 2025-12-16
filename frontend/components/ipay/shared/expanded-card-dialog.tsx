'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOutsideClick } from '@/hooks/use-outside-click'
import type { IPAssetListing } from './ip-asset-card'
import { getEnrichedIPAsset, type EnrichedIPAsset } from '@/lib/services/story-api-service'
import { OverviewTab, LicenseTermsTab, MarketTab, HistoryTab } from './dialog-tabs'

interface ExpandedCardDialogProps {
  listing: IPAssetListing
  layoutId: string
  onClose: () => void
}

export function ExpandedCardDialog({ listing, layoutId, onClose }: ExpandedCardDialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [enrichedData, setEnrichedData] = useState<EnrichedIPAsset | null>(
    listing.enrichedData || null
  )
  const [isLoading, setIsLoading] = useState(!listing.enrichedData)
  const [error, setError] = useState<string | null>(null)

  // Fetch enriched data if not already available
  const fetchEnrichedData = useCallback(async () => {
    if (listing.enrichedData) {
      setEnrichedData(listing.enrichedData)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getEnrichedIPAsset(listing.ipId)
      setEnrichedData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load IP asset details')
    } finally {
      setIsLoading(false)
    }
  }, [listing.ipId, listing.enrichedData])

  useEffect(() => {
    fetchEnrichedData()
  }, [fetchEnrichedData])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  useOutsideClick(ref, onClose)

  return (
    <div className="fixed inset-0 grid place-items-center z-[100]">
      {/* Mobile close button */}
      <motion.button
        key={`button-${listing.id}-${layoutId}`}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.05 } }}
        className="flex absolute top-4 right-4 lg:hidden items-center justify-center bg-background rounded-full h-8 w-8 z-10 border"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </motion.button>

      <motion.div
        layoutId={`card-${listing.id}-${layoutId}`}
        ref={ref}
        className="w-full max-w-[700px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-background border rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header with image */}
        <DialogHeader listing={listing} layoutId={layoutId} onClose={onClose} />

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchEnrichedData}>Retry</Button>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="p-6">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="license">License</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OverviewTab listing={listing} enrichedData={enrichedData} />
              </TabsContent>

              <TabsContent value="license">
                <LicenseTermsTab enrichedData={enrichedData} />
              </TabsContent>

              <TabsContent value="market">
                <MarketTab listing={listing} enrichedData={enrichedData} />
              </TabsContent>

              <TabsContent value="history">
                <HistoryTab listing={listing} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Header component for the dialog
function DialogHeader({
  listing,
  layoutId,
  onClose,
}: {
  listing: IPAssetListing
  layoutId: string
  onClose: () => void
}) {
  return (
    <div className="relative">
      <motion.div
        layoutId={`image-${listing.id}-${layoutId}`}
        className="h-48 lg:h-56 bg-muted"
      >
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl text-muted-foreground">🖼️</span>
          </div>
        )}
      </motion.div>

      {/* Desktop close button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onClose}
        className="absolute top-4 right-4 hidden lg:flex bg-background/80 backdrop-blur-sm"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
        <motion.h2
          layoutId={`title-${listing.id}-${layoutId}`}
          className="text-xl font-semibold"
        >
          {listing.title}
        </motion.h2>
      </div>
    </div>
  )
}
