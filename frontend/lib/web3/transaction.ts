/**
 * Transaction Hooks - Wagmi/Privy Implementation
 *
 * Provides transaction functionality using wagmi hooks.
 */

'use client'

import { useCallback, useState } from 'react'
import {
  useSendTransaction as useWagmiSendTransaction,
  useWaitForTransactionReceipt,
  useGasPrice as useWagmiGasPrice,
} from 'wagmi'
import type {
  TransactionRequest,
  UseSendTransactionReturn,
  UseWaitForTransactionParams,
  UseWaitForTransactionReturn,
} from './types'

/**
 * Hook to send a transaction
 *
 * @returns Object with sendTransaction function, pending state, and error
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { sendTransaction, isPending, error } = useSendTransaction()
 *
 *   const handleSend = async () => {
 *     const hash = await sendTransaction({
 *       to: '0x...',
 *       value: parseEther('0.01'),
 *     })
 *     console.log('Transaction hash:', hash)
 *   }
 * }
 * ```
 */
export function useSendTransaction(): UseSendTransactionReturn {
  const { sendTransactionAsync, isPending: wagmiIsPending } = useWagmiSendTransaction()
  const [error, setError] = useState<Error | null>(null)

  const sendTransaction = useCallback(
    async (tx: TransactionRequest): Promise<`0x${string}`> => {
      setError(null)

      try {
        const hash = await sendTransactionAsync({
          to: tx.to,
          value: tx.value,
          data: tx.data,
          gas: tx.gas,
          gasPrice: tx.gasPrice,
          maxFeePerGas: tx.maxFeePerGas,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
        })

        return hash
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transaction failed')
        setError(error)
        throw error
      }
    },
    [sendTransactionAsync]
  )

  return { sendTransaction, isPending: wagmiIsPending, error }
}

/**
 * Hook to wait for a transaction to be confirmed
 *
 * @param params - Transaction parameters (hash, confirmations)
 * @returns Transaction status
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [txHash, setTxHash] = useState<`0x${string}`>()
 *   const { isLoading, isSuccess, isError } = useWaitForTransaction({ hash: txHash })
 *
 *   if (isLoading) return <div>Confirming...</div>
 *   if (isSuccess) return <div>Confirmed!</div>
 *   if (isError) return <div>Failed</div>
 * }
 * ```
 */
export function useWaitForTransaction(
  params: UseWaitForTransactionParams
): UseWaitForTransactionReturn {
  const { hash, confirmations = 1 } = params

  const { isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash,
    confirmations,
  })

  return {
    isLoading,
    isSuccess,
    isError,
    error: error as Error | null,
  }
}

/**
 * Hook to get current gas price
 *
 * @returns Object with gasPrice, isLoading state, and refetch function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { gasPrice, isLoading, refetch } = useGasPrice()
 *
 *   if (isLoading) return <div>Loading...</div>
 *   return <div>Gas: {formatGwei(gasPrice)} gwei</div>
 * }
 * ```
 */
export function useGasPrice(): {
  gasPrice: bigint | undefined
  isLoading: boolean
  refetch: () => void
} {
  const { data: gasPrice, isLoading, refetch } = useWagmiGasPrice({
    query: {
      refetchInterval: 15000, // Refresh every 15 seconds
    },
  })

  return { gasPrice, isLoading, refetch }
}
