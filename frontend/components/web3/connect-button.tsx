/**
 * Connect Button - Privy Implementation with Chain Switcher
 *
 * Shows chain dropdown + USD balance + wallet address when connected
 */

'use client'

import { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useBalance, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy, LogOut, Check, Droplets } from 'lucide-react'
import { SUPPORTED_CHAINS, MANTLE_SEPOLIA_CHAIN_ID, STORY_AENEID_CHAIN_ID } from '@/lib/config/chains'
import { TRIBUTARY_CONTRACTS, MOCK_USDT_ABI } from '@/constants/tributary'
import Link from 'next/link'

interface ConnectButtonProps {
  className?: string
}

// Chain icons/colors
const CHAIN_CONFIG = {
  [MANTLE_SEPOLIA_CHAIN_ID]: {
    name: 'MANTLE SEPOLIA',
    shortName: 'MANTLE',
    logo: '/mantle.png',
  },
  [STORY_AENEID_CHAIN_ID]: {
    name: 'STORY AENEID',
    shortName: 'STORY',
    logo: '/story.png',
  },
}

/**
 * Chain Switcher Dropdown
 */
function ChainSwitcher({ currentChainId, onSwitch }: { currentChainId: number; onSwitch: (chainId: number) => void }) {
  const chainConfig = CHAIN_CONFIG[currentChainId as keyof typeof CHAIN_CONFIG]

  return (
    <Select value={String(currentChainId)} onValueChange={(val) => onSwitch(Number(val))}>
      <SelectTrigger className="w-auto btn-secondary gap-2 [&_svg:last-child]:hidden !border-[#167a5f]">
        {chainConfig?.logo && (
          <img
            src={chainConfig.logo}
            alt={chainConfig.shortName}
            className="w-5 h-5 rounded-full object-cover"
          />
        )}
        <SelectValue>
          <span className="font-body text-sm tracking-wider">{chainConfig?.shortName || 'UNKNOWN'}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CHAIN_CONFIG).map(([chainId, config]) => (
          <SelectItem key={chainId} value={chainId}>
            <div className="flex items-center gap-2">
              <img
                src={config.logo}
                alt={config.shortName}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="font-body text-sm tracking-wider">{config.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Wallet Details Dropdown
 */
function WalletDetailsDropdown({
  address,
  chainId,
  onLogout,
}: {
  address: `0x${string}`
  chainId: number
  onLogout: () => void
}) {
  const [copied, setCopied] = useState(false)

  // Get native balance
  const { data: nativeBalance } = useBalance({
    address,
    chainId,
  })

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  const formattedNativeBalance = nativeBalance
    ? `${Number(nativeBalance.formatted).toFixed(4)} ${nativeBalance.symbol}`
    : '...'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isOnMantleSepolia = chainId === MANTLE_SEPOLIA_CHAIN_ID

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-secondary text-sm py-2 px-4">
          <span className="text-primary font-mono">{truncatedAddress}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-body text-xs text-muted-foreground">WALLET ADDRESS</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm">{truncatedAddress}</p>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="px-2 py-2">
          <p className="font-body text-xs text-muted-foreground mb-1">NATIVE BALANCE</p>
          <p className="font-stat text-sm">{formattedNativeBalance}</p>
        </div>

        <DropdownMenuSeparator />

        {isOnMantleSepolia && (
          <>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/faucet" className="flex items-center gap-2 font-body text-xs">
                <Droplets className="h-4 w-4 text-blue-500" />
                GET TEST USD
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer font-body text-xs text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          DISCONNECT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Connected State - Shows Chain Switcher + USD Balance + Wallet Dropdown
 */
function ConnectedState({
  address,
  chainId,
  onSwitchChain,
  onLogout,
}: {
  address: `0x${string}`
  chainId: number
  onSwitchChain: (chainId: number) => void
  onLogout: () => void
}) {
  // Get USD (mock USDT) balance - only available on Mantle Sepolia
  const mockUsdtAddress = TRIBUTARY_CONTRACTS[MANTLE_SEPOLIA_CHAIN_ID]?.mockUsdt

  const { data: usdBalance } = useReadContract({
    address: mockUsdtAddress,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: MANTLE_SEPOLIA_CHAIN_ID,
  })

  const formattedUsdBalance = usdBalance
    ? `$${Number(formatUnits(usdBalance as bigint, 6)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$0.00'

  return (
    <div className="flex items-center gap-2">
      {/* Chain Switcher */}
      <ChainSwitcher currentChainId={chainId} onSwitch={onSwitchChain} />

      {/* USD Balance Display */}
      <div className="btn-secondary text-sm py-2 px-3 font-stat">
        {formattedUsdBalance}
      </div>

      {/* Wallet Dropdown */}
      <WalletDetailsDropdown
        address={address}
        chainId={chainId}
        onLogout={onLogout}
      />
    </div>
  )
}

/**
 * Connect Button Component
 */
export function ConnectButton({ className }: ConnectButtonProps) {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets, ready: walletsReady } = useWallets()

  // Get wallet address from multiple sources
  // 1. First try wallets array (for both embedded and external wallets)
  // 2. Then fallback to user.wallet.address (for embedded wallets)
  // 3. Finally check linked accounts for wallet address
  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy')
  const externalWallet = wallets.find((w) => w.walletClientType !== 'privy')
  const activeWallet = embeddedWallet || externalWallet || wallets[0]

  // Get wallet address from various sources
  const walletFromWallets = activeWallet?.address
  const walletFromUser = user?.wallet?.address
  const walletFromLinkedAccounts = user?.linkedAccounts?.find(
    (account): account is { type: 'wallet'; address: string } =>
      account.type === 'wallet'
  )?.address

  const walletAddress = (walletFromWallets || walletFromUser || walletFromLinkedAccounts) as `0x${string}` | undefined

  // Get current chain from active wallet, default to Mantle Sepolia
  const currentChainId = activeWallet?.chainId
    ? parseInt(activeWallet.chainId.split(':')[1] || String(MANTLE_SEPOLIA_CHAIN_ID))
    : MANTLE_SEPOLIA_CHAIN_ID

  // Switch chain handler
  const handleSwitchChain = async (chainId: number) => {
    if (activeWallet) {
      try {
        await activeWallet.switchChain(chainId)
      } catch (error) {
        console.error('Failed to switch chain:', error)
      }
    }
  }

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

  // If authenticated but wallet not ready yet, show loading
  if (authenticated && !walletsReady) {
    return (
      <button
        className={`btn-primary text-sm py-2 px-4 opacity-50 cursor-not-allowed ${className || ''}`}
        disabled
      >
        LOADING WALLET...
      </button>
    )
  }

  // If authenticated and has wallet, show connected state
  if (authenticated && walletAddress) {
    return (
      <ConnectedState
        address={walletAddress}
        chainId={currentChainId}
        onSwitchChain={handleSwitchChain}
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
