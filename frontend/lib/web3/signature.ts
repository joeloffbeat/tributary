/**
 * Signature Hooks - Thirdweb Implementation
 *
 * Provides message signing functionality using Thirdweb SDK.
 */

'use client'

import { useCallback, useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
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
  const account = useActiveAccount()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signMessage = useCallback(
    async (message: string): Promise<`0x${string}`> => {
      if (!account) {
        throw new Error('Wallet not connected')
      }

      setIsPending(true)
      setError(null)

      try {
        const signature = await account.signMessage({ message })
        return signature as `0x${string}`
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sign message')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [account]
  )

  return { signMessage, isPending, error }
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
  const account = useActiveAccount()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signTypedData = useCallback(
    async (typedData: unknown): Promise<`0x${string}`> => {
      if (!account) {
        throw new Error('Wallet not connected')
      }

      setIsPending(true)
      setError(null)

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signature = await account.signTypedData(typedData as any)
        return signature as `0x${string}`
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sign typed data')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [account]
  )

  return { signTypedData, isPending, error }
}
