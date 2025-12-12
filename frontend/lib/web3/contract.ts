/**
 * Contract Hooks - Thirdweb Implementation
 *
 * Provides contract read/write functionality using Thirdweb SDK.
 */

'use client'

import { useCallback, useState } from 'react'
import { useActiveAccount, useActiveWallet, useReadContract as useThirdwebReadContract } from 'thirdweb/react'
import { getContract, prepareContractCall, sendTransaction } from 'thirdweb'
import { defineChain } from 'thirdweb'
import { getThirdwebClient } from './thirdweb-client'
import type {
  UseReadContractParams,
  UseReadContractReturn,
  UseWriteContractReturn,
} from './types'
import type { Address } from 'viem'

/**
 * Hook to read from a contract
 *
 * @param params - Contract parameters (address, abi, functionName, args)
 * @returns Data from the contract
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data: balance } = useReadContract({
 *     address: '0x...',
 *     abi: erc20Abi,
 *     functionName: 'balanceOf',
 *     args: [userAddress],
 *   })
 * }
 * ```
 */
export function useReadContract<T = unknown>(
  params: UseReadContractParams
): UseReadContractReturn<T> {
  const { address, abi, functionName, args, chainId, watch = false } = params
  const wallet = useActiveWallet()

  // Determine chain ID
  const effectiveChainId = chainId || wallet?.getChain()?.id

  // Create contract instance
  const contract = effectiveChainId
    ? getContract({
        client: getThirdwebClient(),
        chain: defineChain(effectiveChainId),
        address,
        abi: abi as any,
      })
    : undefined

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useThirdwebReadContract({
    contract: contract!,
    method: functionName,
    params: args || [],
  })

  return {
    data: data as T | undefined,
    isLoading,
    isRefetching: isFetching && !isLoading,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Hook to write to a contract
 *
 * @returns Object with writeContract function, pending state, and error
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { writeContract, isPending } = useWriteContract()
 *
 *   const handleApprove = async () => {
 *     const hash = await writeContract({
 *       address: '0x...',
 *       abi: erc20Abi,
 *       functionName: 'approve',
 *       args: [spender, amount],
 *     })
 *   }
 * }
 * ```
 */
export function useWriteContract(): UseWriteContractReturn {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const writeContract = useCallback(
    async (params: {
      address: Address
      abi: readonly unknown[]
      functionName: string
      args?: readonly unknown[]
      value?: bigint
    }): Promise<`0x${string}`> => {
      if (!account || !wallet) {
        throw new Error('Wallet not connected')
      }

      setIsPending(true)
      setError(null)

      try {
        const chain = wallet.getChain()
        if (!chain) {
          throw new Error('No chain selected')
        }

        const client = getThirdwebClient()

        // Create contract instance
        const contract = getContract({
          client,
          chain,
          address: params.address,
          abi: params.abi as any,
        })

        // Prepare the contract call
        const transaction = prepareContractCall({
          contract,
          method: params.functionName,
          params: params.args || [],
          value: params.value,
        })

        // Send the transaction
        const result = await sendTransaction({
          transaction,
          account,
        })

        return result.transactionHash as `0x${string}`
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Contract write failed')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [account, wallet]
  )

  return { writeContract, isPending, error }
}
