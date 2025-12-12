'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getChainLogoUrl, getChainMetadata } from '@/lib/web3/assets'

interface ChainLogoProps {
  chainId: number
  name: string
  size?: 'sm' | 'md'
}

export function ChainLogo({ chainId, name, size = 'md' }: ChainLogoProps) {
  const [imgError, setImgError] = useState(false)
  const logoUrl = getChainLogoUrl(chainId)
  const metadata = getChainMetadata(chainId)

  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'

  if (imgError || !logoUrl || logoUrl.includes('generic-chain')) {
    return (
      <div
        className={cn(
          sizeClasses,
          'rounded-full flex items-center justify-center font-bold text-white'
        )}
        style={{ backgroundColor: metadata.color || '#627EEA' }}
      >
        {name.slice(0, 1)}
      </div>
    )
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      className={cn(sizeClasses, 'rounded-full object-cover')}
      onError={() => setImgError(true)}
    />
  )
}
