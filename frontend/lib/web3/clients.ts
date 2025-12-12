/**
 * Client Hooks - Thirdweb Implementation
 *
 * Provides viem PublicClient and WalletClient compatible interfaces using Thirdweb.
 */

'use client'

import { useMemo } from 'react'
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import type { PublicClient, WalletClient, Chain } from 'viem'
import { useActiveAccount, useActiveWallet } from 'thirdweb/react'
import { getThirdwebClient } from './thirdweb-client'
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
 *
 *   const getBalance = async (address: string) => {
 *     if (!publicClient) return
 *     return await publicClient.getBalance({ address })
 *   }
 * }
 * ```
 */
export function usePublicClient(params?: { chainId?: number }): UsePublicClientReturn {
  const wallet = useActiveWallet()
  const specificChainId = params?.chainId

  const publicClient = useMemo(() => {
    // If a specific chainId is requested, create a client for that chain
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

    // Otherwise use the wallet's current chain
    if (!wallet) return undefined

    try {
      const thirdwebChain = wallet.getChain()
      if (!thirdwebChain) return undefined

      // Get the chain config to use the native RPC URL (not Thirdweb's proxy)
      const chainConfig = getChainById(thirdwebChain.id)
      const rpcUrl = chainConfig?.rpcUrl || thirdwebChain.rpc

      const viemChain: Chain = {
        id: thirdwebChain.id,
        name: thirdwebChain.name || chainConfig?.name || `Chain ${thirdwebChain.id}`,
        nativeCurrency: {
          name: thirdwebChain.nativeCurrency?.name || 'Ether',
          symbol: thirdwebChain.nativeCurrency?.symbol || 'ETH',
          decimals: thirdwebChain.nativeCurrency?.decimals || 18,
        },
        rpcUrls: {
          default: { http: [rpcUrl] },
        },
      }

      return createPublicClient({
        chain: viemChain,
        transport: http(rpcUrl),
      }) as PublicClient
    } catch (e) {
      console.warn('Failed to create public client:', e)
      return undefined
    }
  }, [wallet, specificChainId])

  return { publicClient }
}

/**
 * Hook to get a viem WalletClient for the connected wallet
 *
 * Creates a WalletClient that wraps the Thirdweb account for signing operations.
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
  const account = useActiveAccount()
  const wallet = useActiveWallet()

  const walletClient = useMemo(() => {
    if (!account || !wallet) return undefined

    try {
      const thirdwebChain = wallet.getChain()
      if (!thirdwebChain) return undefined

      // Get the chain config to use the native RPC URL (not Thirdweb's proxy)
      const chainConfig = getChainById(thirdwebChain.id)
      const rpcUrl = chainConfig?.rpcUrl || thirdwebChain.rpc

      const viemChain: Chain = {
        id: thirdwebChain.id,
        name: thirdwebChain.name || chainConfig?.name || `Chain ${thirdwebChain.id}`,
        nativeCurrency: {
          name: thirdwebChain.nativeCurrency?.name || 'Ether',
          symbol: thirdwebChain.nativeCurrency?.symbol || 'ETH',
          decimals: thirdwebChain.nativeCurrency?.decimals || 18,
        },
        rpcUrls: {
          default: { http: [rpcUrl] },
        },
      }

      // Create a custom transport that uses Thirdweb for signing
      // but falls back to RPC for other operations
      const thirdwebTransport = custom({
        async request({ method, params }) {
          // Handle signing methods through Thirdweb account
          if (method === 'eth_sendTransaction') {
            const txParams = (params as any[])[0]
            const client = getThirdwebClient()
            const { sendTransaction } = await import('thirdweb')
            const { prepareTransaction } = await import('thirdweb')

            const prepared = prepareTransaction({
              chain: thirdwebChain,
              client,
              to: txParams.to,
              value: txParams.value ? BigInt(txParams.value) : undefined,
              data: txParams.data,
              gas: txParams.gas ? BigInt(txParams.gas) : undefined,
            })

            const result = await sendTransaction({
              transaction: prepared,
              account,
            })

            return result.transactionHash
          }

          if (method === 'personal_sign' || method === 'eth_sign') {
            const message = (params as any[])[0]
            const signature = await account.signMessage({ message })
            return signature
          }

          if (method === 'eth_signTypedData_v4') {
            const typedData = JSON.parse((params as any[])[1])
            const signature = await account.signTypedData(typedData)
            return signature
          }

          // For other methods, use native RPC (bypasses Thirdweb proxy for unsupported chains)
          const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: Date.now(),
              method,
              params,
            }),
          })
          const data = await response.json()
          if (data.error) {
            throw new Error(data.error.message || 'RPC error')
          }
          return data.result
        },
      })

      return createWalletClient({
        account: account.address as `0x${string}`,
        chain: viemChain,
        transport: thirdwebTransport,
      }) as WalletClient
    } catch (e) {
      console.warn('Failed to create wallet client:', e)
      return undefined
    }
  }, [account, wallet])

  return { walletClient, isLoading: false }
}
