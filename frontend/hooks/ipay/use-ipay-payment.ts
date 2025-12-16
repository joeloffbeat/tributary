'use client'

import { useState, useCallback, useEffect } from 'react'
import { wrapFetchWithPayment } from 'thirdweb/x402'
import { useAccount, useThirdwebWallet, thirdwebClient, useChainId } from '@/lib/web3'
import { createNormalizedFetch } from '@/lib/utils/x402-payment'
import type { IPListing, UsageReceipt, IPPayStep } from '@/lib/types/ipay'
import {
  DEFAULT_SOURCE_CHAIN_ID,
  getIPayChainConfig,
  getAllSupportedChains,
  getSupportedChainIds,
  type IPayChainConfig,
} from '@/constants/ipay'
import { toast } from 'sonner'

export interface PaymentResult {
  success: boolean
  txHash?: string
  receipt?: UsageReceipt
  error?: string
  sourceChainId?: number
}

export interface UseIPayPaymentReturn {
  payForIP: (listing: IPListing) => Promise<PaymentResult>
  isPaying: boolean
  currentStep: IPPayStep | null
  steps: IPPayStep[]
  lastReceipt: UsageReceipt | null
  error: string | null
  resetPayment: () => void
  // Chain selection
  selectedChainId: number
  setSelectedChainId: (chainId: number) => void
  selectedChain: IPayChainConfig | undefined
  supportedChains: IPayChainConfig[]
  supportedChainIds: number[]
}

const INITIAL_STEPS: IPPayStep[] = [
  { id: 'approve', label: 'Approve USDC', status: 'pending' },
  { id: 'pay', label: 'Process Payment', status: 'pending' },
  { id: 'confirm', label: 'Confirm Access', status: 'pending' },
]

/**
 * Hook for paying for IP assets using x402 payment protocol
 * Supports multi-chain payments from Avalanche Fuji, ETH Sepolia, and Polygon Amoy
 */
export function useIPayPayment(): UseIPayPaymentReturn {
  const { address, isConnected } = useAccount()
  const wallet = useThirdwebWallet()
  const connectedChainId = useChainId()

  const [isPaying, setIsPaying] = useState(false)
  const [steps, setSteps] = useState<IPPayStep[]>(INITIAL_STEPS)
  const [currentStep, setCurrentStep] = useState<IPPayStep | null>(null)
  const [lastReceipt, setLastReceipt] = useState<UsageReceipt | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Chain selection state - auto-synced with connected chain
  const [selectedChainId, setSelectedChainId] = useState<number>(DEFAULT_SOURCE_CHAIN_ID)

  // Sync selectedChainId with connected chain
  useEffect(() => {
    if (connectedChainId && connectedChainId !== selectedChainId) {
      setSelectedChainId(connectedChainId)
    }
  }, [connectedChainId, selectedChainId])

  const selectedChain = getIPayChainConfig(selectedChainId)
  const supportedChains = getAllSupportedChains()
  const supportedChainIds = getSupportedChainIds()

  // Update step status helper
  const updateStep = useCallback(
    (stepId: IPPayStep['id'], status: IPPayStep['status'], txHash?: string, error?: string) => {
      setSteps((prev) =>
        prev.map((step) => (step.id === stepId ? { ...step, status, txHash, error } : step))
      )
      if (status === 'in_progress') {
        setCurrentStep(INITIAL_STEPS.find((s) => s.id === stepId) || null)
      }
    },
    []
  )

  // Reset payment state
  const resetPayment = useCallback(() => {
    setSteps(INITIAL_STEPS)
    setCurrentStep(null)
    setError(null)
    setLastReceipt(null)
  }, [])

  // Main payment function using x402 protocol
  const payForIP = useCallback(
    async (listing: IPListing): Promise<PaymentResult> => {
      if (!isConnected || !address) {
        const err = 'Please connect your wallet'
        setError(err)
        return { success: false, error: err }
      }

      if (!wallet) {
        const err = 'Thirdweb wallet not available'
        setError(err)
        return { success: false, error: err }
      }

      if (!thirdwebClient) {
        const err = 'Thirdweb client not configured'
        setError(err)
        return { success: false, error: err }
      }

      setIsPaying(true)
      setError(null)
      resetPayment()

      try {
        // Validate selected chain
        if (!selectedChain) {
          throw new Error(`Invalid chain selected: ${selectedChainId}`)
        }

        // Step 1: Approve USDC
        updateStep('approve', 'in_progress')
        toast.info(`Preparing payment on ${selectedChain.displayName}...`)

        // Create normalized fetch for signature compatibility using selected chain
        const normalizedFetch = createNormalizedFetch(selectedChainId)

        // Wrap fetch with x402 payment
        const fetchWithPay = wrapFetchWithPayment(normalizedFetch, thirdwebClient, wallet, {
          maxValue: listing.pricePerUse,
        })

        updateStep('approve', 'completed')

        // Step 2: Process payment via x402 API
        updateStep('pay', 'in_progress')
        toast.info('Processing payment...')

        // Call the IPay payment endpoint with source chain
        const paymentUrl = `/api/ipay/pay/${listing.id}?sourceChain=${selectedChainId}&recipient=${address}`
        const response = await fetchWithPay(paymentUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-source-chain': String(selectedChainId),
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Payment failed: ${response.statusText}`)
        }

        const paymentData = await response.json()
        updateStep('pay', 'completed', paymentData.txHash)

        // Step 3: Confirm access
        updateStep('confirm', 'in_progress')
        toast.info('Confirming access...')

        // Create receipt
        const receipt: UsageReceipt = {
          id: `${listing.id}-${Date.now()}`,
          listingId: listing.id,
          user: address,
          amount: listing.pricePerUse,
          paymentTxHash: paymentData.txHash,
          timestamp: Math.floor(Date.now() / 1000),
        }

        setLastReceipt(receipt)
        updateStep('confirm', 'completed')

        toast.success('Payment successful! You now have access to this IP.')

        return {
          success: true,
          txHash: paymentData.txHash,
          receipt,
          sourceChainId: selectedChainId,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Payment failed'
        setError(message)
        toast.error(message)

        // Mark current step as failed
        const failedStep = steps.find((s) => s.status === 'in_progress')
        if (failedStep) {
          updateStep(failedStep.id, 'failed', undefined, message)
        }

        return { success: false, error: message }
      } finally {
        setIsPaying(false)
        setCurrentStep(null)
      }
    },
    [isConnected, address, wallet, updateStep, resetPayment, steps, selectedChainId, selectedChain]
  )

  return {
    payForIP,
    isPaying,
    currentStep,
    steps,
    lastReceipt,
    error,
    resetPayment,
    // Chain selection
    selectedChainId,
    setSelectedChainId,
    selectedChain,
    supportedChains,
    supportedChainIds,
  }
}

export default useIPayPayment
