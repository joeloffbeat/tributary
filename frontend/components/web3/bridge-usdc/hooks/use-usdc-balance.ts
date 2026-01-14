// =============================================================================
// USDC Balance Hook
// =============================================================================

import { useState, useEffect, useCallback } from 'react'
import { formatUnits, createPublicClient, http } from 'viem'
import { sepolia, polygonAmoy, avalancheFuji } from 'viem/chains'
import { defineChain } from 'viem'
import { useAccount } from '@/lib/web3'
import { getUsdcChainConfig, ERC20_ABI, isUsdcBridgeSupported } from '../constants'

// Story Aenid chain definition
const storyAenid = defineChain({
  id: 1315,
  name: 'Story Aenid Testnet',
  nativeCurrency: { decimals: 18, name: 'IP', symbol: 'IP' },
  rpcUrls: { default: { http: ['https://aeneid.storyrpc.io'] } },
  blockExplorers: { default: { name: 'Story Explorer', url: 'https://aeneid.storyscan.xyz' } },
  testnet: true,
})

// Chain map for creating public clients
const CHAIN_MAP: Record<number, any> = {
  11155111: sepolia,
  1315: storyAenid,
  43113: avalancheFuji,
  80002: polygonAmoy,
}

interface UseUsdcBalanceReturn {
  balance: bigint
  formattedBalance: string
  isLoading: boolean
  isSupported: boolean
  refetch: () => Promise<void>
}

export function useUsdcBalance(): UseUsdcBalanceReturn {
  const { address, chainId } = useAccount()
  const [balance, setBalance] = useState<bigint>(0n)
  const [isLoading, setIsLoading] = useState(false)

  const isSupported = chainId ? isUsdcBridgeSupported(chainId) : false

  const fetchBalance = useCallback(async () => {
    if (!address || !chainId) {
      setBalance(0n)
      return
    }

    const config = getUsdcChainConfig(chainId)
    if (!config) {
      setBalance(0n)
      return
    }

    setIsLoading(true)
    try {
      const chain = CHAIN_MAP[chainId]
      if (!chain) {
        setBalance(0n)
        return
      }

      const client = createPublicClient({
        chain,
        transport: http(),
      })

      const bal = await client.readContract({
        address: config.tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint

      setBalance(bal)
    } catch (error) {
      console.error('Failed to fetch USDC balance:', error)
      setBalance(0n)
    } finally {
      setIsLoading(false)
    }
  }, [address, chainId])

  // Fetch on mount and when address/chain changes
  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [fetchBalance])

  const formattedBalance = formatUnits(balance, 6)

  return {
    balance,
    formattedBalance,
    isLoading,
    isSupported,
    refetch: fetchBalance,
  }
}
