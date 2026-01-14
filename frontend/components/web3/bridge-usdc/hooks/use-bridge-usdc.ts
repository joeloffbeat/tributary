// =============================================================================
// Bridge USDC Hook - Complete flow with server fallback
// =============================================================================

import { useState, useCallback, useRef } from 'react'
import { parseUnits, formatUnits, createPublicClient, http, Hex, encodeAbiParameters } from 'viem'
import { sepolia, polygonAmoy, avalancheFuji } from 'viem/chains'
import { defineChain } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import type { BridgeState, BridgeQuote } from '../types'
import {
  USDC_CHAINS,
  ERC20_ABI,
  TOKEN_ROUTER_ABI,
  MAILBOX_ABI,
  RELAY_TIMEOUT_MS,
  DELIVERY_POLL_INTERVAL_MS,
  getUsdcChainConfig,
} from '../constants'

// Story Aenid chain definition
const storyAenid = defineChain({
  id: 1315,
  name: 'Story Aenid Testnet',
  nativeCurrency: { decimals: 18, name: 'IP', symbol: 'IP' },
  rpcUrls: { default: { http: ['https://aeneid.storyrpc.io'] } },
  blockExplorers: { default: { name: 'Story Explorer', url: 'https://aeneid.storyscan.xyz' } },
  testnet: true,
})

const CHAIN_MAP: Record<number, any> = {
  11155111: sepolia,
  1315: storyAenid,
  43113: avalancheFuji,
  80002: polygonAmoy,
}

const initialState: BridgeState = {
  step: 'idle',
  currentStepIndex: 0,
  totalSteps: 5,
}

export function useBridgeUsdc() {
  const { address, chainId } = useAccount()
  const { walletClient } = useWalletClient()

  const [bridgeState, setBridgeState] = useState<BridgeState>(initialState)
  const [quote, setQuote] = useState<BridgeQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const abortRef = useRef<boolean>(false)

  // Get USDC balance for a specific chain
  const getUsdcBalance = useCallback(async (targetChainId: number, userAddress: string): Promise<bigint> => {
    const config = getUsdcChainConfig(targetChainId)
    if (!config) return 0n
    try {
      const client = createPublicClient({ chain: CHAIN_MAP[targetChainId], transport: http(config.rpcUrl) })
      return await client.readContract({
        address: config.tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`],
      }) as bigint
    } catch {
      return 0n
    }
  }, [])

  const formatUsdcBalance = useCallback((balance: bigint): string => formatUnits(balance, 6), [])

  // Get quote for bridging
  const getQuote = useCallback(async (sourceChainId: number, destChainId: number, amount: string): Promise<BridgeQuote | null> => {
    const sourceConfig = getUsdcChainConfig(sourceChainId)
    if (!sourceConfig || !amount || parseFloat(amount) <= 0) return null
    setIsLoadingQuote(true)
    try {
      const client = createPublicClient({ chain: CHAIN_MAP[sourceChainId], transport: http(sourceConfig.rpcUrl) })
      const inputAmount = parseUnits(amount, 6)
      let interchainGasFee = 0n
      try {
        interchainGasFee = await client.readContract({
          address: sourceConfig.routerAddress,
          abi: TOKEN_ROUTER_ABI,
          functionName: 'quoteGasPayment',
          args: [destChainId],
        }) as bigint
      } catch { interchainGasFee = 0n }
      const bridgeQuote: BridgeQuote = { inputAmount, outputAmount: inputAmount, interchainGasFee, estimatedTime: 60 }
      setQuote(bridgeQuote)
      return bridgeQuote
    } catch {
      return null
    } finally {
      setIsLoadingQuote(false)
    }
  }, [])

  // Check if approval is needed
  const checkApproval = useCallback(async (sourceChainId: number, amount: bigint): Promise<boolean> => {
    const config = getUsdcChainConfig(sourceChainId)
    if (!config || !address || config.type !== 'collateral') return false
    try {
      const client = createPublicClient({ chain: CHAIN_MAP[sourceChainId], transport: http(config.rpcUrl) })
      const allowance = await client.readContract({
        address: config.tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, config.routerAddress],
      }) as bigint
      return allowance < amount
    } catch {
      return true
    }
  }, [address])

  // Check if message is delivered on destination
  const checkDelivery = useCallback(async (destChainId: number, messageId: Hex): Promise<boolean> => {
    const config = getUsdcChainConfig(destChainId)
    if (!config) return false
    try {
      const client = createPublicClient({ chain: CHAIN_MAP[destChainId], transport: http(config.rpcUrl) })
      return await client.readContract({
        address: config.mailboxAddress,
        abi: MAILBOX_ABI,
        functionName: 'delivered',
        args: [messageId],
      }) as boolean
    } catch {
      return false
    }
  }, [])

  // Poll for delivery with timeout
  const waitForDelivery = useCallback(async (destChainId: number, messageId: Hex, timeoutMs: number): Promise<boolean> => {
    const startTime = Date.now()
    while (Date.now() - startTime < timeoutMs && !abortRef.current) {
      const delivered = await checkDelivery(destChainId, messageId)
      if (delivered) return true
      await new Promise(r => setTimeout(r, DELIVERY_POLL_INTERVAL_MS))
    }
    return false
  }, [checkDelivery])

  // Call server to process the message
  const serverProcessMessage = useCallback(async (destChainId: number, messageBytes: Hex, messageId: Hex): Promise<{ success: boolean; txHash?: string }> => {
    try {
      const response = await fetch('/api/bridge/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destChainId, messageBytes, messageId }),
      })
      return await response.json()
    } catch {
      return { success: false }
    }
  }, [])

  // Extract message from transaction logs
  const extractMessageFromLogs = (logs: any[]): { messageId: Hex; messageBytes: Hex } | null => {
    // Find Dispatch event (topic0 = 0x769f711d...)
    const dispatchLog = logs.find(log =>
      log.topics[0] === '0x769f711d20c679153d382254f59892613b58a97cc876b249134ac25c80f9c814'
    )
    // Find DispatchId event (topic0 = 0x788dbc1b...)
    const dispatchIdLog = logs.find(log =>
      log.topics[0] === '0x788dbc1b7152732178210e7f4d9d010ef016f9eafbe66786bd7169f56e0c353a'
    )
    if (!dispatchLog || !dispatchIdLog) return null

    const messageId = dispatchIdLog.topics[1] as Hex
    // Decode the message from Dispatch data (skip first 64 bytes: offset + length)
    const data = dispatchLog.data as string
    const messageBytes = ('0x' + data.slice(130)) as Hex // Skip 0x + 64 chars offset + 64 chars length

    return { messageId, messageBytes }
  }

  // Main bridge execution
  const executeBridge = useCallback(async (
    sourceChainId: number,
    destChainId: number,
    amount: string,
    recipient?: string
  ): Promise<boolean> => {
    if (!walletClient || !address) {
      setBridgeState({ ...initialState, step: 'error', error: 'Wallet not connected' })
      return false
    }

    const sourceConfig = getUsdcChainConfig(sourceChainId)
    const destConfig = getUsdcChainConfig(destChainId)
    if (!sourceConfig || !destConfig) {
      setBridgeState({ ...initialState, step: 'error', error: 'Invalid chain' })
      return false
    }

    const viemChain = CHAIN_MAP[sourceChainId]
    const inputAmount = parseUnits(amount, 6)
    const recipientAddress = recipient || address
    abortRef.current = false

    try {
      // Step 1: Approve if needed (collateral type only)
      if (sourceConfig.type === 'collateral') {
        const needsApproval = await checkApproval(sourceChainId, inputAmount)
        if (needsApproval) {
          setBridgeState({ step: 'approving', currentStepIndex: 1, totalSteps: 5 })
          const approveHash = await walletClient.writeContract({
            chain: viemChain,
            account: address,
            address: sourceConfig.tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [sourceConfig.routerAddress, inputAmount],
          })
          const client = createPublicClient({ chain: viemChain, transport: http(sourceConfig.rpcUrl) })
          await client.waitForTransactionReceipt({ hash: approveHash })
        }
      }

      // Step 2: Send transferRemote
      setBridgeState({ step: 'sending', currentStepIndex: 2, totalSteps: 5 })
      const recipientBytes32 = `0x${recipientAddress.slice(2).padStart(64, '0')}` as Hex

      let value = 0n
      try {
        const client = createPublicClient({ chain: viemChain, transport: http(sourceConfig.rpcUrl) })
        value = await client.readContract({
          address: sourceConfig.routerAddress,
          abi: TOKEN_ROUTER_ABI,
          functionName: 'quoteGasPayment',
          args: [destChainId],
        }) as bigint
      } catch { value = 0n }

      const txHash = await walletClient.writeContract({
        chain: viemChain,
        account: address,
        address: sourceConfig.routerAddress,
        abi: TOKEN_ROUTER_ABI,
        functionName: 'transferRemote',
        args: [destChainId, recipientBytes32, inputAmount],
        value,
      })

      // Step 3: Wait for source tx confirmation
      setBridgeState({ step: 'confirming', sourceTxHash: txHash, currentStepIndex: 3, totalSteps: 5 })
      const client = createPublicClient({ chain: viemChain, transport: http(sourceConfig.rpcUrl) })
      const receipt = await client.waitForTransactionReceipt({ hash: txHash })

      // Extract message data from logs
      const messageData = extractMessageFromLogs(receipt.logs)
      if (!messageData) {
        setBridgeState({ step: 'error', sourceTxHash: txHash, error: 'Failed to extract message', currentStepIndex: 0, totalSteps: 5 })
        return false
      }

      const { messageId, messageBytes } = messageData
      setBridgeState({
        step: 'waiting_relay',
        sourceTxHash: txHash,
        messageId,
        messageBytes,
        currentStepIndex: 4,
        totalSteps: 5
      })

      // Step 4: Wait for relayer (with timeout)
      const delivered = await waitForDelivery(destChainId, messageId, RELAY_TIMEOUT_MS)

      if (delivered) {
        setBridgeState({
          step: 'complete',
          sourceTxHash: txHash,
          messageId,
          currentStepIndex: 5,
          totalSteps: 5
        })
        return true
      }

      // Step 5: Server fallback processing
      if (abortRef.current) return false

      setBridgeState({
        step: 'processing',
        sourceTxHash: txHash,
        messageId,
        messageBytes,
        currentStepIndex: 4,
        totalSteps: 5
      })

      const result = await serverProcessMessage(destChainId, messageBytes, messageId)

      if (result.success) {
        setBridgeState({
          step: 'complete',
          sourceTxHash: txHash,
          messageId,
          destTxHash: result.txHash as Hex,
          currentStepIndex: 5,
          totalSteps: 5
        })
        return true
      }

      // Final check - maybe it was delivered during processing
      const finalCheck = await checkDelivery(destChainId, messageId)
      if (finalCheck) {
        setBridgeState({
          step: 'complete',
          sourceTxHash: txHash,
          messageId,
          currentStepIndex: 5,
          totalSteps: 5
        })
        return true
      }

      setBridgeState({
        step: 'error',
        sourceTxHash: txHash,
        messageId,
        error: 'Failed to process on destination',
        currentStepIndex: 0,
        totalSteps: 5
      })
      return false

    } catch (error) {
      setBridgeState({
        step: 'error',
        error: error instanceof Error ? error.message : 'Bridge failed',
        currentStepIndex: 0,
        totalSteps: 5
      })
      return false
    }
  }, [walletClient, address, checkApproval, waitForDelivery, serverProcessMessage, checkDelivery])

  const resetBridge = useCallback(() => {
    abortRef.current = true
    setBridgeState(initialState)
    setQuote(null)
  }, [])

  return {
    bridgeState,
    quote,
    isLoadingQuote,
    currentChainId: chainId,
    address,
    usdcChains: USDC_CHAINS,
    getUsdcChainConfig,
    getUsdcBalance,
    formatUsdcBalance,
    getQuote,
    executeBridge,
    resetBridge,
  }
}
