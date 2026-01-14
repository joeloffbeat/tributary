/**
 * Connection Hooks - Privy Implementation
 *
 * Provides connect/disconnect functionality using Privy.
 */

'use client'

import { useCallback, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import type { UseConnectReturn, UseDisconnectReturn } from './types'

/**
 * Hook to connect a wallet
 *
 * Opens the Privy connect modal for wallet connection.
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
  const { login, ready } = usePrivy()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const connect = useCallback(() => {
    if (!ready) return

    setIsPending(true)
    setError(null)

    try {
      login()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect')
      setError(error)
    } finally {
      setIsPending(false)
    }
  }, [login, ready])

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
  const { logout, authenticated } = usePrivy()
  const [isPending, setIsPending] = useState(false)

  const disconnect = useCallback(() => {
    if (!authenticated) return

    setIsPending(true)
    try {
      logout()
    } finally {
      setIsPending(false)
    }
  }, [logout, authenticated])

  return { disconnect, isPending }
}
