/**
 * Account Hook - Wagmi/Privy Implementation
 *
 * Provides account information using wagmi hooks.
 */

'use client'

import { useAccount as useWagmiAccount, useChainId } from 'wagmi'
import type { Web3Account } from './types'
import { getChainById } from '@/lib/config/chains'

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
  const {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chain,
    connector,
  } = useWagmiAccount()

  const chainId = useChainId()

  return {
    address: address as `0x${string}` | undefined,
    isConnected,
    isConnecting,
    isDisconnected,
    chain,
    chainId: chain?.id || chainId,
    isSmartAccount: false, // Privy embedded wallets are EOAs by default
    walletId: connector?.id,
  }
}

/**
 * Hook to check if the connected wallet is a smart account
 *
 * @returns Object with smart account detection info
 */
export function useIsSmartAccount(): {
  isSmartAccount: boolean
  walletId: string | undefined
  isLoading: boolean
} {
  const { connector, isConnecting } = useWagmiAccount()

  return {
    isSmartAccount: false, // Privy uses EOAs
    walletId: connector?.id,
    isLoading: isConnecting,
  }
}
