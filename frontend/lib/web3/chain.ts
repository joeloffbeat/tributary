/**
 * Chain Hooks - Thirdweb Implementation
 *
 * Provides chain-related functionality using Thirdweb hooks.
 */

'use client'

import { useCallback, useState, useMemo } from 'react'
import { useActiveWallet, useSwitchActiveWalletChain } from 'thirdweb/react'
import { defineChain } from 'thirdweb'
import type { UseSwitchChainReturn, UseChainsReturn } from './types'
import type { Chain } from 'viem'
import { getSupportedViemChains, getChainById } from '@/lib/config/chains'

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
  const wallet = useActiveWallet()

  return useMemo(() => {
    if (!wallet) return undefined
    try {
      const chain = wallet.getChain()
      return chain?.id
    } catch {
      return undefined
    }
  }, [wallet])
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
  const switchActiveWalletChain = useSwitchActiveWalletChain()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const switchChain = useCallback(
    async (chainId: number) => {
      setIsPending(true)
      setError(null)
      try {
        // Get chain config to use custom RPC if available (for chains not supported by Thirdweb proxy)
        const chainConfig = getChainById(chainId)

        // Define chain with custom RPC URL if we have one (bypasses Thirdweb's proxy)
        const thirdwebChain = chainConfig?.rpcUrl
          ? defineChain({
              id: chainId,
              rpc: chainConfig.rpcUrl,
              name: chainConfig.name,
              nativeCurrency: chainConfig.chain.nativeCurrency,
              blockExplorers: chainConfig.chain.blockExplorers ? [
                {
                  name: chainConfig.chain.blockExplorers.default.name,
                  url: chainConfig.chain.blockExplorers.default.url,
                }
              ] : undefined,
              testnet: chainConfig.isTestnet || undefined,
            })
          : defineChain(chainId)

        await switchActiveWalletChain(thirdwebChain)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to switch chain')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [switchActiveWalletChain]
  )

  return { switchChain, isPending, error }
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
  // Get configured chains from app config
  const chains = getSupportedViemChains() as readonly Chain[]
  return { chains }
}
