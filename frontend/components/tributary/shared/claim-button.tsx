'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAccount, useWriteContract, usePublicClient } from '@/lib/web3'
import { formatUnits } from 'viem'
import { toast } from 'sonner'
import { HandCoins, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const CLAIM_ABI = [{
  type: 'function', name: 'claim', inputs: [],
  outputs: [{ name: '', type: 'uint256' }], stateMutability: 'nonpayable',
}] as const

interface ClaimButtonProps {
  claimableAmount: bigint
  tokenDecimals: number
  tokenSymbol: string
  vaultAddress: `0x${string}`
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  disabled?: boolean
  className?: string
}

export function ClaimButton({
  claimableAmount, tokenDecimals, tokenSymbol, vaultAddress,
  onSuccess, onError, disabled, className,
}: ClaimButtonProps) {
  const { address, chainId } = useAccount()
  const { publicClient } = usePublicClient()
  const { writeContract, isPending } = useWriteContract()
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasError, setHasError] = useState(false)

  const isDisabled = disabled || claimableAmount === 0n || !address
  const formattedAmount = formatUnits(claimableAmount, tokenDecimals)
  const displayAmount = parseFloat(formattedAmount).toLocaleString(undefined, {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(() => setHasError(false), 500)
      return () => clearTimeout(timer)
    }
  }, [hasError])

  const handleClaim = useCallback(async () => {
    if (!address || !publicClient || !chainId) return
    try {
      const hash = await writeContract({
        address: vaultAddress, abi: CLAIM_ABI, functionName: 'claim',
      })
      await publicClient.waitForTransactionReceipt({ hash })
      setShowSuccess(true)
      toast.success('Rewards claimed successfully!')
      onSuccess?.(hash)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Claim failed')
      setHasError(true)
      toast.error(error.message || 'Failed to claim rewards')
      onError?.(error)
    }
  }, [address, publicClient, chainId, vaultAddress, writeContract, onSuccess, onError])

  const getButtonContent = () => {
    if (showSuccess) return <><CheckCircle className="mr-2 h-4 w-4" />Claimed!</>
    if (isPending) return <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Claiming...</>
    if (isDisabled) return 'Nothing to claim'
    return <><HandCoins className="mr-2 h-4 w-4" />Claim ${displayAmount}</>
  }

  return (
    <Button
      onClick={handleClaim}
      disabled={isDisabled || isPending || showSuccess}
      className={cn(
        'font-semibold rounded-xl transition-all duration-300',
        !isDisabled && !isPending && !showSuccess && [
          'bg-gradient-to-r from-teal-500 to-teal-600',
          'hover:from-teal-600 hover:to-teal-700',
          'hover:shadow-[0_4px_20px_rgba(20,184,166,0.3)]',
          'hover:-translate-y-0.5',
        ],
        showSuccess && 'bg-emerald-500 animate-celebrate',
        hasError && 'animate-shake',
        className
      )}
    >
      {getButtonContent()}
    </Button>
  )
}
