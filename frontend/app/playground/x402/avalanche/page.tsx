'use client'

import { useState, useEffect } from 'react'
import { wrapFetchWithPayment } from 'thirdweb/x402'
import { PaymentCard } from '@/components/x402/payment-card'
import { ContentDisplay } from '@/components/x402/content-display'
import { TransactionLog, LogEntry } from '@/components/x402/transaction-log'
import { Separator } from '@/components/ui/separator'
import { BalanceDisplay } from '@/components/x402/balance-display'
import { createNormalizedFetch } from '@/lib/utils/x402-payment'
import { AVALANCHE_FUJI_CHAIN_ID, PAYMENT_AMOUNTS, X402_API_ENDPOINTS } from '@/constants/protocols/x402'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Settings, Link2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  useAccount,
  ConnectButton,
  useThirdwebWallet,
  thirdwebClient,
  isThirdwebConfigured,
} from '@/lib/web3'

interface ContentData {
  tier: string
  data: string
  features?: string[]
  timestamp: string
}

interface ConfigError {
  type: 'auth_layer' | 'env' | 'chain'
  title: string
  message: string
  details?: string[]
}

function ConfigErrorCard({ error }: { error: ConfigError }) {
  const getIcon = () => {
    switch (error.type) {
      case 'auth_layer':
        return <Link2 className="h-6 w-6 text-destructive" />
      case 'env':
        return <Settings className="h-6 w-6 text-destructive" />
      default:
        return <AlertTriangle className="h-6 w-6 text-destructive" />
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-destructive">{error.title}</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.details && error.details.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {error.type === 'auth_layer' ? 'Required auth layer:' : 'Missing configuration:'}
              </p>
              <ul className="space-y-1">
                {error.details.map((detail, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">{detail}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error.type === 'auth_layer' && (
            <div className="pt-4 border-t space-y-3">
              <p className="text-sm text-muted-foreground">
                The x402 Payment Protocol requires the <span className="font-medium text-foreground">Thirdweb</span> auth layer to function.
                This is because x402 uses Thirdweb's payment infrastructure and ERC-4337 smart accounts.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs font-medium mb-2">To enable Thirdweb auth layer:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Get a client ID from <span className="font-mono">thirdweb.com/dashboard</span></li>
                  <li>Add <code className="bg-background px-1 rounded">NEXT_PUBLIC_THIRDWEB_CLIENT_ID</code> to your .env.local</li>
                  <li>Add server-side keys for API routes</li>
                </ol>
              </div>
            </div>
          )}
          {error.type === 'env' && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Add these to your <code className="bg-muted px-1 py-0.5 rounded text-xs">.env.local</code> file:
              </p>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_SECRET_KEY=your_secret_key
THIRDWEB_SERVER_WALLET_ADDRESS=your_erc4337_account
MERCHANT_WALLET_ADDRESS=your_merchant_wallet`}
              </pre>
            </div>
          )}
          {error.type === 'chain' && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Please switch your wallet to <span className="font-medium text-foreground">Avalanche Fuji Testnet</span> (Chain ID: 43113)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function WrongChainCard({ currentChainId, onSwitchChain }: { currentChainId: number; onSwitchChain?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-yellow-500/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <CardTitle className="text-yellow-500">Wrong Network</CardTitle>
              <CardDescription>Please switch to Avalanche Fuji Testnet</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <div>
              <p className="text-sm font-medium">Current Chain ID</p>
              <p className="text-xs text-muted-foreground">{currentChainId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Required Chain ID</p>
              <p className="text-xs text-muted-foreground">{AVALANCHE_FUJI_CHAIN_ID}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            x402 payments on this page require the Avalanche Fuji Testnet. Please switch your wallet network to continue.
          </p>
          {onSwitchChain && (
            <Button onClick={onSwitchChain} className="w-full">
              Switch to Avalanche Fuji
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AvalancheX402Page() {
  const [configError, setConfigError] = useState<ConfigError | null>(null)

  // Use abstraction layer hooks
  const { address, isConnected, chainId } = useAccount()
  const wallet = useThirdwebWallet() // Thirdweb-specific for x402 payment

  const [content, setContent] = useState<ContentData | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isPaying, setIsPaying] = useState(false)

  // Check configuration on mount
  useEffect(() => {
    // Check for Thirdweb auth layer (required for x402)
    if (!isThirdwebConfigured()) {
      setConfigError({
        type: 'auth_layer',
        title: 'Thirdweb Auth Layer Required',
        message: 'The x402 protocol requires Thirdweb authentication.',
        details: ['Thirdweb'],
      })
    }
  }, [])

  useEffect(() => {
    setLogs([])
    setContent(null)
  }, [address])

  const addLog = (message: string, type: LogEntry['type']) => {
    setLogs((prev) => [...prev, { message, type, timestamp: new Date() }])
  }

  const updateLogStatus = (messagePattern: string, newType: LogEntry['type']) => {
    setLogs((prev) =>
      prev.map((log) => (log.message.includes(messagePattern) ? { ...log, type: newType } : log))
    )
  }

  const handlePayment = async (tier: 'basic' | 'premium') => {
    if (!wallet || !thirdwebClient) return

    setIsPaying(true)
    setContent(null)
    setLogs([])

    try {
      addLog(`Initiating ${tier} payment...`, 'info')

      const normalizedFetch = createNormalizedFetch(AVALANCHE_FUJI_CHAIN_ID)
      const fetchWithPay = wrapFetchWithPayment(normalizedFetch, thirdwebClient, wallet, {
        maxValue: tier === 'basic' ? PAYMENT_AMOUNTS.BASIC.bigInt : PAYMENT_AMOUNTS.PREMIUM.bigInt,
      })

      addLog('Requesting payment authorization...', 'info')
      const response = await fetchWithPay(
        tier === 'basic'
          ? X402_API_ENDPOINTS.AVALANCHE.BASIC
          : X402_API_ENDPOINTS.AVALANCHE.PREMIUM
      )
      const responseData = await response.json()

      if (response.status === 200) {
        updateLogStatus('Initiating', 'success')
        updateLogStatus('Requesting payment authorization', 'success')
        addLog('Payment successful!', 'success')
        addLog('Content received', 'success')
        setContent(responseData)
      } else {
        updateLogStatus('Initiating', 'error')
        updateLogStatus('Requesting payment authorization', 'error')
        const errorMsg = responseData.error || 'Unknown error'
        addLog(`Payment failed: ${errorMsg}`, 'error')
      }
    } catch (error) {
      updateLogStatus('Initiating', 'error')
      updateLogStatus('Requesting payment authorization', 'error')
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      addLog(`Error: ${errorMsg}`, 'error')
    } finally {
      setIsPaying(false)
    }
  }

  // Show config error if environment variables are missing
  if (configError) {
    return <ConfigErrorCard error={configError} />
  }

  // Show error if Thirdweb client is not available
  if (!thirdwebClient) {
    return (
      <ConfigErrorCard
        error={{
          type: 'env',
          title: 'Configuration Required',
          message: 'Failed to initialize Thirdweb client.',
          details: ['NEXT_PUBLIC_THIRDWEB_CLIENT_ID'],
        }}
      />
    )
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-center">
            <div className="text-center space-y-6 p-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">x402 Payment Demo</h1>
                <p className="text-muted-foreground">HTTP 402 Payment Protocol</p>
                <p className="text-sm text-muted-foreground mt-1">Avalanche Fuji Testnet</p>
                <p className="text-xs text-muted-foreground mt-2">Using Thirdweb authentication</p>
              </div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Wrong chain state
  if (chainId && chainId !== AVALANCHE_FUJI_CHAIN_ID) {
    return <WrongChainCard currentChainId={chainId} />
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back navigation */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">x402 Payment Demo</h1>
          <p className="text-muted-foreground">Choose a payment tier to unlock content</p>
          <p className="text-xs text-muted-foreground">Avalanche Fuji Testnet</p>
        </div>

        <Separator />

        <div className="max-w-4xl mx-auto">
          <BalanceDisplay connectedAddress={address} client={thirdwebClient} />
        </div>

        <Separator />

        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          <PaymentCard
            tier="Basic"
            price="$0.01"
            description="Perfect for trying out the payment system"
            features={['Access to basic content', 'Standard support']}
            onPayClick={() => handlePayment('basic')}
            isPaying={isPaying}
          />
          <PaymentCard
            tier="Premium"
            price="$0.15"
            description="Full access to all advanced features"
            features={['Access to all content', 'Priority support', 'Advanced analytics', 'Custom integrations']}
            onPayClick={() => handlePayment('premium')}
            isPaying={isPaying}
          />
        </div>

        {content && (
          <div className="max-w-4xl mx-auto">
            <ContentDisplay
              tier={content.tier}
              data={content.data}
              features={content.features}
              timestamp={content.timestamp}
            />
          </div>
        )}

        {logs.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <TransactionLog logs={logs} />
          </div>
        )}
      </div>
    </div>
  )
}
