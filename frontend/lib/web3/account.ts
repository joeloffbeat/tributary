/**
 * Account Hook - Thirdweb Implementation
 *
 * Provides account information using Thirdweb's useActiveAccount and useActiveWallet hooks.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount, useActiveWallet } from 'thirdweb/react'
import type { Web3Account } from './types'
import type { Chain } from 'viem'

/**
 * Hook to get the connected account information
 *
 * @returns Account information including address, connection status, and chain
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { address, isConnected, chain } = useAccount()
 *
 *   if (!isConnected) return <div>Not connected</div>
 *   return <div>Connected: {address}</div>
 * }
 * ```
 */
export function useAccount(): Web3Account {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const [chain, setChain] = useState<Chain | undefined>(undefined)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainUpdateTrigger, setChainUpdateTrigger] = useState(0)

  // Function to fetch and update chain
  const updateChain = useCallback(async () => {
    if (wallet) {
      try {
        const thirdwebChain = wallet.getChain()
        if (thirdwebChain) {
          // Convert Thirdweb chain to viem-compatible chain
          setChain({
            id: thirdwebChain.id,
            name: thirdwebChain.name || `Chain ${thirdwebChain.id}`,
            nativeCurrency: thirdwebChain.nativeCurrency || {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: {
              default: { http: [thirdwebChain.rpc] },
            },
            blockExplorers: thirdwebChain.blockExplorers?.[0]
              ? {
                  default: {
                    name: thirdwebChain.blockExplorers[0].name,
                    url: thirdwebChain.blockExplorers[0].url,
                  },
                }
              : undefined,
          } as Chain)
        } else {
          setChain(undefined)
        }
      } catch (e) {
        console.warn('Failed to get chain from wallet:', e)
        setChain(undefined)
      }
    } else {
      setChain(undefined)
    }
  }, [wallet])

  // Initial chain fetch and when wallet changes
  useEffect(() => {
    updateChain()
  }, [wallet, updateChain, chainUpdateTrigger])

  // Subscribe to wallet events for chain changes
  useEffect(() => {
    if (wallet) {
      // Subscribe to chain changes
      const unsubscribeChain = wallet.subscribe('chainChanged', () => {
        // Trigger re-fetch of chain
        setChainUpdateTrigger(prev => prev + 1)
      })

      // Subscribe to account changes
      const unsubscribeAccount = wallet.subscribe('accountChanged', () => {
        // Account changed, chain might also change
        setChainUpdateTrigger(prev => prev + 1)
      })

      return () => {
        unsubscribeChain?.()
        unsubscribeAccount?.()
      }
    }
  }, [wallet])

  const isConnected = !!account?.address
  const isDisconnected = !account && !isConnecting

  // Check if this is a smart account (has sendBatchTransaction capability)
  // Smart accounts in Thirdweb are created when accountAbstraction is enabled
  const isSmartAccount = !!(account && 'sendBatchTransaction' in account)

  // Get wallet type ID if available
  const walletId = wallet?.id

  return {
    address: account?.address as `0x${string}` | undefined,
    isConnected,
    isConnecting,
    isDisconnected,
    chain,
    chainId: chain?.id,
    isSmartAccount,
    walletId,
  }
}

/**
 * Hook to check if the connected wallet is a smart account
 *
 * @returns Object with smart account detection info
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isSmartAccount, walletType } = useIsSmartAccount()
 *
 *   if (isSmartAccount) {
 *     return <div>You're using a smart account</div>
 *   }
 *   return <div>You're using an EOA wallet</div>
 * }
 * ```
 */
export function useIsSmartAccount(): {
  isSmartAccount: boolean
  walletId: string | undefined
  isLoading: boolean
} {
  const account = useActiveAccount()
  const wallet = useActiveWallet()

  // Smart accounts in Thirdweb have sendBatchTransaction method
  const isSmartAccount = !!(account && 'sendBatchTransaction' in account)
  const walletId = wallet?.id
  const isLoading = !account && !!wallet

  return {
    isSmartAccount,
    walletId,
    isLoading,
  }
}
