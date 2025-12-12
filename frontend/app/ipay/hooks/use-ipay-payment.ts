'use client'

import { useState, useCallback } from 'react'
import { wrapFetchWithPayment } from 'thirdweb/x402'
import { useAccount, useThirdwebWallet, thirdwebClient } from '@/lib/web3'
import { createNormalizedFetch } from '@/lib/utils/x402-payment'
import type { IPListing, UsageReceipt, IPPayStep } from '../types'
import { IPAY_CHAINS, USDC_FUJI_ADDRESS } from '../constants'
import { toast } from 'sonner'

export interface PaymentResult {
  success: boolean
  txHash?: string
  receipt?: UsageReceipt
  error?: string
}

export interface UseIPayPaymentReturn {
  payForIP: (listing: IPListing) => Promise<PaymentResult>
  isPaying: boolean
  currentStep: IPPayStep | null
  steps: IPPayStep[]
  lastReceipt: UsageReceipt | null
  error: string | null
  resetPayment: () => void
}

const INITIAL_STEPS: IPPayStep[] = [
  { id: 'approve', label: 'Approve USDC', status: 'pending' },
  { id: 'pay', label: 'Process Payment', status: 'pending' },
  { id: 'confirm', label: 'Confirm Access', status: 'pending' },
]

/**
 * Hook for paying for IP assets using x402 payment protocol
 */
export function useIPayPayment(): UseIPayPaymentReturn {
  const { address, isConnected } = useAccount()
  const wallet = useThirdwebWallet()

  const [isPaying, setIsPaying] = useState(false)
  const [steps, setSteps] = useState<IPPayStep[]>(INITIAL_STEPS)
  const [currentStep, setCurrentStep] = useState<IPPayStep | null>(null)
  const [lastReceipt, setLastReceipt] = useState<UsageReceipt | null>(null)
  const [error, setError] = useState<string | null>(null)

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
        // Step 1: Approve USDC
        updateStep('approve', 'in_progress')
        toast.info('Preparing payment...')

        // Create normalized fetch for signature compatibility
        const normalizedFetch = createNormalizedFetch(IPAY_CHAINS.AVALANCHE_FUJI)

        // Wrap fetch with x402 payment
        const fetchWithPay = wrapFetchWithPayment(normalizedFetch, thirdwebClient, wallet, {
          maxValue: listing.pricePerUse,
        })

        updateStep('approve', 'completed')

        // Step 2: Process payment via x402 API
        updateStep('pay', 'in_progress')
        toast.info('Processing payment...')

        // Call the IPay payment endpoint
        const paymentUrl = `/api/ipay/pay/${listing.id}`
        const response = await fetchWithPay(paymentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId: listing.id,
            buyer: address,
          }),
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
    [isConnected, address, wallet, updateStep, resetPayment, steps]
  )

  return {
    payForIP,
    isPaying,
    currentStep,
    steps,
    lastReceipt,
    error,
    resetPayment,
  }
}

export default useIPayPayment
