'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TouchCardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function TouchCard({
  children,
  onClick,
  className,
  disabled,
}: TouchCardProps) {
  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={cn(
        'rounded-xl transition-colors cursor-pointer',
        'active:bg-river-700/30',
        'min-h-[44px]', // Touch target minimum
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
