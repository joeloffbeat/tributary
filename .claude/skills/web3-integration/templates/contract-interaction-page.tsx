/**
 * Contract Interaction Page Template
 *
 * Usage: Copy this template when creating a new page that interacts with smart contracts
 * Replace: __CONTRACT_NAME__, __PAGE_NAME__, __DESCRIPTION__
 */

'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, ConnectButton } from '@/lib/web3'
import { TransactionDialog } from '@/components/web3/transactions/transaction-dialog'
import { getContractByName } from '@/constants/contracts'
import { formatEther, parseEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'
import type { ContractCallParams } from '@/lib/web3/contracts'

// Supported chains for this contract
const SUPPORTED_CHAINS = [11155111, 421614] // Sepolia, Arbitrum Sepolia

export default function __PAGE_NAME__Page() {
  const { address, isConnected, chainId } = useAccount()
  const { publicClient } = usePublicClient()

  // Contract data state
  const [contractData, setContractData] = useState<{
    balance: string
    // Add more contract read data here
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Transaction state
  const [txOpen, setTxOpen] = useState(false)
  const [txParams, setTxParams] = useState<ContractCallParams | null>(null)

  // Form state
  const [amount, setAmount] = useState('')

  const isChainSupported = chainId ? SUPPORTED_CHAINS.includes(chainId) : false

  // Fetch contract data
  useEffect(() => {
    async function fetchData() {
      if (!address || !chainId || !publicClient || !isChainSupported) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const contract = await getContractByName(chainId, '__CONTRACT_NAME__')

        // Example: Read balance
        const balance = await publicClient.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: 'balanceOf',
          args: [address],
        }) as bigint

        setContractData({
          balance: formatEther(balance),
        })
      } catch (err) {
        console.error('Failed to fetch contract data:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch data'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [address, chainId, publicClient, isChainSupported])

  // Prepare transaction
  const handleSubmit = async () => {
    if (!chainId || !amount) return

    try {
      const contract = await getContractByName(chainId, '__CONTRACT_NAME__')

      setTxParams({
        address: contract.address,
        abi: contract.abi,
        functionName: 'deposit', // Replace with actual function
        args: [], // Add arguments
        value: parseEther(amount),
      })
      setTxOpen(true)
    } catch (err) {
      console.error('Failed to prepare transaction:', err)
    }
  }

  // Handle transaction success
  const handleSuccess = () => {
    setAmount('')
    // Refetch data
    // You can trigger a refetch here
  }

  // Not connected
  if (!isConnected) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">__PAGE_NAME__</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to interact with the contract
          </p>
          <ConnectButton />
        </div>
      </main>
    )
  }

  // Wrong chain
  if (!isChainSupported) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unsupported Network</AlertTitle>
          <AlertDescription>
            Please switch to a supported network: Sepolia or Arbitrum Sepolia
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">__PAGE_NAME__</h1>
        <p className="text-muted-foreground mt-2">__DESCRIPTION__</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message}</span>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Info</CardTitle>
            <CardDescription>Current contract state</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : contractData ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Balance</span>
                  <span className="font-mono">{contractData.balance} ETH</span>
                </div>
                {/* Add more data displays here */}
              </div>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Action Card */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit</CardTitle>
            <CardDescription>Deposit ETH to the contract</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setAmount(val)
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full"
              >
                Deposit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Dialog */}
      {txParams && (
        <TransactionDialog
          open={txOpen}
          onOpenChange={setTxOpen}
          params={txParams}
          chainId={chainId!}
          onSuccess={handleSuccess}
        />
      )}
    </main>
  )
}
