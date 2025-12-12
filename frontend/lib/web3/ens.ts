/**
 * ENS Hooks - Thirdweb Implementation
 *
 * Provides ENS name and avatar resolution.
 * Uses viem directly since Thirdweb doesn't have built-in ENS support.
 */

'use client'

import { useState, useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import type {
  UseEnsNameParams,
  UseEnsNameReturn,
  UseEnsAvatarParams,
  UseEnsAvatarReturn,
} from './types'

// Create a public client for ENS resolution on mainnet
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

/**
 * Hook to resolve an address to an ENS name
 *
 * @param params - ENS parameters (address, chainId)
 * @returns ENS name or null
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { address } = useAccount()
 *   const { ensName } = useEnsName({ address })
 *
 *   return <div>{ensName ?? address}</div>
 * }
 * ```
 */
export function useEnsName(params: UseEnsNameParams): UseEnsNameReturn {
  const { address } = params
  const [ensName, setEnsName] = useState<string | null | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setEnsName(undefined)
      return
    }

    setIsLoading(true)
    setError(null)

    ensClient
      .getEnsName({ address })
      .then((name) => {
        setEnsName(name)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to resolve ENS name'))
        setEnsName(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [address])

  return {
    ensName,
    isLoading,
    error,
  }
}

/**
 * Hook to get an ENS avatar
 *
 * @param params - ENS parameters (name, chainId)
 * @returns Avatar URL or null
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { ensName } = useEnsName({ address })
 *   const { ensAvatar } = useEnsAvatar({ name: ensName })
 *
 *   return ensAvatar ? <img src={ensAvatar} alt="Avatar" /> : null
 * }
 * ```
 */
export function useEnsAvatar(params: UseEnsAvatarParams): UseEnsAvatarReturn {
  const { name } = params
  const [ensAvatar, setEnsAvatar] = useState<string | null | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!name) {
      setEnsAvatar(undefined)
      return
    }

    setIsLoading(true)
    setError(null)

    ensClient
      .getEnsAvatar({ name })
      .then((avatar) => {
        setEnsAvatar(avatar)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to resolve ENS avatar'))
        setEnsAvatar(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [name])

  return {
    ensAvatar,
    isLoading,
    error,
  }
}
