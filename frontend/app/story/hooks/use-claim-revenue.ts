import { useState, useCallback } from 'react'
import { useAccount, useWalletClient, usePublicClient } from '@/lib/web3'
import { STORY_CONTRACTS } from '@/constants/protocols/story'
import { ROYALTY_WORKFLOWS_ABI } from '@/lib/abis/story'
import type { ClaimRevenueParams, OperationResult } from '../types'

export function useClaimRevenue() {
  const { address } = useAccount()
  const { walletClient } = useWalletClient()
  const { publicClient } = usePublicClient()
  const [result, setResult] = useState<OperationResult>({ status: 'idle' })

  const claimRevenue = useCallback(
    async (params: ClaimRevenueParams) => {
      if (!walletClient || !publicClient || !address) {
        setResult({ status: 'error', error: 'Wallet not connected' })
        return
      }

      setResult({ status: 'pending' })

      try {
        const hash = await walletClient.writeContract({
          chain: walletClient.chain,
          address: STORY_CONTRACTS.ROYALTY_WORKFLOWS,
          abi: ROYALTY_WORKFLOWS_ABI,
          functionName: 'claimAllRevenue',
          args: [
            params.ancestorIpId,
            params.claimer,
            params.currencyTokens,
            params.childIpIds,
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

  return { claimRevenue, result, reset, isLoading: result.status === 'pending' }
}
