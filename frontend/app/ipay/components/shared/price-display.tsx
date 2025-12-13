'use client'

import { formatUnits } from 'viem'
import Image from 'next/image'

interface PriceDisplayProps {
  /** Price in smallest unit (wei for 6 decimals USDC) */
  amount: bigint
  /** Token decimals, defaults to 6 for USDC */
  decimals?: number
  /** Show full precision or truncate */
  showFullPrecision?: boolean
  className?: string
}

export function PriceDisplay({
  amount,
  decimals = 6,
  showFullPrecision = false,
  className = '',
}: PriceDisplayProps) {
  const formatted = formatUnits(amount, decimals)
  const numValue = parseFloat(formatted)

  // Format with appropriate decimal places
  const displayValue = showFullPrecision
    ? formatted
    : numValue < 0.01
      ? numValue.toFixed(4)
      : numValue < 1
        ? numValue.toFixed(3)
        : numValue.toFixed(2)

  return (
    <span className={`font-medium inline-flex items-center gap-1 ${className}`}>
      <Image src="/usdc.png" alt="USDC" width={16} height={16} className="rounded-full" />
      {displayValue} USDC
    </span>
  )
}

interface PriceDisplayWithLabelProps extends PriceDisplayProps {
  label?: string
}

export function PriceDisplayWithLabel({
  label = 'Price',
  ...props
}: PriceDisplayWithLabelProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <PriceDisplay {...props} />
    </div>
  )
}

// Utility to format price from bigint to string
export function formatPrice(amount: bigint, decimals = 6): string {
  const formatted = formatUnits(amount, decimals)
  const numValue = parseFloat(formatted)

  if (numValue < 0.01) return numValue.toFixed(4)
  if (numValue < 1) return numValue.toFixed(3)
  return numValue.toFixed(2)
}
