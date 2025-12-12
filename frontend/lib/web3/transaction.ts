/**
 * Transaction Hooks - Thirdweb Implementation
 *
 * Provides transaction functionality using Thirdweb SDK.
 */

'use client'

import { useCallback, useState, useEffect } from 'react'
import { useActiveAccount, useActiveWallet, useSendTransaction as useThirdwebSendTransaction } from 'thirdweb/react'
import { prepareTransaction, waitForReceipt } from 'thirdweb'
import { getThirdwebClient } from './thirdweb-client'
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
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const { mutateAsync: sendTx } = useThirdwebSendTransaction()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const sendTransaction = useCallback(
    async (tx: TransactionRequest): Promise<`0x${string}`> => {
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

        // Prepare the transaction
        const prepared = prepareTransaction({
          chain,
          client,
          to: tx.to,
          value: tx.value,
          data: tx.data,
          gas: tx.gas,
          gasPrice: tx.gasPrice,
          maxFeePerGas: tx.maxFeePerGas,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
        })

        // Send the transaction
        const result = await sendTx(prepared)

        return result.transactionHash as `0x${string}`
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transaction failed')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [account, wallet, sendTx]
  )

  return { sendTransaction, isPending, error }
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
export function useGasPrice(): { gasPrice: bigint | undefined; isLoading: boolean; refetch: () => void } {
  const wallet = useActiveWallet()
  const [gasPrice, setGasPrice] = useState<bigint | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [fetchTrigger, setFetchTrigger] = useState(0)

  const refetch = useCallback(() => {
    setFetchTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (!wallet) {
      setGasPrice(undefined)
      return
    }

    const thirdwebChain = wallet.getChain()
    if (!thirdwebChain) {
      setGasPrice(undefined)
      return
    }

    const fetchGasPriceFromRpc = async () => {
      setIsLoading(true)
      try {
        // Get chain config to use native RPC URL (more reliable than Thirdweb proxy)
        const { getChainById } = await import('@/lib/config/chains')
        const chainConfig = getChainById(thirdwebChain.id)
        const rpcUrl = chainConfig?.rpcUrl || thirdwebChain.rpc

        // Make direct RPC call to get gas price
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'eth_gasPrice',
            params: [],
          }),
        })

        const data = await response.json()
        if (data.error) {
          throw new Error(data.error.message || 'RPC error')
        }

        setGasPrice(BigInt(data.result))
      } catch (err) {
        console.warn('Failed to fetch gas price:', err)
        setGasPrice(undefined)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGasPriceFromRpc()

    // Refresh gas price every 15 seconds
    const interval = setInterval(fetchGasPriceFromRpc, 15000)
    return () => clearInterval(interval)
  }, [wallet, fetchTrigger])

  return { gasPrice, isLoading, refetch }
}

export function useWaitForTransaction(
  params: UseWaitForTransactionParams
): UseWaitForTransactionReturn {
  const { hash, confirmations = 1 } = params
  const wallet = useActiveWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!hash || !wallet) return

    const chain = wallet.getChain()
    if (!chain) return

    setIsLoading(true)
    setIsSuccess(false)
    setIsError(false)
    setError(null)

    const client = getThirdwebClient()

    waitForReceipt({
      client,
      chain,
      transactionHash: hash,
    })
      .then((receipt) => {
        if (receipt.status === 'success') {
          setIsSuccess(true)
        } else {
          setIsError(true)
          setError(new Error('Transaction reverted'))
        }
      })
      .catch((err) => {
        setIsError(true)
        setError(err instanceof Error ? err : new Error('Failed to get receipt'))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [hash, wallet, confirmations])

  return {
    isLoading,
    isSuccess,
    isError,
    error,
  }
}
