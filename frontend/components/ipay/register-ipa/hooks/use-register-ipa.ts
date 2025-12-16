'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  toHex,
  concat,
  pad,
  parseEther,
  type Address,
} from 'viem'
import { useAccount, useWalletClient, useChainId } from '@/lib/web3'
import {
  type RegistrationStep,
  type RegistrationFormState,
  type IPMetadataInput,
  type LicenseConfig,
  type SubmissionStep,
  INITIAL_FORM_STATE,
  REGISTRATION_STEPS,
} from '../types'
import {
  IPAY_RECEIVER_ADDRESS,
  STORY_DOMAIN,
  OP_MINT_AND_REGISTER_IP,
} from '@/constants/ipay'
import { STORY_CONTRACTS } from '@/constants/protocols/story'
import { SELF_HOSTED_DEPLOYMENTS } from '@/constants/hyperlane/self-hosted'

// Hyperlane Mailbox dispatch ABI
const MAILBOX_ABI = [
  {
    name: 'dispatch',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'recipientAddress', type: 'bytes32' },
      { name: 'messageBody', type: 'bytes' },
    ],
    outputs: [{ name: 'messageId', type: 'bytes32' }],
  },
  {
    name: 'quoteDispatch',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'recipientAddress', type: 'bytes32' },
      { name: 'messageBody', type: 'bytes' },
    ],
    outputs: [{ name: 'fee', type: 'uint256' }],
  },
] as const

// PIL License Terms tuple type for ABI encoding
const PIL_TERMS_TUPLE = {
  type: 'tuple',
  components: [
    { type: 'bool', name: 'transferable' },
    { type: 'address', name: 'royaltyPolicy' },
    { type: 'uint256', name: 'defaultMintingFee' },
    { type: 'uint256', name: 'expiration' },
    { type: 'bool', name: 'commercialUse' },
    { type: 'bool', name: 'commercialAttribution' },
    { type: 'address', name: 'commercializerChecker' },
    { type: 'bytes', name: 'commercializerCheckerData' },
    { type: 'uint32', name: 'commercialRevShare' },
    { type: 'uint256', name: 'commercialRevCeiling' },
    { type: 'bool', name: 'derivativesAllowed' },
    { type: 'bool', name: 'derivativesAttribution' },
    { type: 'bool', name: 'derivativesApproval' },
    { type: 'bool', name: 'derivativesReciprocal' },
    { type: 'uint256', name: 'derivativeRevCeiling' },
    { type: 'address', name: 'currency' },
    { type: 'string', name: 'uri' },
  ],
} as const

/**
 * Encode license terms for cross-chain message
 * Must be encoded as a tuple to match Solidity struct decoding
 */
function encodeLicenseTerms(config: LicenseConfig): `0x${string}` {
  const mintingFee = config.mintingFee ? parseEther(config.mintingFee) : 0n

  return encodeAbiParameters(
    [PIL_TERMS_TUPLE],
    [{
      transferable: true,
      royaltyPolicy: STORY_CONTRACTS.ROYALTY_POLICY_LAP,
      defaultMintingFee: mintingFee,
      expiration: 0n,
      commercialUse: config.commercialUse,
      commercialAttribution: config.commercialAttribution,
      commercializerChecker: '0x0000000000000000000000000000000000000000' as Address,
      commercializerCheckerData: '0x' as `0x${string}`,
      commercialRevShare: Math.floor(config.commercialRevShare * 100), // 0-100 percentage to basis points (10000 = 100%)
      commercialRevCeiling: 0n,
      derivativesAllowed: config.derivativesAllowed,
      derivativesAttribution: config.derivativesAttribution,
      derivativesApproval: config.derivativesApproval,
      derivativesReciprocal: config.derivativesReciprocal,
      derivativeRevCeiling: 0n,
      currency: STORY_CONTRACTS.WIP_TOKEN,
      uri: '',
    }]
  )
}

/**
 * Hook for managing IP Asset registration form state
 */
export function useRegisterIPA() {
  const { address } = useAccount()
  const { walletClient } = useWalletClient()
  const connectedChainId = useChainId()
  const [state, setState] = useState<RegistrationFormState>(INITIAL_FORM_STATE)

  // Sync sourceChainId with the connected chain automatically
  useEffect(() => {
    if (connectedChainId && connectedChainId !== state.sourceChainId) {
      setState((prev) => ({ ...prev, sourceChainId: connectedChainId }))
    }
  }, [connectedChainId, state.sourceChainId])

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
          return true
        case 'review':
          // Always valid - we use the connected chain automatically
          return true
        default:
          return false
      }
    },
    [state]
  )

  const isCurrentStepValid = isStepValid(state.currentStep)

  // Set submission step helper
  const setSubmissionStep = useCallback((step: SubmissionStep) => {
    setState((prev) => ({ ...prev, submissionStep: step }))
  }, [])

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
    setState((prev) => {
      if (prev.assetPreviewUrl) {
        URL.revokeObjectURL(prev.assetPreviewUrl)
      }
      return {
        ...prev,
        assetFile: file,
        assetPreviewUrl: file ? URL.createObjectURL(file) : null,
        assetIpfsHash: null,
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

  // Submit registration using user's wallet
  const submitRegistration = useCallback(async (): Promise<boolean> => {
    if (!address || !walletClient || !state.assetIpfsHash) {
      setState((prev) => ({
        ...prev,
        error: 'Missing required data for registration',
      }))
      return false
    }

    const deployment = SELF_HOSTED_DEPLOYMENTS[state.sourceChainId]
    if (!deployment) {
      setState((prev) => ({
        ...prev,
        error: `No Hyperlane deployment for chain: ${state.sourceChainId}`,
      }))
      return false
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      submissionStep: 'uploading-ip-metadata',
      error: null,
    }))

    try {
      // Step 1: Upload IP metadata to IPFS
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

      const ipMetadataRes = await fetch('/api/ipfs/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: ipMetadata, name: `ip-metadata-${Date.now()}` }),
      })

      if (!ipMetadataRes.ok) throw new Error('Failed to upload IP metadata')
      const { ipfsHash: ipMetadataHash } = await ipMetadataRes.json()

      // Step 2: Upload NFT metadata to IPFS
      setSubmissionStep('uploading-nft-metadata')

      const nftMetadata = {
        name: state.metadata.title,
        description: state.metadata.description,
        image: `https://ipfs.io/ipfs/${state.assetIpfsHash}`,
        attributes: [
          { trait_type: 'Category', value: state.metadata.category },
          { trait_type: 'Creator', value: state.metadata.creatorName },
        ],
      }

      const nftMetadataRes = await fetch('/api/ipfs/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: nftMetadata, name: `nft-metadata-${Date.now()}` }),
      })

      if (!nftMetadataRes.ok) throw new Error('Failed to upload NFT metadata')
      const { ipfsHash: nftMetadataHash } = await nftMetadataRes.json()

      // Step 3: Prepare cross-chain message
      setSubmissionStep('preparing-transaction')

      const ipMetadataUri = `https://ipfs.io/ipfs/${ipMetadataHash}`
      const nftMetadataUri = `https://ipfs.io/ipfs/${nftMetadataHash}`

      // Generate message ID
      const messageId = keccak256(
        toHex(`mint-register-ip-${address}-${Date.now()}`)
      )

      // Encode license terms
      const encodedLicenseTerms = encodeLicenseTerms(state.licenseConfig)

      // Encode payload
      // NOTE: collectionParams is the 6th param - empty bytes means use existing/default collection
      const collectionParams = '0x' as `0x${string}` // Empty bytes = use existing collection or default SPG NFT
      const payload = encodeAbiParameters(
        [
          { type: 'bytes32', name: 'messageId' },
          { type: 'address', name: 'creator' },
          { type: 'string', name: 'ipMetadataUri' },
          { type: 'string', name: 'nftMetadataUri' },
          { type: 'bytes', name: 'licenseTerms' },
          { type: 'bytes', name: 'collectionParams' }, // Required 6th param
        ],
        [messageId, address, ipMetadataUri, nftMetadataUri, encodedLicenseTerms, collectionParams]
      )

      // Prepend operation type (OP_MINT_AND_REGISTER_IP = 9)
      const messageBody = concat([toHex(OP_MINT_AND_REGISTER_IP, { size: 1 }), payload])

      // Recipient as bytes32
      const recipientBytes32 = pad(IPAY_RECEIVER_ADDRESS, { size: 32 })

      // Quote the dispatch fee using publicClient for the source chain
      // We need to create a client for reading from source chain
      const { createPublicClient, http } = await import('viem')
      const { getChainById } = await import('@/lib/config/chains')

      const chainConfig = getChainById(state.sourceChainId)
      if (!chainConfig?.rpcUrl) {
        throw new Error(`No RPC URL configured for chain ${state.sourceChainId}`)
      }

      const sourcePublicClient = createPublicClient({
        transport: http(chainConfig.rpcUrl),
      })

      const fee = await sourcePublicClient.readContract({
        address: deployment.mailbox as Address,
        abi: MAILBOX_ABI,
        functionName: 'quoteDispatch',
        args: [STORY_DOMAIN, recipientBytes32, messageBody],
      })

      // Step 4: Request signature
      setSubmissionStep('awaiting-signature')

      const data = encodeFunctionData({
        abi: MAILBOX_ABI,
        functionName: 'dispatch',
        args: [STORY_DOMAIN, recipientBytes32, messageBody],
      })

      // Step 5: Send transaction
      setSubmissionStep('broadcasting')

      const hash = await walletClient.sendTransaction({
        to: deployment.mailbox as Address,
        data,
        value: fee,
        chain: null, // Use wallet's current chain
        account: address,
      })

      setState((prev) => ({ ...prev, txHash: hash }))

      // Step 6: Wait for source chain confirmation
      setSubmissionStep('dispatched')

      await sourcePublicClient.waitForTransactionReceipt({ hash })

      // Step 7: Message is now in transit to Story Protocol
      setSubmissionStep('in-transit')

      // Since we're using a local relayer, we can't track the message via Hyperlane API
      // The message will be processed by the relayer and delivered to Story
      // For now, we'll mark as complete after a short delay to indicate dispatch success
      // In production, you could poll the destination chain for the IP registration event

      // Give user time to see "in-transit" state
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mark as complete - the cross-chain message has been dispatched
      setSubmissionStep('complete')
      setState((prev) => ({ ...prev, isSubmitting: false }))
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      const message = error instanceof Error ? error.message : 'Registration failed'
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        submissionStep: 'error',
        error: message,
      }))
      return false
    }
  }, [address, walletClient, state, setSubmissionStep])

  // Reset form
  const reset = useCallback(() => {
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
    connectedChainId, // Current connected chain (used automatically)

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
