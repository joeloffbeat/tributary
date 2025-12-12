'use client'

import { useEffect, useState } from 'react'
import { ThirdwebClient } from 'thirdweb'
import { getWalletBalance } from 'thirdweb/wallets'
import { avalancheFuji } from 'thirdweb/chains'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { USDC_FUJI_ADDRESS, X402_API_ENDPOINTS } from '@/constants/protocols/x402'

interface WalletBalances {
  avax: string
  usdc: string
}

interface BalanceDisplayProps {
  connectedAddress?: string
  client: ThirdwebClient
}

function formatBalance(value: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals)
  const integerPart = value / divisor
  const fractionalPart = value % divisor
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 4)
  return `${integerPart}.${fractionalStr}`
}

async function fetchBalances(client: ThirdwebClient, address: string): Promise<WalletBalances> {
  const [avaxBalance, usdcBalance] = await Promise.all([
    getWalletBalance({
      client,
      chain: avalancheFuji,
      address,
    }),
    getWalletBalance({
      client,
      chain: avalancheFuji,
      address,
      tokenAddress: USDC_FUJI_ADDRESS,
    }),
  ])

  return {
    avax: formatBalance(avaxBalance.value, avaxBalance.decimals),
    usdc: formatBalance(usdcBalance.value, usdcBalance.decimals),
  }
}

function WalletCard({
  title,
  address,
  balances,
  isLoading,
}: {
  title: string
  address: string | null
  balances: WalletBalances | null
  isLoading: boolean
}) {
  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <Card className="flex-1 min-w-[280px] transition-all duration-300 hover:border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {address && <p className="text-xs font-mono text-muted-foreground">{shortenAddress(address)}</p>}
      </CardHeader>
      <CardContent>
        {!address ? (
          <p className="text-sm text-muted-foreground">Not configured</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : balances ? (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm">AVAX</span>
              <span className="font-mono text-sm">{balances.avax}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">USDC</span>
              <span className="font-mono text-sm">{balances.usdc}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Failed to load</p>
        )}
      </CardContent>
    </Card>
  )
}

export function BalanceDisplay({ connectedAddress, client }: BalanceDisplayProps) {
  const [serverWallet, setServerWallet] = useState<string | null>(null)
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null)
  const [connectedBalances, setConnectedBalances] = useState<WalletBalances | null>(null)
  const [serverBalances, setServerBalances] = useState<WalletBalances | null>(null)
  const [merchantBalances, setMerchantBalances] = useState<WalletBalances | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadWalletAddresses() {
      try {
        const res = await fetch(X402_API_ENDPOINTS.AVALANCHE.WALLETS)
        const data = await res.json()
        setServerWallet(data.serverWallet)
        setMerchantWallet(data.merchantWallet)
      } catch (error) {
        console.error('Failed to load wallet addresses:', error)
      }
    }
    loadWalletAddresses()
  }, [])

  useEffect(() => {
    async function loadBalances() {
      setIsLoading(true)
      try {
        const promises: Promise<void>[] = []

        if (connectedAddress) {
          promises.push(fetchBalances(client, connectedAddress).then(setConnectedBalances))
        }

        if (serverWallet) {
          promises.push(fetchBalances(client, serverWallet).then(setServerBalances))
        }

        if (merchantWallet) {
          promises.push(fetchBalances(client, merchantWallet).then(setMerchantBalances))
        }

        await Promise.all(promises)
      } catch (error) {
        console.error('Failed to load balances:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBalances()
  }, [client, connectedAddress, serverWallet, merchantWallet])

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Wallet Balances</h3>
      <div className="flex flex-wrap gap-4">
        <WalletCard
          title="Connected Wallet"
          address={connectedAddress || null}
          balances={connectedBalances}
          isLoading={isLoading}
        />
        <WalletCard
          title="Server Wallet"
          address={serverWallet}
          balances={serverBalances}
          isLoading={isLoading}
        />
        <WalletCard
          title="Merchant Wallet"
          address={merchantWallet}
          balances={merchantBalances}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
