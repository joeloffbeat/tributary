'use client'

import { useState, useEffect, useCallback } from 'react'
import { parseUnits } from 'viem'
import { useAccount, useWalletClient, usePublicClient } from '@/lib/web3'
import { fetchUserIPAssets, uploadFileToIPFS, uploadToIPFS } from '@/lib/services/story-service'
import type { IPAsset } from '@/lib/types/story'
import type { CreateListingParams, IPCategory } from '../types'
import {
  IPAY_REGISTRY_ADDRESS,
  IPAY_REGISTRY_ABI,
  USDC_DECIMALS,
  IPAY_CHAINS,
} from '../constants'
import { toast } from 'sonner'

export interface UseIPayListingReturn {
  storyAssets: IPAsset[]
  isLoadingAssets: boolean
  assetsError: string | null
  createListing: (params: CreateListingParams, storyIPId: string) => Promise<string | null>
  isCreating: boolean
  refetchAssets: () => Promise<void>
}

/**
 * Hook for managing IP listings - fetching Story assets and creating new listings
 */
export function useIPayListing(): UseIPayListingReturn {
  const { address, isConnected } = useAccount()
  const { walletClient } = useWalletClient()
  const { publicClient } = usePublicClient()

  const [storyAssets, setStoryAssets] = useState<IPAsset[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(false)
  const [assetsError, setAssetsError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Fetch user's Story Protocol IP assets
  const fetchAssets = useCallback(async () => {
    if (!address) {
      setStoryAssets([])
      return
    }

    setIsLoadingAssets(true)
    setAssetsError(null)

    try {
      const assets = await fetchUserIPAssets(address, { includeLicenses: true })
      // Filter to assets with commercial licenses that can be monetized
      const monetizableAssets = assets.filter(
        (asset) =>
          asset.licenses?.some(
            (license) => license.terms?.commercialUse || license.terms?.derivativesAllowed
          )
      )
      setStoryAssets(monetizableAssets)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch IP assets'
      setAssetsError(message)
      console.error('Error fetching Story assets:', err)
    } finally {
      setIsLoadingAssets(false)
    }
  }, [address])

  // Fetch assets when address changes
  useEffect(() => {
    if (isConnected && address) {
      fetchAssets()
    } else {
      setStoryAssets([])
    }
  }, [isConnected, address, fetchAssets])

  // Create a new listing on the IPay Registry
  const createListing = useCallback(
    async (params: CreateListingParams, storyIPId: string): Promise<string | null> => {
      if (!walletClient || !publicClient || !address) {
        toast.error('Please connect your wallet')
        return null
      }

      setIsCreating(true)

      try {
        // Step 1: Upload asset file to IPFS
        toast.info('Uploading asset to IPFS...')
        const assetResult = await uploadFileToIPFS(params.assetFile, params.title)

        // Step 2: Upload preview image if provided
        let imageUrl = ''
        if (params.imageFile) {
          toast.info('Uploading preview image...')
          const imageResult = await uploadFileToIPFS(params.imageFile, `${params.title}-preview`)
          imageUrl = imageResult.url
        }

        // Step 3: Create and upload metadata JSON
        toast.info('Creating metadata...')
        const metadata = {
          title: params.title,
          description: params.description,
          category: params.category,
          imageUrl,
          assetIpfsHash: assetResult.ipfsHash,
          licenseType: params.licenseType,
          createdAt: Date.now(),
        }
        const metadataResult = await uploadToIPFS(metadata, `${params.title}-metadata`)

        // Step 4: Parse price to USDC units (6 decimals)
        const priceInUnits = parseUnits(params.pricePerUse, USDC_DECIMALS)

        // Step 5: Create listing on-chain
        toast.info('Creating listing on-chain...')
        const hash = await walletClient.writeContract({
          address: IPAY_REGISTRY_ADDRESS,
          abi: IPAY_REGISTRY_ABI,
          functionName: 'createListing',
          args: [
            storyIPId as `0x${string}`,
            params.title,
            params.description,
            params.category,
            priceInUnits,
            assetResult.ipfsHash,
            metadataResult.url,
          ],
          chain: { id: IPAY_CHAINS.STORY_AENEID } as any,
        })

        // Wait for transaction confirmation
        toast.info('Waiting for confirmation...')
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        if (receipt.status === 'success') {
          toast.success('Listing created successfully!')
          await fetchAssets() // Refresh assets
          return hash
        } else {
          throw new Error('Transaction failed')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create listing'
        toast.error(message)
        console.error('Error creating listing:', err)
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [walletClient, publicClient, address, fetchAssets]
  )

  return {
    storyAssets,
    isLoadingAssets,
    assetsError,
    createListing,
    isCreating,
    refetchAssets: fetchAssets,
  }
}

export default useIPayListing
