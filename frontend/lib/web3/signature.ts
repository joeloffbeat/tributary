/**
 * Signature Hooks - Wagmi/Privy Implementation
 *
 * Provides message signing functionality using wagmi hooks.
 */

'use client'

import { useCallback, useState } from 'react'
import { useSignMessage as useWagmiSignMessage, useSignTypedData as useWagmiSignTypedData } from 'wagmi'
import type { UseSignMessageReturn, UseSignTypedDataReturn } from './types'

/**
 * Hook to sign a message
 *
 * @returns Object with signMessage function, pending state, and error
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { signMessage, isPending } = useSignMessage()
 *
 *   const handleSign = async () => {
 *     const signature = await signMessage('Hello, World!')
 *     console.log('Signature:', signature)
 *   }
 * }
 * ```
 */
export function useSignMessage(): UseSignMessageReturn {
  const { signMessageAsync, isPending: wagmiIsPending } = useWagmiSignMessage()
  const [error, setError] = useState<Error | null>(null)

  const signMessage = useCallback(
    async (message: string): Promise<`0x${string}`> => {
      setError(null)

      try {
        const signature = await signMessageAsync({ message })
        return signature
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sign message')
        setError(error)
        throw error
      }
    },
    [signMessageAsync]
  )

  return { signMessage, isPending: wagmiIsPending, error }
}

/**
 * Hook to sign typed data (EIP-712)
 *
 * @returns Object with signTypedData function, pending state, and error
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { signTypedData, isPending } = useSignTypedData()
 *
 *   const handleSign = async () => {
 *     const signature = await signTypedData({
 *       domain: { ... },
 *       types: { ... },
 *       primaryType: 'Mail',
 *       message: { ... },
 *     })
 *   }
 * }
 * ```
 */
export function useSignTypedData(): UseSignTypedDataReturn {
  const { signTypedDataAsync, isPending: wagmiIsPending } = useWagmiSignTypedData()
  const [error, setError] = useState<Error | null>(null)

  const signTypedData = useCallback(
    async (typedData: unknown): Promise<`0x${string}`> => {
      setError(null)

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signature = await signTypedDataAsync(typedData as any)
        return signature
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sign typed data')
        setError(error)
        throw error
      }
    },
    [signTypedDataAsync]
  )

  return { signTypedData, isPending: wagmiIsPending, error }
}
