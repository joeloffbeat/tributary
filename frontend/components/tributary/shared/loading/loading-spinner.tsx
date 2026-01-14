'use client'

import { motion } from 'framer-motion'
import { Droplets, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'drops' | 'pulse'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  className,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  if (variant === 'spinner') {
    return (
      <Loader2
        className={cn(sizes[size], 'animate-spin text-tributary-400', className)}
      />
    )
  }

  if (variant === 'drops') {
    return (
      <motion.div
        className={cn('relative', className)}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Droplets className={cn(sizes[size], 'text-tributary-400')} />
      </motion.div>
    )
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn(
          sizes[size],
          'rounded-full bg-tributary-400',
          className
        )}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    )
  }

  return null
}
