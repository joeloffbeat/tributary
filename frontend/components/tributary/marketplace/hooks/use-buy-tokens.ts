// Tributary Buy Tokens Hook - Handles USDC approval and token purchase
import { useState, useCallback, useEffect } from 'react'
import type { Address } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { getTributaryContracts, MARKETPLACE_ABI, TOKEN_ABI } from '@/constants/tributary'
import { getTransactionErrorMessage } from '@/lib/utils/transaction'
import type { TributaryVault } from '../types'

type BuyStatus = 'idle' | 'pending' | 'success' | 'error'

// Simple ERC20 ABI for USDC
const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const

export function useBuyTokens(vault: TributaryVault) {
  const { address, chainId } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()

  const [status, setStatus] = useState<BuyStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [usdcBalance, setUsdcBalance] = useState<bigint>(0n)
  const [isLoadingBalances, setIsLoadingBalances] = useState(true)

  const contracts = chainId ? getTributaryContracts(chainId) : null
  const usdcAddress = contracts?.usdc as Address
  const marketplaceAddress = contracts?.marketplace as Address

  const needsApproval = allowance === 0n

  // Fetch USDC balance and allowance
  useEffect(() => {
    async function fetchBalances() {
      if (!address || !publicClient || !usdcAddress || usdcAddress === '0x0000000000000000000000000000000000000000') {
        setIsLoadingBalances(false)
        return
      }

      setIsLoadingBalances(true)
      try {
        const [balance, currentAllowance] = await Promise.all([
          publicClient.readContract({ address: usdcAddress, abi: ERC20_ABI, functionName: 'balanceOf', args: [address] }),
          publicClient.readContract({ address: usdcAddress, abi: ERC20_ABI, functionName: 'allowance', args: [address, marketplaceAddress] }),
        ])
        setUsdcBalance(balance)
        setAllowance(currentAllowance)
      } catch (err) {
        console.error('Failed to fetch balances:', err)
      } finally {
        setIsLoadingBalances(false)
      }
    }
    fetchBalances()
  }, [address, publicClient, usdcAddress, marketplaceAddress])

  // Approve USDC spending
  const approve = useCallback(async (amount: bigint) => {
    if (!walletClient || !address || !usdcAddress || !chainId) return

    setStatus('pending')
    setError(null)

    try {
      const hash = await walletClient.writeContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [marketplaceAddress, amount],
        account: address,
        chain: null,
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      setAllowance(amount)
      setStatus('idle')
    } catch (err) {
      setError(getTransactionErrorMessage(err))
      setStatus('error')
    }
  }, [walletClient, address, publicClient, usdcAddress, marketplaceAddress, chainId])

  // Buy tokens from listing
  const buy = useCallback(async (tokenAmount: bigint, listingId: bigint = 1n): Promise<string | null> => {
    if (!walletClient || !address || !marketplaceAddress || !chainId) return null

    setStatus('pending')
    setError(null)

    try {
      const hash = await walletClient.writeContract({
        address: marketplaceAddress,
        abi: MARKETPLACE_ABI,
        functionName: 'buy',
        args: [listingId, tokenAmount],
        account: address,
        chain: null,
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      setStatus('success')
      return hash
    } catch (err) {
      setError(getTransactionErrorMessage(err))
      setStatus('error')
      return null
    }
  }, [walletClient, address, publicClient, marketplaceAddress, chainId])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
  }, [])

  return { buy, approve, reset, status, error, needsApproval, allowance, usdcBalance, isLoadingBalances }
}
