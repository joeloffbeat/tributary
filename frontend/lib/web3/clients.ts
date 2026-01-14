/**
 * Client Hooks - Wagmi/Privy Implementation
 *
 * Provides viem PublicClient and WalletClient using wagmi.
 */

'use client'

import { useMemo } from 'react'
import {
  usePublicClient as useWagmiPublicClient,
  useWalletClient as useWagmiWalletClient,
} from 'wagmi'
import { createPublicClient, http } from 'viem'
import type { PublicClient, WalletClient, Chain } from 'viem'
import { getChainById } from '@/lib/config/chains'
import type { UsePublicClientReturn, UseWalletClientReturn } from './types'

/**
 * Hook to get a viem PublicClient for the current chain or a specific chain
 *
 * @param params - Optional parameters including chainId for multi-chain support
 * @returns Object with publicClient for read operations
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   // Use current wallet chain
 *   const { publicClient } = usePublicClient()
 *
 *   // Or specify a specific chain
 *   const { publicClient: ethClient } = usePublicClient({ chainId: 1 })
 * }
 * ```
 */
export function usePublicClient(params?: { chainId?: number }): UsePublicClientReturn {
  const specificChainId = params?.chainId
  const wagmiClient = useWagmiPublicClient({ chainId: specificChainId })

  const publicClient = useMemo(() => {
    // If wagmi provides a client, use it
    if (wagmiClient) {
      return wagmiClient as PublicClient
    }

    // Otherwise, create one for the specific chain
    if (specificChainId) {
      const chainConfig = getChainById(specificChainId)
      if (!chainConfig?.rpcUrl) {
        console.warn(`No RPC URL configured for chain ${specificChainId}`)
        return undefined
      }

      const viemChain: Chain = {
        id: specificChainId,
        name: chainConfig.name || `Chain ${specificChainId}`,
        nativeCurrency: chainConfig.chain.nativeCurrency || {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: { http: [chainConfig.rpcUrl] },
        },
      }

      return createPublicClient({
        chain: viemChain,
        transport: http(chainConfig.rpcUrl),
      }) as PublicClient
    }

    return undefined
  }, [wagmiClient, specificChainId])

  return { publicClient }
}

/**
 * Hook to get a viem WalletClient for the connected wallet
 *
 * @returns Object with walletClient for write operations and isLoading state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { walletClient, isLoading } = useWalletClient()
 *
 *   const sendTx = async () => {
 *     if (!walletClient) return
 *     const hash = await walletClient.sendTransaction({
 *       to: '0x...',
 *       value: parseEther('0.01'),
 *     })
 *   }
 * }
 * ```
 */
export function useWalletClient(): UseWalletClientReturn {
  const { data: walletClient, isLoading } = useWagmiWalletClient()

  return {
    walletClient: walletClient as WalletClient | undefined,
    isLoading,
  }
}
