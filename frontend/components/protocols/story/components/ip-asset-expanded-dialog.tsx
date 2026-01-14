'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { StoryIPAsset } from '@/lib/services/story-api-service'
import { getIPAssetDisplayName, getIPAssetImageUrl } from '@/lib/services/story-api-service'
import { IPAssetOverviewTab } from './dialog-tabs/ip-asset-overview-tab'
import { IPAssetLicenseTab } from './dialog-tabs/ip-asset-license-tab'
import { IPAssetActionsTab } from './dialog-tabs/ip-asset-actions-tab'

interface IPAssetExpandedDialogProps {
  asset: StoryIPAsset
  layoutId: string
  onClose: () => void
  onListForSale?: (asset: StoryIPAsset) => void
  onCreateDerivative?: (asset: StoryIPAsset) => void
  onRaiseDispute?: (asset: StoryIPAsset) => void
}

export function IPAssetExpandedDialog({
  asset,
  layoutId,
  onClose,
  onListForSale,
  onCreateDerivative,
  onRaiseDispute,
}: IPAssetExpandedDialogProps) {
  const imageUrl = getIPAssetImageUrl(asset)
  const name = getIPAssetDisplayName(asset)

  useEffect(() => {
    // Only close on Escape key, not on outside clicks
    // This allows dialogs (like CreateListingDialog) to open on top without closing this
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 grid place-items-center z-[100]">
        {/* Backdrop - no onClick, only X button closes the dialog */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Mobile close button */}
        <motion.button
          key={`button-${asset.ipId}-${layoutId}`}
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
          layoutId={`card-${asset.ipId}-${layoutId}`}
          className="w-full max-w-[700px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-card border rounded-3xl overflow-hidden shadow-2xl relative z-10"
        >
          {/* Header with image */}
          <DialogHeader
            asset={asset}
            layoutId={layoutId}
            imageUrl={imageUrl}
            name={name}
            onClose={onClose}
          />

          {/* Content - All data is already available from the asset */}
          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="overview" className="p-6">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="license">License</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <IPAssetOverviewTab asset={asset} />
              </TabsContent>

              <TabsContent value="license">
                <IPAssetLicenseTab asset={asset} />
              </TabsContent>

              <TabsContent value="actions">
                <IPAssetActionsTab
                  asset={asset}
                  onListForSale={onListForSale}
                  onCreateDerivative={onCreateDerivative}
                  onRaiseDispute={onRaiseDispute}
                />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Header component for the dialog
function DialogHeader({
  asset,
  layoutId,
  imageUrl,
  name,
  onClose,
}: {
  asset: StoryIPAsset
  layoutId: string
  imageUrl: string | null
  name: string
  onClose: () => void
}) {
  return (
    <div className="relative">
      <motion.div
        layoutId={`image-${asset.ipId}-${layoutId}`}
        className="h-48 lg:h-56 bg-muted"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-16 w-16 text-muted-foreground" />
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
          layoutId={`title-${asset.ipId}-${layoutId}`}
          className="text-xl font-semibold"
        >
          {name}
        </motion.h2>
      </div>
    </div>
  )
}
