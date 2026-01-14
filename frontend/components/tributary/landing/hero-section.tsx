'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Droplets, ArrowRight, Sparkles, TrendingUp, Users, Box } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatUSDC } from '@/lib/utils'
import { useProtocolStats } from './hooks/use-protocol-stats'

export function HeroSection() {
  const { stats, isLoading } = useProtocolStats()

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tributary-500/10 border border-tributary-500/30 text-tributary-400 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              Powered by Story Protocol
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="text-white">Turn IP Royalties into</span>
            <br />
            <span className="bg-gradient-to-r from-tributary-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Liquid Investments
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-river-300 mb-10 max-w-2xl mx-auto"
          >
            Creators tokenize their royalty streams. Investors earn a share of IP revenue.
            Everyone benefits from the creator economy.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-tributary-500 to-cyan-600 hover:from-tributary-600 hover:to-cyan-700 text-lg px-8 h-14"
            >
              <Link href="/tributary/create">
                <Droplets className="h-5 w-5 mr-2" />
                Create a Vault
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 h-14 border-river-600 hover:bg-river-800/50"
            >
              <Link href="/tributary">
                Explore Marketplace
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
          >
            <StatCard
              icon={TrendingUp}
              value={isLoading ? '...' : formatUSDC(stats?.tvl || 0n)}
              label="Total Value Locked"
            />
            <StatCard
              icon={Box}
              value={isLoading ? '...' : String(stats?.vaultCount || 0)}
              label="Active Vaults"
            />
            <StatCard
              icon={Users}
              value={isLoading ? '...' : String(stats?.userCount || 0)}
              label="Token Holders"
            />
          </motion.div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-river-900 to-transparent" />
    </section>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-tributary-500/10 mb-3">
        <Icon className="h-5 w-5 text-tributary-400" />
      </div>
      <p className="text-2xl md:text-3xl font-bold text-white mb-1 font-mono">
        {value}
      </p>
      <p className="text-xs md:text-sm text-river-400">{label}</p>
    </div>
  )
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-river-900 via-river-900 to-river-950" />

      {/* Animated Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-tributary-500/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(20, 184, 166, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating Drops */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-tributary-400/30"
          style={{
            left: `${10 + (i * 6) % 80}%`,
            top: `${20 + (i * 7) % 60}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  )
}
