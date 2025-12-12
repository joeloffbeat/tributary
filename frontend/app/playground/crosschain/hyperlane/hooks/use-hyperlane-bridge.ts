import { useState, useEffect, useCallback } from 'react'
import { formatUnits, parseUnits, createPublicClient, http } from 'viem'
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from '@/lib/web3'
import { getChainById } from '@/lib/config/chains'
import { hyperlaneService, type HyperlaneToken, type HyperlaneQuote } from '@/lib/services/hyperlane-service'
import type { ContractCallParams } from '@/lib/web3/contracts'
import { TOKEN_ROUTER_ABI, ERC20_ABI } from '../constants'
import { extractMessageIdFromLogs } from '../utils'
import { createProgressSteps, updateStepStatus, type ProgressStep } from '../components/shared'
import type { ChainSelectOption, BridgeStep, TrackedMessage, HyperlaneMode } from '../types'

interface UseBridgeParams {
  sourceChain: ChainSelectOption | null
  destChain: ChainSelectOption | null
  trackMessage: (message: TrackedMessage) => void
  hyperlaneMode: HyperlaneMode
}

export function useHyperlaneBridge({ sourceChain, destChain, trackMessage, hyperlaneMode }: UseBridgeParams) {
  const { address, chain } = useAccount()
  const { publicClient } = usePublicClient()
  const { switchChain } = useSwitchChain()
  const chainId = chain?.id

  // Token state
  const [selectedToken, setSelectedToken] = useState<HyperlaneToken | null>(null)
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState<string>('0')

  // Quote state
  const [quote, setQuote] = useState<HyperlaneQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  // Bridge state
  const [isBridging, setIsBridging] = useState(false)
  const [bridgeError, setBridgeError] = useState<string | null>(null)
  const [bridgeSteps, setBridgeSteps] = useState<BridgeStep[]>([])
  const [transferTxHash, setTransferTxHash] = useState<string | null>(null)
  const [messageId, setMessageId] = useState<string | null>(null)
  const [bridgeComplete, setBridgeComplete] = useState(false)

  // Transaction Dialog state
  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [txParams, setTxParams] = useState<ContractCallParams | null>(null)
  const [pendingTxType, setPendingTxType] = useState<'approve' | 'transfer' | null>(null)
  const [needsApproval, setNeedsApproval] = useState(false)

  // Progress tracking state
  const [showProgress, setShowProgress] = useState(false)
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(createProgressSteps())
  const [progressMessageId, setProgressMessageId] = useState<string | null>(null)
  const [progressOriginTxHash, setProgressOriginTxHash] = useState<string | null>(null)
  const [pendingAmount, setPendingAmount] = useState<string | null>(null)

  // Set default token when source chain changes
  useEffect(() => {
    if (sourceChain && sourceChain.tokens.length > 0 && !selectedToken) {
      setSelectedToken(sourceChain.tokens[0])
    }
  }, [sourceChain, selectedToken])

  // Load token balance
  useEffect(() => {
    const loadBalance = async () => {
      if (!address || !selectedToken || !sourceChain) {
        setBalance('0')
        return
      }

      try {
        const chainConfig = getChainById(sourceChain.chainId)
        if (!chainConfig) {
          setBalance('0')
          return
        }

        const sourcePublicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(chainConfig.rpcUrl),
        })

        if (selectedToken.type === 'native') {
          const bal = await sourcePublicClient.getBalance({ address })
          setBalance(formatUnits(bal, 18))
        } else {
          // For collateral/synthetic tokens, try to read balance
          // Note: Synthetic HypERC20 tokens use the router address for balance
          const tokenAddress = selectedToken.type === 'synthetic'
            ? selectedToken.routerAddress
            : selectedToken.address

          try {
            const bal = await sourcePublicClient.readContract({
              address: tokenAddress,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [address],
            })
            setBalance(formatUnits(bal as bigint, selectedToken.decimals))
          } catch {
            // Token contract might not exist or be deployed yet
            setBalance('0')
          }
        }
      } catch (error) {
        console.error('Failed to load balance:', error)
        setBalance('0')
      }
    }

    loadBalance()
  }, [address, selectedToken, sourceChain])

  // Fetch quote
  const fetchQuote = useCallback(async () => {
    if (!sourceChain || !destChain || !selectedToken || !amount || parseFloat(amount) <= 0 || !address || !publicClient) {
      setQuote(null)
      return
    }

    // Ensure service mode is set before making calls
    hyperlaneService.setMode(hyperlaneMode)

    const destChains = hyperlaneService.getDestinationChains(sourceChain.chainId, selectedToken.symbol, hyperlaneMode)
    if (!destChains.includes(destChain.chainId)) {
      setQuoteError(`${selectedToken.symbol} cannot be bridged to ${destChain.name}`)
      setQuote(null)
      return
    }

    setIsLoadingQuote(true)
    setQuoteError(null)

    try {
      const inputAmount = parseUnits(amount, selectedToken.decimals)
      const quoteResponse = await hyperlaneService.getQuote(
        {
          originChainId: sourceChain.chainId,
          destinationChainId: destChain.chainId,
          tokenSymbol: selectedToken.symbol,
          amount: inputAmount,
          sender: address,
          recipient: address,
        },
        publicClient
      )

      if (quoteResponse) {
        setQuote(quoteResponse)

        if (quoteResponse.token.type === 'collateral' && address) {
          try {
            const allowance = await publicClient.readContract({
              address: quoteResponse.token.address,
              abi: ERC20_ABI,
              functionName: 'allowance',
              args: [address, quoteResponse.routerAddress],
            })
            setNeedsApproval((allowance as bigint) < quoteResponse.inputAmount)
          } catch {
            setNeedsApproval(true)
          }
        } else {
          setNeedsApproval(false)
        }
      } else {
        setQuoteError('Unable to get quote for this route')
        setQuote(null)
      }
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : 'Failed to get quote')
      setQuote(null)
    } finally {
      setIsLoadingQuote(false)
    }
  }, [sourceChain, destChain, selectedToken, amount, address, publicClient, hyperlaneMode])

  // Debounced quote fetch
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [fetchQuote])

  // Build approval params
  const buildApproveParams = useCallback((): ContractCallParams | null => {
    if (!quote || !address) return null
    return {
      address: quote.token.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [quote.routerAddress, quote.inputAmount],
    }
  }, [quote, address])

  // Build transfer params
  const buildTransferParams = useCallback((): ContractCallParams | null => {
    if (!quote || !address || !destChain) return null
    // Ensure service mode is set before getting domain ID
    hyperlaneService.setMode(hyperlaneMode)
    const destDomainId = hyperlaneService.getDomainId(destChain.chainId, hyperlaneMode)
    if (!destDomainId) return null

    const recipientBytes32 = hyperlaneService.addressToBytes32(address)
    let value = quote.interchainGasFee
    if (quote.token.type === 'native') {
      value = quote.interchainGasFee + quote.inputAmount
    }

    return {
      address: quote.routerAddress,
      abi: TOKEN_ROUTER_ABI,
      functionName: 'transferRemote',
      args: [destDomainId, recipientBytes32, quote.inputAmount],
      value,
    }
  }, [quote, address, destChain, hyperlaneMode])

  // Handle bridge
  const handleBridge = useCallback(async () => {
    if (!quote || !sourceChain || !destChain || !address) return
    if (chainId !== sourceChain.chainId) {
      switchChain?.(sourceChain.chainId)
      return
    }

    setBridgeError(null)
    setBridgeComplete(false)
    setTransferTxHash(null)
    setMessageId(null)

    const steps: BridgeStep[] = [
      { id: 'transfer', label: `Bridge from ${sourceChain.name}`, status: 'pending' },
      { id: 'relay', label: `Deliver to ${destChain.name}`, status: 'pending' },
    ]

    // Store pending amount for progress display
    setPendingAmount(amount)

    if (needsApproval) {
      steps.unshift({ id: 'approve', label: 'Approve Token', status: 'pending' })
      const approveParams = buildApproveParams()
      if (approveParams) {
        setTxParams(approveParams)
        setPendingTxType('approve')
        setBridgeSteps(steps)
        setTxDialogOpen(true)
      }
    } else {
      const transferParams = buildTransferParams()
      if (transferParams) {
        setTxParams(transferParams)
        setPendingTxType('transfer')
        setBridgeSteps(steps)
        setTxDialogOpen(true)
      }
    }
  }, [quote, sourceChain, destChain, address, chainId, switchChain, needsApproval, buildApproveParams, buildTransferParams, amount])

  // Handle tx success
  const handleTxSuccess = useCallback(async (receipt: any) => {
    if (pendingTxType === 'approve') {
      setBridgeSteps((prev) =>
        prev.map((step) =>
          step.id === 'approve' ? { ...step, status: 'completed', txHash: receipt.transactionHash } : step
        )
      )
      setNeedsApproval(false)

      const transferParams = buildTransferParams()
      if (transferParams) {
        setTxParams(transferParams)
        setPendingTxType('transfer')
        setTimeout(() => setTxDialogOpen(true), 300)
      }
    } else if (pendingTxType === 'transfer') {
      const txHash = receipt.transactionHash as string
      setTransferTxHash(txHash)

      setBridgeSteps((prev) =>
        prev.map((step) =>
          step.id === 'transfer' ? { ...step, status: 'completed', txHash } : step
        )
      )

      const extractedMessageId = extractMessageIdFromLogs(receipt.logs)
      if (extractedMessageId && extractedMessageId !== '0x') {
        setMessageId(extractedMessageId)

        if (sourceChain && destChain && selectedToken && pendingAmount) {
          trackMessage({
            messageId: extractedMessageId,
            originChainId: sourceChain.chainId,
            destinationChainId: destChain.chainId,
            type: 'bridge',
            status: 'pending',
            originTxHash: txHash,
            timestamp: Date.now(),
            description: `Bridge ${pendingAmount} ${selectedToken.symbol} to ${destChain.name}`,
          })
        }

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

      setBridgeSteps((prev) =>
        prev.map((step) => (step.id === 'relay' ? { ...step, status: 'in_progress' } : step))
      )

      // Clear form
      setAmount('')
      setPendingAmount(null)
      setPendingTxType(null)
    }
  }, [pendingTxType, buildTransferParams, sourceChain, destChain, selectedToken, pendingAmount, trackMessage])

  // Handle tx error
  const handleTxError = useCallback((error: Error) => {
    setBridgeError(error.message)
    setBridgeSteps((prev) =>
      prev.map((step) =>
        step.id === pendingTxType ? { ...step, status: 'failed', error: error.message } : step
      )
    )
    setPendingTxType(null)
    setPendingAmount(null)
    // Don't show progress UI on error - user stays on the form
  }, [pendingTxType])

  // Close progress overlay
  const handleCloseProgress = useCallback(() => {
    setShowProgress(false)
    // Reset states
    setProgressSteps(createProgressSteps())
    setProgressMessageId(null)
    setProgressOriginTxHash(null)
    setBridgeComplete(false)
    setBridgeSteps([])
    setBridgeError(null)
  }, [])

  const canBridge =
    sourceChain &&
    destChain &&
    selectedToken &&
    amount &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= parseFloat(balance) &&
    quote &&
    !isLoadingQuote &&
    chainId === sourceChain.chainId

  return {
    selectedToken,
    setSelectedToken,
    amount,
    setAmount,
    balance,
    quote,
    isLoadingQuote,
    quoteError,
    isBridging,
    bridgeError,
    bridgeSteps,
    transferTxHash,
    messageId,
    bridgeComplete,
    txDialogOpen,
    setTxDialogOpen,
    txParams,
    needsApproval,
    canBridge,
    handleBridge,
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
