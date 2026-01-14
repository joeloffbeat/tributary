'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Wallet, Activity, Gift, Search, PlusCircle, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type EmptyStateVariant = 'marketplace' | 'portfolio' | 'listings' | 'rewards' | 'search' | 'custom'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  icon?: LucideIcon
}

const variantConfig: Record<EmptyStateVariant, { icon: LucideIcon; title: string; description: string }> = {
  marketplace: { icon: ShoppingBag, title: 'No Vaults Available', description: 'Check back soon for new investment opportunities.' },
  portfolio: { icon: Wallet, title: 'No Holdings Yet', description: 'Start investing in royalty tokens to build your portfolio.' },
  listings: { icon: Activity, title: 'No Active Listings', description: 'Create a listing to sell your tokens on the secondary market.' },
  rewards: { icon: Gift, title: 'No Pending Rewards', description: 'Your claimable rewards will appear here.' },
  search: { icon: Search, title: 'No Results Found', description: 'Try adjusting your search or filters.' },
  custom: { icon: PlusCircle, title: 'Nothing Here', description: 'This section is empty.' },
}

export function EmptyState({
  variant = 'custom',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = icon || config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-river-800/50 flex items-center justify-center">
        <Icon className="h-10 w-10 text-river-500" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        {title || config.title}
      </h3>
      <p className="text-river-400 text-sm mb-6 max-w-sm mx-auto">
        {description || config.description}
      </p>

      {(actionLabel || actionHref || onAction) && (
        <div>
          {actionHref ? (
            <Button asChild className="bg-gradient-to-r from-tributary-500 to-tributary-600">
              <Link href={actionHref}>{actionLabel || 'Get Started'}</Link>
            </Button>
          ) : onAction ? (
            <Button onClick={onAction} className="bg-gradient-to-r from-tributary-500 to-tributary-600">
              {actionLabel || 'Get Started'}
            </Button>
          ) : null}
        </div>
      )}
    </motion.div>
  )
}
