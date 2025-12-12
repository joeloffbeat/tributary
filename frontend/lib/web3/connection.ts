/**
 * Connection Hooks - Thirdweb Implementation
 *
 * Provides connect/disconnect functionality using Thirdweb.
 */

'use client'

import { useCallback, useState } from 'react'
import { useActiveWallet, useConnect as useThirdwebConnect, useDisconnect as useThirdwebDisconnect } from 'thirdweb/react'
import { createWallet } from 'thirdweb/wallets'
import { getThirdwebClient } from './thirdweb-client'
import type { UseConnectReturn, UseDisconnectReturn } from './types'

/**
 * Hook to connect a wallet
 *
 * Opens the Thirdweb connect modal for wallet connection.
 * Note: For full modal functionality, use the ConnectButton component instead.
 *
 * @returns Object with connect function, pending state, and error
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { connect, isPending } = useConnect()
 *
 *   return (
 *     <button onClick={connect} disabled={isPending}>
 *       {isPending ? 'Connecting...' : 'Connect Wallet'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useConnect(): UseConnectReturn {
  const { connect: thirdwebConnect } = useThirdwebConnect()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const connect = useCallback(() => {
    setIsPending(true)
    setError(null)

    try {
      const client = getThirdwebClient()

      // Connect with MetaMask as default
      // For full wallet options, use ConnectButton component
      thirdwebConnect(async () => {
        const wallet = createWallet('io.metamask')
        await wallet.connect({ client })
        return wallet
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect')
      setError(error)
    } finally {
      setIsPending(false)
    }
  }, [thirdwebConnect])

  return { connect, isPending, error }
}

/**
 * Hook to disconnect the wallet
 *
 * @returns Object with disconnect function and pending state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { disconnect, isPending } = useDisconnect()
 *
 *   return (
 *     <button onClick={disconnect} disabled={isPending}>
 *       Disconnect
 *     </button>
 *   )
 * }
 * ```
 */
export function useDisconnect(): UseDisconnectReturn {
  const { disconnect: thirdwebDisconnect } = useThirdwebDisconnect()
  const wallet = useActiveWallet()
  const [isPending, setIsPending] = useState(false)

  const disconnect = useCallback(() => {
    if (!wallet) return

    setIsPending(true)
    try {
      thirdwebDisconnect(wallet)
    } finally {
      setIsPending(false)
    }
  }, [thirdwebDisconnect, wallet])

  return { disconnect, isPending }
}
