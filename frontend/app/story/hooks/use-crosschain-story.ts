import { useState, useCallback, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from '@/lib/web3'
import { parseUnits, formatEther, keccak256, toBytes } from 'viem'
import { mantleSepoliaTestnet } from 'viem/chains'
import {
  STORY_BRIDGE_ADDRESS,
  STORY_BRIDGE_ABI,
  MANTLE_EXPLORER,
  STORY_EXPLORER,
  HYPERLANE_EXPLORER,
  MANTLE_DOMAIN_ID,
  STORY_DOMAIN_ID,
} from '../constants'

export type CrosschainStep =
  | 'idle'
  | 'quoting'
  | 'confirming'
  | 'submitted'
  | 'relaying'
  | 'delivered'
  | 'error'

export interface CrosschainState {
  step: CrosschainStep
  originTxHash?: `0x${string}`
  messageId?: `0x${string}`
  destTxHash?: `0x${string}`
  error?: string
  fee?: string
}

interface UseCrosschainStoryReturn {
  state: CrosschainState
  payRoyalty: (receiverIpId: string, token: string, amount: string) => Promise<void>
  claimRevenue: (ancestorIpId: string, currencyTokens: string[], childIpIds: string[]) => Promise<void>
  raiseDispute: (targetIpId: string, evidenceCid: string, tag: string) => Promise<void>
  reset: () => void
  getExplorerLinks: () => { origin?: string; hyperlane?: string; dest?: string }
}

export function useCrosschainStory(): UseCrosschainStoryReturn {
  const { address } = useAccount()
  const { walletClient } = useWalletClient()
  const { publicClient } = usePublicClient()
  const [state, setState] = useState<CrosschainState>({ step: 'idle' })

  // Poll for message delivery when relaying
  useEffect(() => {
    if (state.step !== 'relaying' || !state.messageId) return

    const checkDelivery = async () => {
      try {
        // Query Hyperlane API for message status
        const response = await fetch(
          `https://explorer.hyperlane.xyz/api/v1/messages/${state.messageId}`
        )
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'delivered' || data.destinationTransaction) {
            setState(prev => ({
              ...prev,
              step: 'delivered',
              destTxHash: data.destinationTransaction?.hash,
            }))
          }
        }
      } catch (e) {
        // Ignore errors, keep polling
      }
    }

    const interval = setInterval(checkDelivery, 5000) // Poll every 5s
    checkDelivery() // Check immediately

    return () => clearInterval(interval)
  }, [state.step, state.messageId])

  const payRoyalty = useCallback(
    async (receiverIpId: string, token: string, amount: string) => {
      if (!walletClient || !publicClient || !address) {
        setState({ step: 'error', error: 'Wallet not connected' })
        return
      }

      try {
        setState({ step: 'quoting' })
        const amountBigInt = parseUnits(amount, 18)

        // Get quote
        const fee = await publicClient.readContract({
          address: STORY_BRIDGE_ADDRESS,
          abi: STORY_BRIDGE_ABI,
          functionName: 'quotePayRoyalty',
          args: [receiverIpId as `0x${string}`, token as `0x${string}`, amountBigInt],
        })

        setState({ step: 'confirming', fee: formatEther(fee) })

        // Execute
        const hash = await walletClient.writeContract({
          chain: mantleSepoliaTestnet,
          address: STORY_BRIDGE_ADDRESS,
          abi: STORY_BRIDGE_ABI,
          functionName: 'payRoyalty',
          args: [receiverIpId as `0x${string}`, token as `0x${string}`, amountBigInt],
          value: fee,
          account: address,
        })

        setState({ step: 'submitted', originTxHash: hash, fee: formatEther(fee) })

        // Wait for receipt to get messageId from logs
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        // Extract messageId from logs (first topic of first log is typically the messageId)
        const messageId = receipt.logs[0]?.topics[1] as `0x${string}` | undefined

        setState({
          step: 'relaying',
          originTxHash: hash,
          messageId,
          fee: formatEther(fee),
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setState({ step: 'error', error: message })
      }
    },
    [walletClient, publicClient, address]
  )

  const claimRevenue = useCallback(
    async (ancestorIpId: string, currencyTokens: string[], childIpIds: string[]) => {
      if (!walletClient || !publicClient || !address) {
        setState({ step: 'error', error: 'Wallet not connected' })
        return
      }

      try {
        setState({ step: 'quoting' })

        // Get quote
        const fee = await publicClient.readContract({
          address: STORY_BRIDGE_ADDRESS,
          abi: STORY_BRIDGE_ABI,
          functionName: 'quoteClaimRevenue',
          args: [
            ancestorIpId as `0x${string}`,
            currencyTokens as `0x${string}`[],
            childIpIds as `0x${string}`[],
          ],
        })

        setState({ step: 'confirming', fee: formatEther(fee) })

        const hash = await walletClient.writeContract({
          chain: mantleSepoliaTestnet,
          address: STORY_BRIDGE_ADDRESS,
          abi: STORY_BRIDGE_ABI,
          functionName: 'claimRevenue',
          args: [
            ancestorIpId as `0x${string}`,
            currencyTokens as `0x${string}`[],
            childIpIds as `0x${string}`[],
          ],
          value: fee,
          account: address,
        })

        setState({ step: 'submitted', originTxHash: hash, fee: formatEther(fee) })

        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        const messageId = receipt.logs[0]?.topics[1] as `0x${string}` | undefined

        setState({
          step: 'relaying',
          originTxHash: hash,
          messageId,
          fee: formatEther(fee),
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setState({ step: 'error', error: message })
      }
    },
    [walletClient, publicClient, address]
  )

  const raiseDispute = useCallback(
    async (targetIpId: string, evidenceCid: string, tag: string) => {
      if (!walletClient || !publicClient || !address) {
        setState({ step: 'error', error: 'Wallet not connected' })
        return
      }

      try {
        setState({ step: 'quoting' })

        const evidenceHash = keccak256(toBytes(evidenceCid))
        const tagHash = keccak256(toBytes(tag))

        // Get quote
        const fee = await publicClient.readContract({
          address: STORY_BRIDGE_ADDRESS,
          abi: STORY_BRIDGE_ABI,
          functionName: 'quoteRaiseDispute',
          args: [targetIpId as `0x${string}`, evidenceHash, tagHash],
        })

        setState({ step: 'confirming', fee: formatEther(fee) })

        const hash = await walletClient.writeContract({
          chain: mantleSepoliaTestnet,
          address: STORY_BRIDGE_ADDRESS,
          abi: STORY_BRIDGE_ABI,
          functionName: 'raiseDispute',
          args: [targetIpId as `0x${string}`, evidenceHash, tagHash],
          value: fee,
          account: address,
        })

        setState({ step: 'submitted', originTxHash: hash, fee: formatEther(fee) })

        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        const messageId = receipt.logs[0]?.topics[1] as `0x${string}` | undefined

        setState({
          step: 'relaying',
          originTxHash: hash,
          messageId,
          fee: formatEther(fee),
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setState({ step: 'error', error: message })
      }
    },
    [walletClient, publicClient, address]
  )

  const reset = useCallback(() => {
    setState({ step: 'idle' })
  }, [])

  const getExplorerLinks = useCallback(() => {
    return {
      origin: state.originTxHash ? `${MANTLE_EXPLORER}/tx/${state.originTxHash}` : undefined,
      hyperlane: state.messageId ? `${HYPERLANE_EXPLORER}/?search=${state.messageId}` : undefined,
      dest: state.destTxHash ? `${STORY_EXPLORER}/tx/${state.destTxHash}` : undefined,
    }
  }, [state])

  return {
    state,
    payRoyalty,
    claimRevenue,
    raiseDispute,
    reset,
    getExplorerLinks,
  }
}
