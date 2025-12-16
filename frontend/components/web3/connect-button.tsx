/**
 * Connect Button - Thirdweb Implementation
 *
 * Uses useConnectModal hook for connection and a custom dropdown for the
 * connected state to completely avoid thirdweb's nested button hydration error.
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
  useWalletBalance,
  useConnectModal,
  useAutoConnect,
} from 'thirdweb/react'
import { createWallet, inAppWallet } from 'thirdweb/wallets'
import { thirdwebClient, isThirdwebConfigured } from '@/lib/web3/thirdweb-client'
import { getSupportedChainList, getChainById } from '@/lib/config/chains'
import { defineChain } from 'thirdweb'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Copy, ExternalLink, LogOut, Check } from 'lucide-react'

interface ConnectButtonProps {
  className?: string
}

// Define supported wallets
const wallets = [
  inAppWallet({
    auth: {
      options: ['google', 'discord', 'apple', 'email', 'phone'],
    },
  }),
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('io.rabby'),
  createWallet('app.phantom'),
  createWallet('com.trustwallet.app'),
  createWallet('me.rainbow'),
]

/**
 * Custom Wallet Details Dropdown Component
 *
 * Renders a custom dropdown when wallet is connected to avoid thirdweb's
 * nested button hydration error in their internal modal.
 */
function WalletDetailsDropdown({ className }: { className?: string }) {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)

  // Get the current chain from the wallet
  const walletChain = wallet?.getChain()
  const chainId = walletChain?.id

  // Get full chain config for correct native currency
  const chainConfig = chainId ? getChainById(chainId) : undefined
  const chain = chainConfig ? defineChain({
    id: chainConfig.chain.id,
    rpc: chainConfig.rpcUrl,
    name: chainConfig.name,
    nativeCurrency: chainConfig.chain.nativeCurrency,
    blockExplorers: chainConfig.chain.blockExplorers ? [
      {
        name: chainConfig.chain.blockExplorers.default.name,
        url: chainConfig.chain.blockExplorers.default.url,
      }
    ] : undefined,
    testnet: chainConfig.isTestnet || undefined,
  }) : walletChain

  const { data: balance } = useWalletBalance({
    client: thirdwebClient!,
    chain: chain,
    address: account?.address,
  })

  if (!account || !wallet) return null

  const truncatedAddress = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
  const formattedBalance = balance
    ? `${Number(balance.displayValue).toFixed(4)} ${balance.symbol}`
    : '...'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(account.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDisconnect = () => {
    disconnect(wallet)
  }

  const explorerUrl = chain?.blockExplorers?.[0]?.url
    ? `${chain.blockExplorers[0].url}/address/${account.address}`
    : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer ${className || ''}`}
        >
          <span className="text-sm text-zinc-400">{formattedBalance}</span>
          <span className="text-sm font-medium text-white">{truncatedAddress}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">Connected Wallet</p>
            <p className="text-xs text-muted-foreground font-mono">{truncatedAddress}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        {explorerUrl && (
          <DropdownMenuItem asChild className="cursor-pointer">
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="cursor-pointer text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Connect Button Component
 *
 * Uses useConnectModal hook for connection and custom dropdown for connected state.
 * This approach completely avoids thirdweb's internal button components that
 * cause nested button hydration errors.
 *
 * @example
 * ```tsx
 * import { ConnectButton } from '@/components/web3/connect-button'
 *
 * function Header() {
 *   return (
 *     <header>
 *       <ConnectButton />
 *     </header>
 *   )
 * }
 * ```
 */
export function ConnectButton({ className }: ConnectButtonProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const account = useActiveAccount()
  const { connect } = useConnectModal()

  // Ensure we're mounted to avoid hydration mismatch with theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get supported chains - memoized to avoid recreation
  const chains = useMemo(() => {
    const chainConfigs = getSupportedChainList()
    return chainConfigs.map((config) =>
      defineChain({
        id: config.chain.id,
        rpc: config.rpcUrl,
        name: config.name,
        nativeCurrency: config.chain.nativeCurrency,
        blockExplorers: config.chain.blockExplorers
          ? [
              {
                name: config.chain.blockExplorers.default.name,
                url: config.chain.blockExplorers.default.url,
              },
            ]
          : undefined,
        testnet: config.isTestnet || undefined,
      })
    )
  }, [])

  // Auto-connect on mount if previously connected
  useAutoConnect({
    client: thirdwebClient as NonNullable<typeof thirdwebClient>,
    wallets,
  })

  // Don't render if Thirdweb is not configured
  if (!isThirdwebConfigured() || !thirdwebClient) {
    return (
      <button
        className={className}
        disabled
        title="Wallet connection not configured"
      >
        Connect Wallet
      </button>
    )
  }

  // Use dark theme as default until mounted, then use resolved theme
  const thirdwebTheme = mounted ? (resolvedTheme === 'light' ? 'light' : 'dark') : 'dark'

  // Handle connect button click - opens thirdweb modal
  const handleConnect = async () => {
    if (!thirdwebClient) return
    await connect({
      client: thirdwebClient,
      wallets,
      chains,
      theme: thirdwebTheme,
      size: 'wide',
      title: 'Connect Wallet',
      showThirdwebBranding: false,
    })
  }

  // If connected, show custom dropdown (no thirdweb components)
  if (account) {
    return <WalletDetailsDropdown className={className} />
  }

  // If not connected, show connect button
  return (
    <button
      onClick={handleConnect}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm font-medium text-white ${className || ''}`}
    >
      Connect Wallet
    </button>
  )
}
