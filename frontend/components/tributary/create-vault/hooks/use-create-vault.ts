'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from '@/lib/web3'
import { getVaultByIPId } from '@/lib/services/tributary'
import type { VaultCreationStep, VaultFormData, StoryIPAsset, UseCreateVaultReturn } from '../types'
import { VAULT_CREATION_STEPS } from '../types'

const INITIAL_FORM_DATA: VaultFormData = {
  selectedIP: null,
  tokenName: '',
  tokenSymbol: '',
  totalSupply: '1000000',
  creatorAllocation: '20',
  saleEnabled: true,
  pricePerToken: '0.01',
  saleCap: '800000',
  startTime: undefined,
  endTime: undefined,
  isSubmitting: false,
  submissionStep: 'idle',
  txHash: null,
  error: null,
}

export function useCreateVault(): UseCreateVaultReturn {
  const { address } = useAccount()
  const [formData, setFormData] = useState<VaultFormData>(INITIAL_FORM_DATA)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [userIPAssets, setUserIPAssets] = useState<StoryIPAsset[]>([])
  const [isLoadingIPs, setIsLoadingIPs] = useState(false)
  const [ipAlreadyHasVault, setIpAlreadyHasVault] = useState(false)

  const currentStep = VAULT_CREATION_STEPS[currentStepIndex].id

  // Fetch user's IP assets on mount
  useEffect(() => {
    if (!address) return
    const fetchIPs = async () => {
      setIsLoadingIPs(true)
      try {
        // TODO: Query Story Protocol subgraph for user's IP assets
        // const assets = await storyService.getIPAssetsByOwner(address)
        // setUserIPAssets(assets)
      } catch (err) {
        console.error('Failed to fetch IP assets:', err)
      } finally {
        setIsLoadingIPs(false)
      }
    }
    fetchIPs()
  }, [address])

  // Check if selected IP already has a vault
  useEffect(() => {
    if (!formData.selectedIP) {
      setIpAlreadyHasVault(false)
      return
    }
    const checkVault = async () => {
      try {
        const vaultAddress = await getVaultByIPId(formData.selectedIP!.id)
        setIpAlreadyHasVault(vaultAddress !== zeroAddress)
      } catch {
        setIpAlreadyHasVault(false)
      }
    }
    checkVault()
  }, [formData.selectedIP])

  // Step validation
  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 'ip-selection':
        return !!formData.selectedIP && !ipAlreadyHasVault
      case 'token-config':
        return !!formData.tokenName && !!formData.tokenSymbol &&
               parseFloat(formData.totalSupply) > 0 &&
               parseFloat(formData.creatorAllocation) >= 0 &&
               parseFloat(formData.creatorAllocation) <= 100
      case 'sale-config':
        if (!formData.saleEnabled) return true
        return parseFloat(formData.pricePerToken) > 0 &&
               parseFloat(formData.saleCap) > 0
      case 'review':
        return true
      default:
        return false
    }
  }, [currentStep, formData, ipAlreadyHasVault])

  // Navigation
  const goNext = useCallback(() => {
    if (currentStepIndex < VAULT_CREATION_STEPS.length - 1 && isCurrentStepValid) {
      setCurrentStepIndex(i => i + 1)
    }
  }, [currentStepIndex, isCurrentStepValid])

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) setCurrentStepIndex(i => i - 1)
  }, [currentStepIndex])

  const goToStep = useCallback((step: VaultCreationStep) => {
    const index = VAULT_CREATION_STEPS.findIndex(s => s.id === step)
    if (index >= 0 && index <= currentStepIndex) {
      setCurrentStepIndex(index)
    }
  }, [currentStepIndex])

  // Form updates
  const setSelectedIP = useCallback((ip: StoryIPAsset | null) => {
    setFormData(prev => ({
      ...prev,
      selectedIP: ip,
      // Auto-populate token name from IP
      tokenName: ip?.metadata?.name ? `${ip.metadata.name} Royalty` : prev.tokenName,
      tokenSymbol: ip?.metadata?.name
        ? ip.metadata.name.substring(0, 4).toUpperCase() + '-ROY'
        : prev.tokenSymbol,
    }))
  }, [])

  const updateTokenConfig = useCallback((field: keyof VaultFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const updateSaleConfig = useCallback((field: keyof VaultFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Submit vault creation
  const submitVault = useCallback(async () => {
    if (!formData.selectedIP) return
    setFormData(prev => ({ ...prev, isSubmitting: true, submissionStep: 'creating-vault' }))

    try {
      // TODO: Implement vault creation via tributaryService
      // const result = await tributaryService.createVault({
      //   storyIPId: formData.selectedIP.id,
      //   name: formData.tokenName,
      //   symbol: formData.tokenSymbol,
      //   totalSupply: parseFloat(formData.totalSupply),
      //   creatorAllocation: parseFloat(formData.creatorAllocation),
      // })

      setFormData(prev => ({ ...prev, submissionStep: 'complete' }))
    } catch (err) {
      setFormData(prev => ({
        ...prev,
        submissionStep: 'error',
        error: err instanceof Error ? err.message : 'Failed to create vault',
      }))
    }
  }, [formData])

  const reset = useCallback(() => {
    setFormData(INITIAL_FORM_DATA)
    setCurrentStepIndex(0)
  }, [])

  return {
    formData,
    currentStep,
    currentStepIndex,
    goNext,
    goBack,
    goToStep,
    canGoBack: currentStepIndex > 0,
    isLastStep: currentStepIndex === VAULT_CREATION_STEPS.length - 1,
    isCurrentStepValid,
    setSelectedIP,
    isLoadingIPs,
    userIPAssets,
    ipAlreadyHasVault,
    updateTokenConfig,
    updateSaleConfig,
    submitVault,
    reset,
  }
}
