'use client'

import { useState, useCallback, useMemo } from 'react'
import { useAccount } from '@/lib/web3'
import {
  type RegistrationStep,
  type RegistrationFormState,
  type IPMetadataInput,
  type LicenseConfig,
  type RegisterIPRequest,
  INITIAL_FORM_STATE,
  REGISTRATION_STEPS,
} from '../types'

/**
 * Hook for managing IP Asset registration form state
 */
export function useRegisterIPA() {
  const { address } = useAccount()
  const [state, setState] = useState<RegistrationFormState>(INITIAL_FORM_STATE)

  // Current step index
  const currentStepIndex = useMemo(() => {
    return REGISTRATION_STEPS.findIndex((s) => s.id === state.currentStep)
  }, [state.currentStep])

  // Navigation helpers
  const canGoBack = currentStepIndex > 0
  const canGoForward = currentStepIndex < REGISTRATION_STEPS.length - 1
  const isLastStep = currentStepIndex === REGISTRATION_STEPS.length - 1

  // Step validation
  const isStepValid = useCallback(
    (step: RegistrationStep): boolean => {
      switch (step) {
        case 'upload':
          return state.assetFile !== null
        case 'metadata':
          return (
            state.metadata.title.trim().length > 0 &&
            state.metadata.description.trim().length > 0 &&
            state.metadata.creatorName.trim().length > 0
          )
        case 'license':
          // License is always valid (has defaults)
          return true
        case 'review':
          return state.sourceChainId !== null
        default:
          return false
      }
    },
    [state]
  )

  const isCurrentStepValid = isStepValid(state.currentStep)

  // Navigation
  const goToStep = useCallback((step: RegistrationStep) => {
    setState((prev) => ({ ...prev, currentStep: step, error: null }))
  }, [])

  const goNext = useCallback(() => {
    if (canGoForward && isCurrentStepValid) {
      const nextStep = REGISTRATION_STEPS[currentStepIndex + 1].id
      goToStep(nextStep)
    }
  }, [canGoForward, isCurrentStepValid, currentStepIndex, goToStep])

  const goBack = useCallback(() => {
    if (canGoBack) {
      const prevStep = REGISTRATION_STEPS[currentStepIndex - 1].id
      goToStep(prevStep)
    }
  }, [canGoBack, currentStepIndex, goToStep])

  // Asset file handling
  const setAssetFile = useCallback((file: File | null) => {
    // Revoke old preview URL
    setState((prev) => {
      if (prev.assetPreviewUrl) {
        URL.revokeObjectURL(prev.assetPreviewUrl)
      }
      return {
        ...prev,
        assetFile: file,
        assetPreviewUrl: file ? URL.createObjectURL(file) : null,
        assetIpfsHash: null, // Reset on new file
        error: null,
      }
    })
  }, [])

  // Upload asset to IPFS
  const uploadAsset = useCallback(async (): Promise<string | null> => {
    if (!state.assetFile) return null

    setState((prev) => ({ ...prev, isUploading: true, error: null }))

    try {
      const formData = new FormData()
      formData.append('file', state.assetFile)

      const response = await fetch('/api/ipfs/file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload asset to IPFS')
      }

      const { ipfsHash } = await response.json()
      setState((prev) => ({
        ...prev,
        assetIpfsHash: ipfsHash,
        isUploading: false,
      }))
      return ipfsHash
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      setState((prev) => ({ ...prev, isUploading: false, error: message }))
      return null
    }
  }, [state.assetFile])

  // Metadata handling
  const setMetadata = useCallback((metadata: Partial<IPMetadataInput>) => {
    setState((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, ...metadata },
      error: null,
    }))
  }, [])

  // License handling
  const setLicenseConfig = useCallback((config: Partial<LicenseConfig>) => {
    setState((prev) => ({
      ...prev,
      licenseConfig: { ...prev.licenseConfig, ...config },
      error: null,
    }))
  }, [])

  // Chain selection
  const setSourceChainId = useCallback((chainId: number) => {
    setState((prev) => ({ ...prev, sourceChainId: chainId, error: null }))
  }, [])

  // Submit registration
  const submitRegistration = useCallback(async (): Promise<boolean> => {
    if (!address || !state.assetIpfsHash) {
      setState((prev) => ({
        ...prev,
        error: 'Missing required data for registration',
      }))
      return false
    }

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))

    try {
      // Build IP metadata for IPFS
      const ipMetadata = {
        title: state.metadata.title,
        description: state.metadata.description,
        ipType: state.metadata.category,
        image: `https://ipfs.io/ipfs/${state.assetIpfsHash}`,
        mediaUrl: `https://ipfs.io/ipfs/${state.assetIpfsHash}`,
        creators: [
          {
            name: state.metadata.creatorName,
            address: address,
            contributionPercent: 100,
          },
        ],
        tags: state.metadata.tags,
        createdAt: new Date().toISOString(),
      }

      // Upload IP metadata to IPFS
      const ipMetadataRes = await fetch('/api/ipfs/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ipMetadata),
      })

      if (!ipMetadataRes.ok) throw new Error('Failed to upload IP metadata')
      const { ipfsHash: ipMetadataHash } = await ipMetadataRes.json()

      // Build NFT metadata for IPFS
      const nftMetadata = {
        name: state.metadata.title,
        description: state.metadata.description,
        image: `https://ipfs.io/ipfs/${state.assetIpfsHash}`,
        attributes: [
          { trait_type: 'Category', value: state.metadata.category },
          { trait_type: 'Creator', value: state.metadata.creatorName },
        ],
      }

      // Upload NFT metadata to IPFS
      const nftMetadataRes = await fetch('/api/ipfs/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nftMetadata),
      })

      if (!nftMetadataRes.ok) throw new Error('Failed to upload NFT metadata')
      const { ipfsHash: nftMetadataHash } = await nftMetadataRes.json()

      // Submit to API for cross-chain registration
      const request: RegisterIPRequest = {
        sourceChainId: state.sourceChainId,
        creator: address,
        ipMetadataUri: `https://ipfs.io/ipfs/${ipMetadataHash}`,
        nftMetadataUri: `https://ipfs.io/ipfs/${nftMetadataHash}`,
        licenseTerms: {
          commercialUse: state.licenseConfig.commercialUse,
          commercialAttribution: state.licenseConfig.commercialAttribution,
          commercialRevShare: state.licenseConfig.commercialRevShare,
          derivativesAllowed: state.licenseConfig.derivativesAllowed,
          derivativesAttribution: state.licenseConfig.derivativesAttribution,
          derivativesApproval: state.licenseConfig.derivativesApproval,
          derivativesReciprocal: state.licenseConfig.derivativesReciprocal,
          defaultMintingFee: state.licenseConfig.mintingFee,
        },
      }

      const registerRes = await fetch('/api/ipay/register-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!registerRes.ok) throw new Error('Failed to submit registration')

      setState((prev) => ({ ...prev, isSubmitting: false }))
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      setState((prev) => ({ ...prev, isSubmitting: false, error: message }))
      return false
    }
  }, [address, state])

  // Reset form
  const reset = useCallback(() => {
    // Revoke preview URL
    if (state.assetPreviewUrl) {
      URL.revokeObjectURL(state.assetPreviewUrl)
    }
    setState(INITIAL_FORM_STATE)
  }, [state.assetPreviewUrl])

  // Set error
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  return {
    // State
    ...state,
    currentStepIndex,
    steps: REGISTRATION_STEPS,

    // Validation
    isCurrentStepValid,
    isStepValid,
    canGoBack,
    canGoForward,
    isLastStep,

    // Navigation
    goToStep,
    goNext,
    goBack,

    // Actions
    setAssetFile,
    uploadAsset,
    setMetadata,
    setLicenseConfig,
    setSourceChainId,
    submitRegistration,
    reset,
    setError,
  }
}

export type UseRegisterIPAReturn = ReturnType<typeof useRegisterIPA>
