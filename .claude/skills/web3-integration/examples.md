# Web3 Integration Examples

## Basic Wallet Connection

```tsx
'use client'

import { useAccount, ConnectButton } from '@/lib/web3'

export function WalletStatus() {
  const { address, isConnected, chain } = useAccount()

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Connect your wallet to continue</p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg">
      <p className="text-sm text-muted-foreground">Connected</p>
      <p className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
      <p className="text-sm text-muted-foreground">{chain?.name}</p>
    </div>
  )
}
```

## Chain Switching

```tsx
'use client'

import { useAccount, useSwitchChain, useChains } from '@/lib/web3'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ChainSwitcher() {
  const { chainId } = useAccount()
  const { switchChain, isPending } = useSwitchChain()
  const chains = useChains()

  return (
    <Select
      value={chainId?.toString()}
      onValueChange={(value) => switchChain(parseInt(value))}
      disabled={isPending}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select chain" />
      </SelectTrigger>
      <SelectContent>
        {chains.map((chain) => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

## Reading Token Balance

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from '@/lib/web3'
import { getContractByName } from '@/constants/contracts'
import { formatUnits } from 'viem'
import { Skeleton } from '@/components/ui/skeleton'

export function TokenBalance({ tokenName }: { tokenName: string }) {
  const { address, chainId } = useAccount()
  const { publicClient } = usePublicClient()
  const [balance, setBalance] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBalance() {
      if (!address || !chainId || !publicClient) return

      setLoading(true)
      try {
        const contract = await getContractByName(chainId, tokenName)
        const [rawBalance, decimals] = await Promise.all([
          publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: 'balanceOf',
            args: [address],
          }),
          publicClient.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: 'decimals',
          }),
        ])

        setBalance(formatUnits(rawBalance as bigint, decimals as number))
      } catch (error) {
        console.error('Failed to fetch balance:', error)
        setBalance(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [address, chainId, publicClient, tokenName])

  if (loading) return <Skeleton className="h-6 w-24" />
  if (!balance) return <span className="text-muted-foreground">-</span>

  return <span className="font-mono">{balance}</span>
}
```

## ERC20 Approval + Swap Flow

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from '@/lib/web3'
import { TransactionDialog } from '@/components/web3/transactions/transaction-dialog'
import { getContractByName } from '@/constants/contracts'
import { parseUnits, maxUint256 } from 'viem'
import { Button } from '@/components/ui/button'

interface SwapButtonProps {
  tokenIn: string
  tokenOut: string
  amountIn: string
  spender: `0x${string}`
}

export function SwapButton({ tokenIn, tokenOut, amountIn, spender }: SwapButtonProps) {
  const { address, chainId } = useAccount()
  const { publicClient } = usePublicClient()

  const [needsApproval, setNeedsApproval] = useState(false)
  const [txOpen, setTxOpen] = useState(false)
  const [txParams, setTxParams] = useState<any>(null)
  const [step, setStep] = useState<'idle' | 'approve' | 'swap'>('idle')

  // Check allowance
  useEffect(() => {
    async function checkAllowance() {
      if (!address || !chainId || !publicClient || !amountIn) return

      const token = await getContractByName(chainId, tokenIn)
      const allowance = await publicClient.readContract({
        address: token.address,
        abi: token.abi,
        functionName: 'allowance',
        args: [address, spender],
      }) as bigint

      const amount = parseUnits(amountIn, 18) // Adjust decimals
      setNeedsApproval(allowance < amount)
    }

    checkAllowance()
  }, [address, chainId, publicClient, tokenIn, amountIn, spender])

  const handleClick = async () => {
    if (!chainId) return

    const token = await getContractByName(chainId, tokenIn)

    if (needsApproval) {
      // Step 1: Approve
      setStep('approve')
      setTxParams({
        address: token.address,
        abi: token.abi,
        functionName: 'approve',
        args: [spender, maxUint256],
      })
    } else {
      // Step 2: Swap
      await prepareSwap()
    }

    setTxOpen(true)
  }

  const prepareSwap = async () => {
    if (!chainId) return

    const router = await getContractByName(chainId, 'SwapRouter')
    setStep('swap')
    setTxParams({
      address: router.address,
      abi: router.abi,
      functionName: 'swapExactTokensForTokens',
      args: [
        parseUnits(amountIn, 18),
        0n, // minAmountOut - calculate properly in production
        [/* token addresses */],
        address,
        BigInt(Math.floor(Date.now() / 1000) + 1800), // deadline
      ],
    })
  }

  const handleSuccess = async () => {
    if (step === 'approve') {
      // After approval, proceed to swap
      setNeedsApproval(false)
      await prepareSwap()
      setTxOpen(true)
    } else {
      // Swap complete
      setStep('idle')
      // Refresh balances, etc.
    }
  }

  return (
    <>
      <Button onClick={handleClick} className="w-full">
        {needsApproval ? 'Approve & Swap' : 'Swap'}
      </Button>

      {txParams && (
        <TransactionDialog
          open={txOpen}
          onOpenChange={setTxOpen}
          params={txParams}
          chainId={chainId!}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
```

## Multi-Step Transaction with Progress

```tsx
'use client'

import { useState } from 'react'
import { useAccount } from '@/lib/web3'
import { TransactionDialog } from '@/components/web3/transactions/transaction-dialog'
import { Button } from '@/components/ui/button'
import { Check, Loader2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

interface Step {
  id: string
  label: string
  status: StepStatus
  params?: any
}

export function MultiStepTransaction() {
  const { chainId } = useAccount()
  const [steps, setSteps] = useState<Step[]>([
    { id: 'approve', label: 'Approve Token', status: 'pending' },
    { id: 'stake', label: 'Stake Tokens', status: 'pending' },
    { id: 'claim', label: 'Claim Rewards', status: 'pending' },
  ])
  const [currentStep, setCurrentStep] = useState(0)
  const [txOpen, setTxOpen] = useState(false)

  const updateStepStatus = (index: number, status: StepStatus) => {
    setSteps(prev => prev.map((s, i) =>
      i === index ? { ...s, status } : s
    ))
  }

  const handleStart = async () => {
    // Prepare first step
    updateStepStatus(0, 'in_progress')
    // Set params for approval...
    setTxOpen(true)
  }

  const handleSuccess = async () => {
    updateStepStatus(currentStep, 'completed')

    if (currentStep < steps.length - 1) {
      // Move to next step
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      updateStepStatus(nextStep, 'in_progress')
      // Prepare next step params...
      setTxOpen(true)
    } else {
      // All done
      setCurrentStep(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              step.status === 'completed' && "bg-green-500/20 text-green-500",
              step.status === 'in_progress' && "bg-primary/20 text-primary",
              step.status === 'pending' && "bg-muted text-muted-foreground"
            )}>
              {step.status === 'completed' && <Check className="h-4 w-4" />}
              {step.status === 'in_progress' && <Loader2 className="h-4 w-4 animate-spin" />}
              {step.status === 'pending' && <span>{index + 1}</span>}
            </div>
            <span className={cn(
              step.status === 'pending' && "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <Button onClick={handleStart} disabled={steps[0].status !== 'pending'}>
        Start Transaction
      </Button>

      <TransactionDialog
        open={txOpen}
        onOpenChange={setTxOpen}
        params={steps[currentStep]?.params}
        chainId={chainId!}
        onSuccess={handleSuccess}
        onError={() => updateStepStatus(currentStep, 'failed')}
      />
    </div>
  )
}
```

## Contract Data with Polling

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, usePublicClient } from '@/lib/web3'
import { getContractByName } from '@/constants/contracts'
import { formatEther } from 'viem'

interface PoolStats {
  totalStaked: string
  rewardRate: string
  lastUpdate: number
}

export function usePoolStats(poolName: string, pollInterval = 30000) {
  const { chainId } = useAccount()
  const { publicClient } = usePublicClient()
  const [stats, setStats] = useState<PoolStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!chainId || !publicClient) return

    try {
      const pool = await getContractByName(chainId, poolName)

      const [totalStaked, rewardRate] = await Promise.all([
        publicClient.readContract({
          address: pool.address,
          abi: pool.abi,
          functionName: 'totalStaked',
        }),
        publicClient.readContract({
          address: pool.address,
          abi: pool.abi,
          functionName: 'rewardRate',
        }),
      ])

      setStats({
        totalStaked: formatEther(totalStaked as bigint),
        rewardRate: formatEther(rewardRate as bigint),
        lastUpdate: Date.now(),
      })
    } catch (error) {
      console.error('Failed to fetch pool stats:', error)
    } finally {
      setLoading(false)
    }
  }, [chainId, publicClient, poolName])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, pollInterval)
    return () => clearInterval(interval)
  }, [fetchStats, pollInterval])

  return { stats, loading, refetch: fetchStats }
}
```

## ETH Transfer

```tsx
'use client'

import { useState } from 'react'
import { useAccount } from '@/lib/web3'
import { TransactionDialog } from '@/components/web3/transactions/transaction-dialog'
import { parseEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SendETH() {
  const { chainId } = useAccount()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txOpen, setTxOpen] = useState(false)

  const params = {
    address: recipient as `0x${string}`,
    abi: [], // Empty ABI for ETH transfer
    functionName: 'transfer',
    value: amount ? parseEther(amount) : 0n,
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Recipient address (0x...)"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button
        onClick={() => setTxOpen(true)}
        disabled={!recipient || !amount}
      >
        Send ETH
      </Button>

      <TransactionDialog
        open={txOpen}
        onOpenChange={setTxOpen}
        params={params}
        chainId={chainId!}
        onSuccess={() => {
          setRecipient('')
          setAmount('')
        }}
      />
    </div>
  )
}
```

## Message Signing

```tsx
'use client'

import { useState } from 'react'
import { useSignMessage } from '@/lib/web3'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function SignMessage() {
  const { signMessage, isPending } = useSignMessage()
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState<string | null>(null)

  const handleSign = async () => {
    try {
      const sig = await signMessage({ message })
      setSignature(sig)
      toast.success('Message signed!')
    } catch (error) {
      toast.error('Failed to sign message')
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter message to sign"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button onClick={handleSign} disabled={!message || isPending}>
        {isPending ? 'Signing...' : 'Sign Message'}
      </Button>

      {signature && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Signature:</p>
          <code className="text-xs break-all">{signature}</code>
        </div>
      )}
    </div>
  )
}
```
