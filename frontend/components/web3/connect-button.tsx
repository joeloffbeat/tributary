/**
 * Connect Button - Privy Implementation
 *
 * Uses Privy's usePrivy and useLogin hooks for wallet connection
 * with a custom dropdown for the connected state.
 */

'use client'

import { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useBalance } from 'wagmi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Copy, ExternalLink, LogOut, Check, ArrowLeftRight } from 'lucide-react'
import { BridgeUsdcDialog } from './bridge-usdc'
import { getChainById } from '@/lib/config/chains'

interface ConnectButtonProps {
  className?: string
}

/**
 * Custom Wallet Details Dropdown Component
 */
function WalletDetailsDropdown({
  className,
  address,
  onLogout,
}: {
  className?: string
  address: `0x${string}`
  onLogout: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [bridgeDialogOpen, setBridgeDialogOpen] = useState(false)
  const { wallets } = useWallets()

  // Get the current chain from the wallet
  const activeWallet = wallets.find((w) => w.address === address)
  const chainId = activeWallet?.chainId ? parseInt(activeWallet.chainId.split(':')[1] || '1') : 1

  // Get balance
  const { data: balance } = useBalance({
    address,
    chainId,
  })

  // Get chain config
  const chainConfig = getChainById(chainId)

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  const formattedBalance = balance
    ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
    : '...'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const explorerUrl = chainConfig?.chain.blockExplorers?.default?.url
    ? `${chainConfig.chain.blockExplorers.default.url}/address/${address}`
    : null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            className={`inline-flex items-center gap-2 btn-secondary text-sm py-2 px-4 cursor-pointer ${className || ''}`}
          >
            <span className="text-muted-foreground">{formattedBalance}</span>
            <span className="text-primary">{truncatedAddress}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="font-body text-xs">CONNECTED WALLET</p>
              <p className="font-stat text-xs text-muted-foreground">{truncatedAddress}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Bridge USDC Button */}
          <DropdownMenuItem
            onClick={() => setBridgeDialogOpen(true)}
            className="cursor-pointer font-body text-xs"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            BRIDGE USDC
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopy} className="cursor-pointer font-body text-xs">
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? 'COPIED!' : 'COPY ADDRESS'}
          </DropdownMenuItem>
          {explorerUrl && (
            <DropdownMenuItem asChild className="cursor-pointer font-body text-xs">
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                VIEW ON EXPLORER
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            className="cursor-pointer font-body text-xs text-red-500 focus:text-red-500"
          >
            <LogOut className="mr-2 h-4 w-4" />
            DISCONNECT
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bridge USDC Dialog */}
      <BridgeUsdcDialog open={bridgeDialogOpen} onOpenChange={setBridgeDialogOpen} />
    </>
  )
}

/**
 * Connect Button Component
 *
 * Uses Privy for authentication and wallet connection.
 */
export function ConnectButton({ className }: ConnectButtonProps) {
  const { ready, authenticated, user, login, logout } = usePrivy()

  // Get the user's wallet address
  const walletAddress = user?.wallet?.address as `0x${string}` | undefined

  // Don't render until Privy is ready
  if (!ready) {
    return (
      <button
        className={`btn-primary text-sm py-2 px-4 opacity-50 cursor-not-allowed ${className || ''}`}
        disabled
      >
        LOADING...
      </button>
    )
  }

  // If authenticated and has wallet, show dropdown
  if (authenticated && walletAddress) {
    return (
      <WalletDetailsDropdown
        className={className}
        address={walletAddress}
        onLogout={logout}
      />
    )
  }

  // If not authenticated, show connect button
  return (
    <button
      onClick={login}
      className={`btn-primary text-sm py-2 px-4 ${className || ''}`}
    >
      CONNECT WALLET
    </button>
  )
}
