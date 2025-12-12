/**
 * Balance Hook - Thirdweb Implementation
 *
 * Provides balance fetching using Thirdweb hooks.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount, useActiveWallet, useWalletBalance } from 'thirdweb/react'
import { defineChain } from 'thirdweb'
import { getThirdwebClient } from './thirdweb-client'
import type { UseBalanceParams, UseBalanceReturn } from './types'

/**
 * Hook to get token or native balance
 *
 * @param params - Balance parameters (address, token, chainId)
 * @returns Balance information
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { address } = useAccount()
 *
 *   // Native balance
 *   const { balance, formatted, symbol } = useBalance({ address })
 *
 *   // ERC20 balance
 *   const { balance: usdcBalance } = useBalance({
 *     address,
 *     token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
 *   })
 * }
 * ```
 */
export function useBalance(params: UseBalanceParams = {}): UseBalanceReturn {
  const { address, token, chainId, watch = false } = params

  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  // Determine the address to use
  const targetAddress = address || account?.address

  // Get chain ID from wallet if not provided
  const effectiveChainId = chainId || wallet?.getChain()?.id

  // Use Thirdweb's balance hook for native balance
  const {
    data: balanceData,
    isLoading,
    isFetching,
    error,
    refetch: thirdwebRefetch,
  } = useWalletBalance({
    client: getThirdwebClient(),
    chain: effectiveChainId ? defineChain(effectiveChainId) : undefined,
    address: targetAddress as `0x${string}`,
    tokenAddress: token,
  })

  // Setup watch interval
  useEffect(() => {
    if (!watch) return

    const interval = setInterval(() => {
      setRefetchTrigger((prev) => prev + 1)
    }, 10000)

    return () => clearInterval(interval)
  }, [watch])

  // Refetch when trigger changes
  useEffect(() => {
    if (refetchTrigger > 0) {
      thirdwebRefetch()
    }
  }, [refetchTrigger, thirdwebRefetch])

  const refetch = useCallback(() => {
    thirdwebRefetch()
  }, [thirdwebRefetch])

  return {
    balance: balanceData?.value,
    formatted: balanceData?.displayValue,
    symbol: balanceData?.symbol,
    decimals: balanceData?.decimals,
    isLoading,
    isRefetching: isFetching && !isLoading,
    error: error as Error | null,
    refetch,
  }
}
