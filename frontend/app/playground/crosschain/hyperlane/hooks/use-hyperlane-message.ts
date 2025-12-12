import { useState, useEffect, useCallback } from 'react'
import { stringToHex } from 'viem'
import { useAccount, usePublicClient } from '@/lib/web3'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import type { ContractCallParams } from '@/lib/web3/contracts'
import { MAILBOX_ABI } from '../constants'
import { extractMessageIdFromLogs } from '../utils'
import { createProgressSteps, updateStepStatus, type ProgressStep } from '../components/shared'
import type { ChainSelectOption, TrackedMessage, HyperlaneTxSuccess, HyperlaneMode } from '../types'

interface UseMessageParams {
  sourceChain: ChainSelectOption | null
  destChain: ChainSelectOption | null
  trackMessage: (message: TrackedMessage) => void
  hyperlaneMode: HyperlaneMode
}

export function useHyperlaneMessage({ sourceChain, destChain, trackMessage, hyperlaneMode }: UseMessageParams) {
  const { address, chain } = useAccount()
  const { publicClient } = usePublicClient()
  const chainId = chain?.id

  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<HyperlaneTxSuccess | null>(null)
  const [gasFee, setGasFee] = useState<bigint | null>(null)
  const [isLoadingFee, setIsLoadingFee] = useState(false)

  const [lastReceived, setLastReceived] = useState<{ sender: string; data: string } | null>(null)
  const [isLoadingReceived, setIsLoadingReceived] = useState(false)

  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [txParams, setTxParams] = useState<ContractCallParams | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  // Progress tracking state
  const [showProgress, setShowProgress] = useState(false)
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(createProgressSteps())
  const [progressMessageId, setProgressMessageId] = useState<string | null>(null)
  const [progressOriginTxHash, setProgressOriginTxHash] = useState<string | null>(null)

  // Ensure service mode is set correctly before deriving deployment info
  // This is needed because the mode prop might change after initial render
  hyperlaneService.setMode(hyperlaneMode)

  const destDeployment = destChain ? hyperlaneService.getDeployment(destChain.chainId) : null
  const testRecipientAddress = destDeployment?.testRecipient

  // Fetch gas fee - re-run when mode changes
  useEffect(() => {
    const fetchFee = async () => {
      if (!sourceChain || !destChain || !publicClient || !testRecipientAddress || !message) {
        setGasFee(null)
        return
      }

      // Ensure service mode is set before making calls
      hyperlaneService.setMode(hyperlaneMode)

      setIsLoadingFee(true)
      try {
        const fee = await hyperlaneService.quoteMessageDispatch(
          publicClient,
          sourceChain.chainId,
          destChain.chainId,
          testRecipientAddress,
          message
        )
        setGasFee(fee)
      } catch {
        setGasFee(0n)
      } finally {
        setIsLoadingFee(false)
      }
    }

    const timer = setTimeout(fetchFee, 500)
    return () => clearTimeout(timer)
  }, [sourceChain, destChain, publicClient, testRecipientAddress, message, hyperlaneMode])

  // Load last received message
  const loadLastReceived = useCallback(async () => {
    if (!destChain || !publicClient) return

    // Ensure service mode is set before making calls
    hyperlaneService.setMode(hyperlaneMode)

    setIsLoadingReceived(true)
    try {
      const result = await hyperlaneService.readTestRecipient(publicClient as any, destChain.chainId)
      setLastReceived(result)
    } catch {
      // Silent fail
    } finally {
      setIsLoadingReceived(false)
    }
  }, [destChain, publicClient, hyperlaneMode])

  // Build message params
  const buildMessageParams = useCallback((): ContractCallParams | null => {
    if (!sourceChain || !destChain || !testRecipientAddress || !message) {
      return null
    }

    // Ensure service is using correct mode
    hyperlaneService.setMode(hyperlaneMode)

    const mailbox = hyperlaneService.getMailboxAddress(sourceChain.chainId)
    if (!mailbox) {
      console.error('[Hyperlane] No mailbox for chain:', sourceChain.chainId, 'in mode:', hyperlaneMode)
      return null
    }

    const destDomainId = hyperlaneService.getDomainId(destChain.chainId)
    if (!destDomainId) {
      console.error('[Hyperlane] No domainId for chain:', destChain.chainId, 'in mode:', hyperlaneMode)
      return null
    }

    const recipientBytes32 = hyperlaneService.addressToBytes32(testRecipientAddress)
    const messageBytes = stringToHex(message)

    // For self-hosted mode or if fee is null, default to 0 (MerkleTreeHook has no required payment)
    const fee = gasFee ?? 0n

    return {
      address: mailbox,
      abi: MAILBOX_ABI,
      functionName: 'dispatch',
      args: [destDomainId, recipientBytes32, messageBytes],
      value: fee,
    }
  }, [sourceChain, destChain, testRecipientAddress, message, gasFee, hyperlaneMode])

  // Handle send - open transaction dialog first (progress shows after tx confirmed)
  const handleSend = useCallback(() => {
    if (!sourceChain || !destChain || !testRecipientAddress || !message) return

    setSendError(null)
    setSendSuccess(null)

    const params = buildMessageParams()
    if (!params) {
      setSendError('Failed to build transaction. Check console for details.')
      return
    }

    // Open transaction dialog - progress UI shows AFTER tx is confirmed
    setPendingMessage(message)
    setTxParams(params)
    setTxDialogOpen(true)
  }, [sourceChain, destChain, testRecipientAddress, message, buildMessageParams])

  // Handle tx submitted (before confirmation)
  const handleTxSubmitted = useCallback((txHash: string) => {
    setProgressSteps((prev) => {
      let updated = updateStepStatus(prev, 'submit', 'complete', txHash)
      updated = updateStepStatus(updated, 'confirm', 'active')
      return updated
    })
    setProgressOriginTxHash(txHash)
  }, [])

  // Handle tx success - NOW show the progress UI
  const handleTxSuccess = useCallback((receipt: any) => {
    const txHash = receipt.transactionHash as string
    const extractedMessageId = extractMessageIdFromLogs(receipt.logs)

    // NOW show progress UI with steps already at relay stage
    const initialSteps = createProgressSteps()
    let updatedSteps = updateStepStatus(initialSteps, 'submit', 'complete', txHash)
    updatedSteps = updateStepStatus(updatedSteps, 'confirm', 'complete', txHash)
    updatedSteps = updateStepStatus(updatedSteps, 'relay', 'active')

    setProgressSteps(updatedSteps)
    setProgressMessageId(extractedMessageId)
    setProgressOriginTxHash(txHash)
    setShowProgress(true) // Show progress UI after tx confirmed

    setSendSuccess({ txHash, messageId: extractedMessageId })

    if (sourceChain && destChain && pendingMessage) {
      trackMessage({
        messageId: extractedMessageId,
        originChainId: sourceChain.chainId,
        destinationChainId: destChain.chainId,
        type: 'message',
        status: 'pending',
        originTxHash: txHash,
        timestamp: Date.now(),
        description: `Message: "${pendingMessage.slice(0, 30)}${pendingMessage.length > 30 ? '...' : ''}"`,
      })
    }

    setMessage('')
    setPendingMessage(null)
  }, [sourceChain, destChain, pendingMessage, trackMessage])

  // Handle tx error - don't show progress UI, just show error message
  const handleTxError = useCallback((error: Error) => {
    setSendError(error.message)
    setPendingMessage(null)
    // Don't show progress UI on error - user stays on the form
  }, [])

  // Close progress overlay
  const handleCloseProgress = useCallback(() => {
    setShowProgress(false)
    // Reset states
    setProgressSteps(createProgressSteps())
    setProgressMessageId(null)
    setProgressOriginTxHash(null)
    setSendSuccess(null)
    setSendError(null)
  }, [])

  const canSend =
    sourceChain &&
    destChain &&
    testRecipientAddress &&
    message.trim().length > 0 &&
    chainId === sourceChain.chainId

  return {
    message,
    setMessage,
    isSending,
    sendError,
    sendSuccess,
    gasFee,
    isLoadingFee,
    lastReceived,
    isLoadingReceived,
    loadLastReceived,
    txDialogOpen,
    setTxDialogOpen,
    txParams,
    testRecipientAddress,
    canSend,
    handleSend,
    handleTxSubmitted,
    handleTxSuccess,
    handleTxError,
    // Progress state
    showProgress,
    progressSteps,
    progressMessageId,
    progressOriginTxHash,
    handleCloseProgress,
    hyperlaneMode,
    publicClient,
  }
}
