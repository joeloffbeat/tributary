import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatUnits } from "viem"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a bigint USDC value (6 decimals) as a human-readable string with $ prefix
 */
export function formatUSDC(value: bigint, options?: { compact?: boolean }): string {
  const num = Number(formatUnits(value, 6))

  if (options?.compact) {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`
    }
  }

  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format a bigint token amount (18 decimals) as a human-readable string
 */
export function formatTokenAmount(value: bigint, decimals = 18): string {
  const num = Number(formatUnits(value, decimals))

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }
  if (num < 0.01 && num > 0) {
    return '<0.01'
  }

  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Format an Ethereum address for display (truncated)
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return ''
  if (address.length < startChars + endChars + 2) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Format a number with compact notation (K, M, B)
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return '0'

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }

  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Shorten an address for display (alias for formatAddress)
 */
export function shortenAddress(address: string, startChars = 6, endChars = 4): string {
  return formatAddress(address, startChars, endChars)
}