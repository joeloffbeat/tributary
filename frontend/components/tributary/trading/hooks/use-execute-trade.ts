import { useState, useCallback } from 'react'
import { useWalletClient, usePublicClient, useAccount } from '@/lib/web3'
import { MARKETPLACE_ADDRESS, MOCK_USDT_ADDRESS, MARKETPLACE_ABI, ERC20_ABI } from '@/constants/tributary'
import { getTransactionErrorMessage } from '@/lib/utils/transaction'
import type { TradeParams } from '../types'

export function useExecuteTrade() {
  const { walletClient } = useWalletClient()
  const { publicClient } = usePublicClient()
  const { address } = useAccount()

  const [approvalProgress, setApprovalProgress] = useState(0)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const executeTrade = useCallback(
    async (params: TradeParams) => {
      if (!walletClient || !publicClient || !address) {
        throw new Error('Wallet not connected')
      }

      setApprovalProgress(0)
      setError(null)
      setTxHash(null)

      try {
        const totalCost = (params.amount * params.pricePerToken) / BigInt(1e18)

        // Step 1: Check USDC allowance
        setApprovalProgress(10)
        const allowance = await publicClient.readContract({
          address: MOCK_USDT_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, MARKETPLACE_ADDRESS],
        })

        // Step 2: Approve if needed
        if (allowance < totalCost) {
          setApprovalProgress(25)
          const approveHash = await walletClient.writeContract({
            address: MOCK_USDT_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [MARKETPLACE_ADDRESS, totalCost],
            account: address,
            chain: null,
          })
          await publicClient.waitForTransactionReceipt({ hash: approveHash })
        }
        setApprovalProgress(50)

        // Step 3: Execute purchase
        setApprovalProgress(60)
        const hash = await walletClient.writeContract({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          functionName: 'buyTokens',
          args: [BigInt(params.listingId), params.amount],
          account: address,
          chain: null,
        })

        setApprovalProgress(80)
        await publicClient.waitForTransactionReceipt({ hash })

        setApprovalProgress(100)
        setTxHash(hash)
      } catch (err: unknown) {
        const message = getTransactionErrorMessage(err)
        setError(message)
        throw err
      }
    },
    [walletClient, publicClient, address]
  )

  const reset = useCallback(() => {
    setApprovalProgress(0)
    setTxHash(null)
    setError(null)
  }, [])

  return {
    executeTrade,
    approvalProgress,
    txHash,
    error,
    reset,
  }
}
