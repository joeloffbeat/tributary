'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Wallet, Gift, PiggyBank } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatUSDC } from '@/lib/utils'
import type { PortfolioStats } from '../types'

interface PortfolioHeroProps {
  stats: PortfolioStats | null
  isLoading: boolean
}

export function PortfolioHero({ stats, isLoading }: PortfolioHeroProps) {
  if (isLoading) {
    return <PortfolioHeroSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Main Value Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tributary-900/50 to-river-900 border border-tributary-500/20 p-8"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-tributary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <p className="text-river-400 text-sm mb-2">Total Portfolio Value</p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white font-mono"
          >
            {formatUSDC(stats?.totalValue || 0n)}
          </motion.h1>

          {stats?.valueChange24h !== undefined && stats.valueChange24h !== 0 && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                stats.valueChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              <TrendingUp className={`h-4 w-4 ${stats.valueChange24h < 0 && 'rotate-180'}`} />
              {stats.valueChange24h >= 0 ? '+' : ''}
              {stats.valueChange24h.toFixed(2)}% (24h)
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Holdings"
          value={stats?.holdingCount.toString() || '0'}
          sublabel="vaults"
          icon={Wallet}
          delay={0.1}
        />
        <StatCard
          label="Pending Rewards"
          value={formatUSDC(stats?.totalPendingRewards || 0n)}
          sublabel="claimable"
          icon={Gift}
          highlight
          delay={0.15}
        />
        <StatCard
          label="Total Earned"
          value={formatUSDC(stats?.totalEarned || 0n)}
          sublabel="all time"
          icon={PiggyBank}
          delay={0.2}
        />
        <StatCard
          label="Avg. APY"
          value={`${stats?.averageApy?.toFixed(1) || '0'}%`}
          sublabel="weighted"
          icon={TrendingUp}
          delay={0.25}
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  sublabel: string
  icon: typeof TrendingUp
  highlight?: boolean
  delay?: number
}

function StatCard({ label, value, sublabel, icon: Icon, highlight, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`bg-river-800/30 border-river-700 ${highlight && 'border-tributary-500/50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`h-4 w-4 ${highlight ? 'text-tributary-400' : 'text-river-500'}`} />
            <span className="text-xs text-river-400">{label}</span>
          </div>
          <p
            className={`text-xl font-semibold font-mono ${highlight ? 'text-tributary-400' : 'text-white'}`}
          >
            {value}
          </p>
          <p className="text-xs text-river-500">{sublabel}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PortfolioHeroSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
