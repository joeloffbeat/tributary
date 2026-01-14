'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Gift, MoreVertical, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { formatUSDC, formatTokenAmount } from '@/lib/utils'
import type { PortfolioHolding } from '../types'

interface HoldingCardProps {
  holding: PortfolioHolding
  onClaim?: () => void
  onSell?: () => void
  onViewDetails?: () => void
}

export function HoldingCard({ holding, onClaim, onSell, onViewDetails }: HoldingCardProps) {
  const hasRewards = holding.pendingRewards > 0n

  return (
    <Card className="bg-river-800/30 border-river-700 hover:border-river-600 transition-colors overflow-hidden">
      {/* Header with Image */}
      <div className="relative h-24 bg-river-700/30">
        {holding.imageUrl ? (
          <img
            src={holding.imageUrl}
            alt={holding.tokenName}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-tributary-900/30 to-river-800" />
        )}

        {/* APY Badge */}
        <Badge className="absolute top-2 right-2 bg-river-900/80 backdrop-blur-sm">
          <TrendingUp className="h-3 w-3 mr-1" />
          {holding.apy.toFixed(1)}% APY
        </Badge>

        {/* Token Symbol */}
        <div className="absolute bottom-2 left-3">
          <Badge variant="secondary" className="bg-tributary-500/20 text-tributary-400">
            {holding.tokenSymbol}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Title and Menu */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-white truncate">{holding.tokenName}</h3>
            <p className="text-xs text-river-500">{holding.percentage.toFixed(2)}% ownership</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewDetails}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={onSell}>Sell Tokens</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`https://aeneid.storyscan.xyz/ip/${holding.storyIPId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  View on Story <ExternalLink className="h-3 w-3" />
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Balance and Value */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-river-400">Balance</span>
            <span className="font-mono text-white">
              {formatTokenAmount(holding.balance)} {holding.tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-river-400">Value</span>
            <span className="font-mono text-white">{formatUSDC(holding.value)}</span>
          </div>
        </div>

        {/* Pending Rewards */}
        {hasRewards && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-tributary-500/10 border border-tributary-500/30 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-tributary-400" />
                <span className="text-sm text-tributary-400">Pending Rewards</span>
              </div>
              <span className="font-mono font-medium text-tributary-300">
                {formatUSDC(holding.pendingRewards)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Claim Button */}
        <Button
          onClick={onClaim}
          disabled={!hasRewards}
          variant={hasRewards ? 'default' : 'outline'}
          className={`w-full ${
            hasRewards
              ? 'bg-gradient-to-r from-tributary-500 to-tributary-600 hover:from-tributary-600 hover:to-tributary-700'
              : ''
          }`}
        >
          {hasRewards ? (
            <>
              <Gift className="h-4 w-4 mr-2" />
              Claim {formatUSDC(holding.pendingRewards)}
            </>
          ) : (
            'No Rewards to Claim'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export function HoldingCardSkeleton() {
  return (
    <Card className="bg-river-800/30 border-river-700 overflow-hidden">
      <Skeleton className="h-24 w-full" />
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}
