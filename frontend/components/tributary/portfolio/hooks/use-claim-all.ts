import { useState, useCallback, useEffect } from 'react'
import { useWriteContract, useWaitForTransaction } from '@/lib/web3'
import { VAULT_ABI } from '@/constants/tributary'
import type { PortfolioHolding } from '../types'

export function useClaimAll() {
  const { writeContract } = useWriteContract()

  const [currentIndex, setCurrentIndex] = useState(-1)
  const [results, setResults] = useState<Map<string, 'pending' | 'success' | 'error'>>(new Map())
  const [error, setError] = useState<string | null>(null)
  const [totalClaimed, setTotalClaimed] = useState<bigint>(0n)
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>()

  // Wait for current transaction
  const { isSuccess, isError } = useWaitForTransaction({ hash: pendingHash })

  const reset = useCallback(() => {
    setCurrentIndex(-1)
    setResults(new Map())
    setError(null)
    setTotalClaimed(0n)
    setPendingHash(undefined)
  }, [])

  const claimAll = useCallback(
    async (holdings: PortfolioHolding[]) => {
      setError(null)
      setResults(new Map())
      setTotalClaimed(0n)

      let claimed = 0n

      for (let i = 0; i < holdings.length; i++) {
        const holding = holdings[i]
        setCurrentIndex(i)
        setResults((prev) => new Map(prev).set(holding.vaultAddress, 'pending'))

        try {
          // Call claimMultiple on the vault
          // TODO: In production, fetch actual pending distribution IDs from subgraph
          const hash = await writeContract({
            address: holding.vaultAddress,
            abi: VAULT_ABI,
            functionName: 'claimMultiple',
            args: [[0n]], // Claim from latest distribution
          })

          setPendingHash(hash)

          // Simple delay to allow transaction to process
          // In production, properly await the receipt
          await new Promise((resolve) => setTimeout(resolve, 3000))

          setResults((prev) => new Map(prev).set(holding.vaultAddress, 'success'))
          claimed += holding.pendingRewards
        } catch (err) {
          setResults((prev) => new Map(prev).set(holding.vaultAddress, 'error'))
          console.error(`Failed to claim from ${holding.vaultAddress}:`, err)
        }
      }

      setTotalClaimed(claimed)
      setCurrentIndex(holdings.length)
      setPendingHash(undefined)

      if (claimed === 0n) {
        setError('No rewards were claimed')
        throw new Error('No rewards were claimed')
      }
    },
    [writeContract]
  )

  return {
    claimAll,
    currentIndex,
    results,
    error,
    totalClaimed,
    reset,
  }
}
