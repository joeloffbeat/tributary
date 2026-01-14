/**
 * Chain Hooks - Wagmi/Privy Implementation
 *
 * Provides chain-related functionality using wagmi hooks.
 */

'use client'

import { useCallback, useState } from 'react'
import { useChainId as useWagmiChainId, useSwitchChain as useWagmiSwitchChain, useChains as useWagmiChains } from 'wagmi'
import type { UseSwitchChainReturn, UseChainsReturn } from './types'
import type { Chain } from 'viem'
import { getSupportedViemChains } from '@/lib/config/chains'

/**
 * Hook to get the current chain ID
 *
 * @returns The current chain ID or undefined
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const chainId = useChainId()
 *   return <div>Chain: {chainId}</div>
 * }
 * ```
 */
export function useChainId(): number | undefined {
  return useWagmiChainId()
}

/**
 * Hook to switch chains
 *
 * @returns Object with switchChain function, pending state, and error
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { switchChain, isPending, error } = useSwitchChain()
 *
 *   const handleSwitch = async () => {
 *     await switchChain(10) // Switch to Optimism
 *   }
 * }
 * ```
 */
export function useSwitchChain(): UseSwitchChainReturn {
  const { switchChainAsync, isPending: wagmiIsPending } = useWagmiSwitchChain()
  const [error, setError] = useState<Error | null>(null)

  const switchChain = useCallback(
    async (chainId: number) => {
      setError(null)
      try {
        await switchChainAsync({ chainId })
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to switch chain')
        setError(error)
        throw error
      }
    },
    [switchChainAsync]
  )

  return { switchChain, isPending: wagmiIsPending, error }
}

/**
 * Hook to get all configured chains
 *
 * @returns Object with chains array
 *
 * @example
 * ```tsx
 * function ChainSelector() {
 *   const { chains } = useChains()
 *
 *   return (
 *     <select>
 *       {chains.map(chain => (
 *         <option key={chain.id} value={chain.id}>
 *           {chain.name}
 *         </option>
 *       ))}
 *     </select>
 *   )
 * }
 * ```
 */
export function useChains(): UseChainsReturn {
  const wagmiChains = useWagmiChains()
  // Use wagmi chains if available, otherwise fall back to configured chains
  const chains = wagmiChains.length > 0
    ? (wagmiChains as readonly Chain[])
    : (getSupportedViemChains() as readonly Chain[])
  return { chains }
}
