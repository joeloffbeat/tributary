import { useState, useCallback } from 'react'
import type { Address } from 'viem'
import { useWalletClient, usePublicClient, useAccount } from '@/lib/web3'
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, ERC20_ABI } from '@/constants/tributary'
import { getTransactionErrorMessage } from '@/lib/utils/transaction'

interface CreateListingParams {
  vaultAddress: Address
  tokenAddress: Address
  amount: bigint
  pricePerToken: bigint
  expiresAt: number
}

export function useCreateListing() {
  const { walletClient } = useWalletClient()
  const { publicClient } = usePublicClient()
  const { address } = useAccount()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createListing = useCallback(
    async (params: CreateListingParams) => {
      if (!walletClient || !publicClient || !address) {
        throw new Error('Wallet not connected')
      }

      setIsPending(true)
      setError(null)

      try {
        // Check and approve token allowance
        const allowance = await publicClient.readContract({
          address: params.tokenAddress,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, MARKETPLACE_ADDRESS],
        })

        if (allowance < params.amount) {
          const approveHash = await walletClient.writeContract({
            address: params.tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [MARKETPLACE_ADDRESS, params.amount],
            account: address,
            chain: null,
          })
          await publicClient.waitForTransactionReceipt({ hash: approveHash })
        }

        // Create listing on marketplace
        const hash = await walletClient.writeContract({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          functionName: 'createListing',
          args: [
            params.tokenAddress,
            params.amount,
            params.pricePerToken,
            BigInt(params.expiresAt),
          ],
          account: address,
          chain: null,
        })

        await publicClient.waitForTransactionReceipt({ hash })
      } catch (err: unknown) {
        const message = getTransactionErrorMessage(err)
        setError(message)
        throw err
      } finally {
        setIsPending(false)
      }
    },
    [walletClient, publicClient, address]
  )

  return { createListing, isPending, error }
}
