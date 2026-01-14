/**
 * Contract Hooks - Wagmi/Privy Implementation
 *
 * Provides contract read/write functionality using wagmi hooks.
 */

'use client'

import { useCallback, useState } from 'react'
import {
  useReadContract as useWagmiReadContract,
  useWriteContract as useWagmiWriteContract,
} from 'wagmi'
import type {
  UseReadContractParams,
  UseReadContractReturn,
  UseWriteContractReturn,
} from './types'
import type { Address, Abi } from 'viem'

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

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useWagmiReadContract({
    address: address as Address,
    abi: abi as Abi,
    functionName,
    args: args as readonly unknown[],
    chainId,
    query: {
      refetchInterval: watch ? 10000 : false,
    },
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
  const { writeContractAsync, isPending: wagmiIsPending } = useWagmiWriteContract()
  const [error, setError] = useState<Error | null>(null)

  const writeContract = useCallback(
    async (params: {
      address: Address
      abi: readonly unknown[]
      functionName: string
      args?: readonly unknown[]
      value?: bigint
    }): Promise<`0x${string}`> => {
      setError(null)

      try {
        const hash = await writeContractAsync({
          address: params.address,
          abi: params.abi as Abi,
          functionName: params.functionName,
          args: params.args,
          value: params.value,
        })

        return hash
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Contract write failed')
        setError(error)
        throw error
      }
    },
    [writeContractAsync]
  )

  return { writeContract, isPending: wagmiIsPending, error }
}
