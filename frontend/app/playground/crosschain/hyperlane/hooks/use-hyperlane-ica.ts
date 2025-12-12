import { useState, useEffect, useCallback } from 'react'
import { parseUnits } from 'viem'
import { useAccount, usePublicClient } from '@/lib/web3'
import { hyperlaneService } from '@/lib/services/hyperlane-service'
import type { ContractCallParams } from '@/lib/web3/contracts'
import { ICA_ROUTER_ABI } from '../constants'
import { extractMessageIdFromLogs } from '../utils'
import { createProgressSteps, updateStepStatus, type ProgressStep } from '../components/shared'
import type { ChainSelectOption, TrackedMessage, HyperlaneTxSuccess, HyperlaneMode } from '../types'

interface UseICAParams {
  sourceChain: ChainSelectOption | null
  destChain: ChainSelectOption | null
  trackMessage: (message: TrackedMessage) => void
  hyperlaneMode: HyperlaneMode
}

export function useHyperlaneICA({ sourceChain, destChain, trackMessage, hyperlaneMode }: UseICAParams) {
  const { address, chain } = useAccount()
  const { publicClient } = usePublicClient()
  const chainId = chain?.id

  const [remoteICA, setRemoteICA] = useState<string | null>(null)
  const [isLoadingICA, setIsLoadingICA] = useState(false)
  const [targetAddress, setTargetAddress] = useState('')
  const [callData, setCallData] = useState('')
  const [callValue, setCallValue] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executeError, setExecuteError] = useState<string | null>(null)
  const [executeSuccess, setExecuteSuccess] = useState<HyperlaneTxSuccess | null>(null)
  const [gasFee, setGasFee] = useState<bigint | null>(null)

  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [txParams, setTxParams] = useState<ContractCallParams | null>(null)
  const [pendingCallInfo, setPendingCallInfo] = useState<{ target: string } | null>(null)

  // Progress tracking state
  const [showProgress, setShowProgress] = useState(false)
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(createProgressSteps())
  const [progressMessageId, setProgressMessageId] = useState<string | null>(null)
  const [progressOriginTxHash, setProgressOriginTxHash] = useState<string | null>(null)

  // Get deployment for source chain with current mode
  const sourceDeployment = sourceChain ? hyperlaneService.getDeployment(sourceChain.chainId, hyperlaneMode) : null
  const hasICARouter = !!sourceDeployment?.interchainAccountRouter

  // Load remote ICA address - re-run when mode changes
  useEffect(() => {
    const loadICA = async () => {
      if (!sourceChain || !destChain || !publicClient || !address) {
        setRemoteICA(null)
        return
      }

      // Ensure service mode is set before making calls
      hyperlaneService.setMode(hyperlaneMode)

      setIsLoadingICA(true)
      try {
        const ica = await hyperlaneService.getRemoteICA(
          publicClient as any,
          sourceChain.chainId,
          destChain.chainId,
          address
        )
        setRemoteICA(ica)
      } catch {
        setRemoteICA(null)
      } finally {
        setIsLoadingICA(false)
      }
    }

    loadICA()
  }, [sourceChain, destChain, publicClient, address, hyperlaneMode])

  // Load gas fee - re-run when mode changes
  useEffect(() => {
    const loadFee = async () => {
      if (!sourceChain || !destChain || !publicClient) {
        setGasFee(null)
        return
      }

      // Ensure service mode is set before making calls
      hyperlaneService.setMode(hyperlaneMode)

      try {
        const fee = await hyperlaneService.quoteICACall(publicClient as any, sourceChain.chainId, destChain.chainId)
        setGasFee(fee)
      } catch {
        setGasFee(0n)
      }
    }

    loadFee()
  }, [sourceChain, destChain, publicClient, hyperlaneMode])

  // Build ICA params
  const buildICAParams = useCallback((): ContractCallParams | null => {
    if (!sourceChain || !destChain || !targetAddress || gasFee === null) return null
    if (!sourceDeployment?.interchainAccountRouter) return null

    const destDomainId = hyperlaneService.getDomainId(destChain.chainId)
    if (!destDomainId) return null

    const targetBytes32 = hyperlaneService.addressToBytes32(targetAddress as `0x${string}`)
    const callValueWei = callValue ? parseUnits(callValue, 18) : 0n
    const callDataHex = (callData || '0x') as `0x${string}`

    const calls = [
      {
        to: targetBytes32,
        value: callValueWei,
        data: callDataHex,
      },
    ]

    return {
      address: sourceDeployment.interchainAccountRouter,
      abi: ICA_ROUTER_ABI,
      functionName: 'callRemote',
      args: [destDomainId, calls],
      value: gasFee,
    }
  }, [sourceChain, destChain, targetAddress, callValue, callData, gasFee, sourceDeployment])

  // Handle execute
  const handleExecute = useCallback(() => {
    if (!sourceChain || !destChain || !targetAddress) return

    setExecuteError(null)
    setExecuteSuccess(null)

    const params = buildICAParams()
    if (params) {
      setPendingCallInfo({ target: targetAddress })
      setTxParams(params)
      setTxDialogOpen(true)
    }
  }, [sourceChain, destChain, targetAddress, buildICAParams])

  // Handle tx success
  const handleTxSuccess = useCallback((receipt: any) => {
    const txHash = receipt.transactionHash as string
    const extractedMessageId = extractMessageIdFromLogs(receipt.logs)

    setExecuteSuccess({ txHash, messageId: extractedMessageId })

    if (sourceChain && destChain && pendingCallInfo) {
      trackMessage({
        messageId: extractedMessageId,
        originChainId: sourceChain.chainId,
        destinationChainId: destChain.chainId,
        type: 'ica',
        status: 'pending',
        originTxHash: txHash,
        timestamp: Date.now(),
        description: `ICA call to ${pendingCallInfo.target.slice(0, 10)}...`,
      })

      // NOW show progress UI with steps already at relay stage
      const initialSteps = createProgressSteps()
      let updatedSteps = updateStepStatus(initialSteps, 'submit', 'complete', txHash)
      updatedSteps = updateStepStatus(updatedSteps, 'confirm', 'complete', txHash)
      updatedSteps = updateStepStatus(updatedSteps, 'relay', 'active')

      setProgressSteps(updatedSteps)
      setProgressMessageId(extractedMessageId)
      setProgressOriginTxHash(txHash)
      setShowProgress(true) // Show progress UI after tx confirmed
    }

    setTargetAddress('')
    setCallData('')
    setCallValue('')
    setPendingCallInfo(null)
  }, [sourceChain, destChain, pendingCallInfo, trackMessage])

  // Handle tx error
  const handleTxError = useCallback((error: Error) => {
    setExecuteError(error.message)
    setPendingCallInfo(null)
    // Don't show progress UI on error - user stays on the form
  }, [])

  // Close progress overlay
  const handleCloseProgress = useCallback(() => {
    setShowProgress(false)
    // Reset states
    setProgressSteps(createProgressSteps())
    setProgressMessageId(null)
    setProgressOriginTxHash(null)
    setExecuteSuccess(null)
    setExecuteError(null)
  }, [])

  const canExecute =
    sourceChain &&
    destChain &&
    hasICARouter &&
    targetAddress &&
    targetAddress.startsWith('0x') &&
    chainId === sourceChain.chainId

  return {
    remoteICA,
    isLoadingICA,
    targetAddress,
    setTargetAddress,
    callData,
    setCallData,
    callValue,
    setCallValue,
    isExecuting,
    executeError,
    executeSuccess,
    gasFee,
    hasICARouter,
    txDialogOpen,
    setTxDialogOpen,
    txParams,
    canExecute,
    handleExecute,
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
