/**
 * Balance Hook - Wagmi/Privy Implementation
 *
 * Provides balance fetching using wagmi hooks.
 */

'use client'

import { useCallback } from 'react'
import { useBalance as useWagmiBalance, useAccount } from 'wagmi'
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
  const { address: paramAddress, token, chainId, watch = false } = params

  const { address: connectedAddress } = useAccount()

  // Determine the address to use
  const targetAddress = paramAddress || connectedAddress

  const {
    data: balanceData,
    isLoading,
    isFetching,
    error,
    refetch: wagmiRefetch,
  } = useWagmiBalance({
    address: targetAddress as `0x${string}`,
    chainId,
    token: token as `0x${string}` | undefined,
    query: {
      enabled: !!targetAddress,
      refetchInterval: watch ? 10000 : false,
    },
  })

  const refetch = useCallback(() => {
    wagmiRefetch()
  }, [wagmiRefetch])

  return {
    balance: balanceData?.value,
    formatted: balanceData?.formatted,
    symbol: balanceData?.symbol,
    decimals: balanceData?.decimals,
    isLoading,
    isRefetching: isFetching && !isLoading,
    error: error as Error | null,
    refetch,
  }
}
