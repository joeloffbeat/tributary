/**
 * Connect Button - Thirdweb Implementation
 *
 * Provides a wallet connection button using Thirdweb's ConnectButton for connection,
 * but uses a custom dropdown for the connected state to avoid thirdweb's
 * nested button hydration error.
 */

'use client'

import { useState } from 'react'
import {
  ConnectButton as ThirdwebConnectButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
  useWalletBalance,
} from 'thirdweb/react'
import { createWallet, inAppWallet } from 'thirdweb/wallets'
import { thirdwebClient, isThirdwebConfigured } from '@/lib/web3/thirdweb-client'
import { getSupportedChainList } from '@/lib/config/chains'
import { defineChain } from 'thirdweb'
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
  const chain = wallet?.getChain()

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
 * Renders a button that opens the Thirdweb wallet connection modal.
 * When connected, shows a custom dropdown instead of thirdweb's modal
 * to avoid nested button hydration errors.
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

  // Get supported chains and convert to Thirdweb chains with native RPC URLs
  const chainConfigs = getSupportedChainList()
  const chains = chainConfigs.map((config) =>
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

  return (
    <ThirdwebConnectButton
      client={thirdwebClient}
      wallets={wallets}
      chains={chains}
      theme="dark"
      connectButton={{
        label: 'Connect Wallet',
        className,
      }}
      detailsButton={{
        // Use custom dropdown instead of thirdweb's modal
        render: () => <WalletDetailsDropdown className={className} />,
      }}
      connectModal={{
        size: 'wide',
        title: 'Connect Wallet',
        showThirdwebBranding: false,
      }}
      // Note: accountAbstraction is intentionally disabled by default.
      // Smart accounts are not supported on all chains (e.g., Story Aeneid).
      // To enable smart accounts, uncomment and configure:
      // accountAbstraction={{
      //   chain: chains[0],
      //   sponsorGas: false,
      // }}
    />
  )
}

// Re-export for convenience when using Thirdweb features directly
export { ThirdwebConnectButton }
