'use client'

import { useState } from 'react'
import { ArrowLeft, CheckCircle, ImageIcon, FileText, DollarSign, Tag, Loader2 } from 'lucide-react'
import { parseUnits } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TransactionDialog } from '@/components/web3'
import { useAccount, useChainId } from '@/lib/web3'
import { uploadFileToIPFS, uploadToIPFS } from '@/lib/services/story-service'
import { toast } from 'sonner'
import {
  IPAY_REGISTRY_ADDRESS,
  IPAY_REGISTRY_ABI,
  IP_CATEGORIES,
  USDC_DECIMALS,
  getCategoryInfo,
} from '../../constants'
import type { IPAsset } from '@/lib/types/story'
import type { CreateListingParams } from '../../types'

interface StepReviewProps {
  selectedIP: IPAsset
  listingParams: CreateListingParams
  onSuccess: () => void
  onBack: () => void
}

export function StepReview({ selectedIP, listingParams, onSuccess, onBack }: StepReviewProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedData, setUploadedData] = useState<{
    assetIpfsHash: string
    metadataUri: string
  } | null>(null)
  const [showTxDialog, setShowTxDialog] = useState(false)

  const categoryInfo = getCategoryInfo(listingParams.category)
  const priceInUnits = parseUnits(listingParams.pricePerUse, USDC_DECIMALS)

  const handleUploadAndPrepare = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    setIsUploading(true)

    try {
      // Upload asset file to IPFS
      toast.info('Uploading asset to IPFS...')
      const assetResult = await uploadFileToIPFS(listingParams.assetFile, listingParams.title)

      // Upload preview image if provided
      let imageUrl = ''
      if (listingParams.imageFile) {
        toast.info('Uploading preview image...')
        const imageResult = await uploadFileToIPFS(
          listingParams.imageFile,
          `${listingParams.title}-preview`
        )
        imageUrl = imageResult.url
      }

      // Create and upload metadata JSON
      toast.info('Creating metadata...')
      const metadata = {
        title: listingParams.title,
        description: listingParams.description,
        category: listingParams.category,
        imageUrl,
        assetIpfsHash: assetResult.ipfsHash,
        licenseType: listingParams.licenseType,
        createdAt: Date.now(),
      }
      const metadataResult = await uploadToIPFS(metadata, `${listingParams.title}-metadata`)

      setUploadedData({
        assetIpfsHash: assetResult.ipfsHash,
        metadataUri: metadataResult.url,
      })

      toast.success('Files uploaded successfully!')
      setShowTxDialog(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload files'
      toast.error(message)
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const txParams = uploadedData
    ? {
        address: IPAY_REGISTRY_ADDRESS,
        abi: IPAY_REGISTRY_ABI,
        functionName: 'createListing',
        args: [
          selectedIP.ipId as `0x${string}`,
          listingParams.title,
          listingParams.description,
          listingParams.category,
          priceInUnits,
          uploadedData.assetIpfsHash,
          uploadedData.metadataUri,
        ],
      }
    : null

  return (
    <div className="space-y-6">
      {/* Review Header */}
      <div className="text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">Review Your Listing</h3>
        <p className="text-muted-foreground">
          Please review the details below before creating your listing
        </p>
      </div>

      {/* IP Asset Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            IP Asset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {selectedIP.nftMetadata?.image?.cachedUrl || selectedIP.metadata?.image ? (
                <img
                  src={selectedIP.nftMetadata?.image?.cachedUrl || selectedIP.metadata?.image}
                  alt="IP"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {selectedIP.nftMetadata?.name || selectedIP.metadata?.name || 'Untitled IP'}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {selectedIP.ipId.slice(0, 14)}...{selectedIP.ipId.slice(-12)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listing Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Listing Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Title" value={listingParams.title} />
          <DetailRow label="Description" value={listingParams.description} multiline />
          <DetailRow
            label="Category"
            value={
              <Badge variant="secondary">
                {categoryInfo?.icon} {categoryInfo?.label}
              </Badge>
            }
          />
          <DetailRow
            label="License Type"
            value={
              <Badge variant="outline">
                {listingParams.licenseType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            }
          />
        </CardContent>
      </Card>

      {/* Pricing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Price per Use</span>
            <span className="text-2xl font-bold">{listingParams.pricePerUse} USDC</span>
          </div>
        </CardContent>
      </Card>

      {/* Files Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Asset File</p>
              <p className="text-xs text-muted-foreground">{listingParams.assetFile.name}</p>
            </div>
            <Badge variant="secondary">
              {(listingParams.assetFile.size / 1024 / 1024).toFixed(2)} MB
            </Badge>
          </div>
          {listingParams.imageFile && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Preview Image</p>
                <p className="text-xs text-muted-foreground">{listingParams.imageFile.name}</p>
              </div>
              <Badge variant="secondary">
                {(listingParams.imageFile.size / 1024 / 1024).toFixed(2)} MB
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isUploading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleUploadAndPrepare} disabled={isUploading} size="lg">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Listing
            </>
          )}
        </Button>
      </div>

      {/* Transaction Dialog */}
      {txParams && (
        <TransactionDialog
          open={showTxDialog}
          onOpenChange={setShowTxDialog}
          params={txParams}
          chainId={chainId || 43113}
          onSuccess={() => {
            toast.success('Listing created successfully!')
            onSuccess()
          }}
          onError={(error) => {
            toast.error(error.message || 'Transaction failed')
          }}
        />
      )}
    </div>
  )
}

interface DetailRowProps {
  label: string
  value: React.ReactNode
  multiline?: boolean
}

function DetailRow({ label, value, multiline }: DetailRowProps) {
  return (
    <div className={multiline ? 'space-y-1' : 'flex items-center justify-between'}>
      <span className="text-sm text-muted-foreground">{label}</span>
      {multiline ? (
        <p className="text-sm">{value}</p>
      ) : (
        <span className="text-sm font-medium">{value}</span>
      )}
    </div>
  )
}

export default StepReview
