import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletClient, usePublicClient } from '@/lib/web3'
import { TRIBUTARY_CONTRACTS } from '@/constants/tributary'
import { FACTORY_ABI } from '@/constants/tributary/abis'

export interface VaultFormData {
  // Step 1: IP Selection
  storyIPId: string
  ipName: string
  // Step 2: Token Config
  tokenName: string
  tokenSymbol: string
  creatorAllocation: number // Out of 10,000
  // Step 3: Economics
  dividendBps: number      // Basis points (500 = 5%)
  tradingFeeBps: number    // Basis points (100 = 1%)
  initialPrice: number     // USD per token
}

export function useCreateVault() {
  const router = useRouter()
  const walletClient = useWalletClient()
  const publicClient = usePublicClient()
  const [isCreating, setIsCreating] = useState(false)

  const createVault = async (data: VaultFormData) => {
    if (!walletClient || !publicClient) return

    const contracts = TRIBUTARY_CONTRACTS[5003] // Mantle Sepolia
    if (!contracts) {
      throw new Error('Contracts not found for chain')
    }

    setIsCreating(true)
    try {
      const hash = await walletClient.writeContract({
        address: contracts.factory,
        abi: FACTORY_ABI,
        functionName: 'createVault',
        args: [{
          storyIPId: data.storyIPId as `0x${string}`,
          tokenName: data.tokenName,
          tokenSymbol: data.tokenSymbol,
          creatorAllocation: BigInt(data.creatorAllocation) * BigInt(10 ** 18) / BigInt(100),
          dividendBps: BigInt(data.dividendBps),
          tradingFeeBps: BigInt(data.tradingFeeBps),
          paymentToken: contracts.mockUsdt,
        }],
      })

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash })

      // Redirect to profile after creation
      router.push('/profile')
    } catch (error) {
      console.error('Failed to create vault:', error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  return { createVault, isCreating }
}
