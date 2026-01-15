import { useState, useCallback } from 'react'
import { useAccount, useWalletClient, usePublicClient } from '@/lib/web3'
import { parseEther, encodeFunctionData, erc20Abi } from 'viem'
import { STORY_CONTRACTS } from '@/constants/protocols/story'
import { ROYALTY_MODULE_ABI } from '@/lib/abis/story'
import type { PayRoyaltyParams, OperationResult } from '../types'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export function usePayRoyalty() {
  const { address } = useAccount()
  const { walletClient } = useWalletClient()
  const { publicClient } = usePublicClient()
  const [result, setResult] = useState<OperationResult>({ status: 'idle' })

  const payRoyalty = useCallback(
    async (params: PayRoyaltyParams) => {
      if (!walletClient || !publicClient || !address) {
        setResult({ status: 'error', error: 'Wallet not connected' })
        return
      }

      setResult({ status: 'pending' })

      try {
        // Check and approve token if needed
        const allowance = await publicClient.readContract({
          address: params.token,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address, STORY_CONTRACTS.ROYALTY_MODULE],
        })

        if (allowance < params.amount) {
          const approveHash = await walletClient.writeContract({
            chain: walletClient.chain,
            address: params.token,
            abi: erc20Abi,
            functionName: 'approve',
            args: [STORY_CONTRACTS.ROYALTY_MODULE, params.amount],
            account: address,
          })
          await publicClient.waitForTransactionReceipt({ hash: approveHash })
        }

        // Pay royalty
        const hash = await walletClient.writeContract({
          chain: walletClient.chain,
          address: STORY_CONTRACTS.ROYALTY_MODULE,
          abi: ROYALTY_MODULE_ABI,
          functionName: 'payRoyaltyOnBehalf',
          args: [
            params.receiverIpId,
            params.payerIpId || ZERO_ADDRESS,
            params.token,
            params.amount,
          ],
          account: address,
        })

        await publicClient.waitForTransactionReceipt({ hash })
        setResult({ status: 'success', hash })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setResult({ status: 'error', error: message })
      }
    },
    [walletClient, publicClient, address]
  )

  const reset = useCallback(() => {
    setResult({ status: 'idle' })
  }, [])

  return { payRoyalty, result, reset, isLoading: result.status === 'pending' }
}
