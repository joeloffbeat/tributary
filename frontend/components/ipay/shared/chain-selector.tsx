'use client'

import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IPAY_SUPPORTED_CHAINS,
  getAllSupportedChains,
  type IPayChainConfig,
} from '@/constants/ipay'

interface ChainSelectorProps {
  value: number
  onChange: (chainId: number) => void
  className?: string
  disabled?: boolean
}

/**
 * Chain selector dropdown for selecting payment source chain
 * Displays chain icon, name, and native currency
 */
export function ChainSelector({
  value,
  onChange,
  className = '',
  disabled = false,
}: ChainSelectorProps) {
  const supportedChains = getAllSupportedChains()
  const selectedChain = IPAY_SUPPORTED_CHAINS[value]

  return (
    <Select
      value={String(value)}
      onValueChange={(val) => onChange(Number(val))}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[200px] ${className}`}>
        <SelectValue placeholder="Select chain">
          {selectedChain && (
            <div className="flex items-center gap-2">
              <ChainIcon chain={selectedChain} size={18} />
              <span>{selectedChain.displayName}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {supportedChains.map((chain) => (
          <SelectItem key={chain.chainId} value={String(chain.chainId)}>
            <div className="flex items-center gap-2">
              <ChainIcon chain={chain} size={18} />
              <span>{chain.displayName}</span>
              <span className="text-muted-foreground text-xs ml-auto">
                ({chain.nativeCurrency.symbol})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Chain icon component with fallback
 */
function ChainIcon({ chain, size = 20 }: { chain: IPayChainConfig; size?: number }) {
  // Fallback to first letter if icon fails to load
  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-muted overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image
        src={chain.icon}
        alt={chain.displayName}
        width={size}
        height={size}
        className="object-cover"
        onError={(e) => {
          // Hide broken image and show fallback
          e.currentTarget.style.display = 'none'
        }}
      />
      <span
        className="absolute inset-0 flex items-center justify-center text-xs font-medium"
        style={{ fontSize: size * 0.5 }}
      >
        {chain.displayName.charAt(0)}
      </span>
    </div>
  )
}

/**
 * Compact chain badge for displaying selected chain
 */
export function ChainBadge({ chainId, size = 'sm' }: { chainId: number; size?: 'sm' | 'md' | 'lg' }) {
  const chain = IPAY_SUPPORTED_CHAINS[chainId]
  if (!chain) return null

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-muted ${sizeClasses[size]}`}
    >
      <ChainIcon chain={chain} size={iconSizes[size]} />
      <span>{chain.displayName}</span>
    </div>
  )
}

/**
 * Get display name for a chain
 */
export function getChainDisplayName(chainId: number): string {
  return IPAY_SUPPORTED_CHAINS[chainId]?.displayName ?? 'Unknown Chain'
}

/**
 * Get native currency symbol for a chain
 */
export function getChainCurrencySymbol(chainId: number): string {
  return IPAY_SUPPORTED_CHAINS[chainId]?.nativeCurrency.symbol ?? '???'
}

export default ChainSelector
