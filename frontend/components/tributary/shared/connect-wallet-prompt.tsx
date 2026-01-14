'use client'

import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'
import { ConnectButton } from '@/lib/web3'

interface ConnectWalletPromptProps {
  message?: string
}

export function ConnectWalletPrompt({
  message = 'Connect your wallet to continue',
}: ConnectWalletPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-tributary-500/20 rounded-full blur-xl" />
        <div className="relative p-6 bg-river-800/50 border border-river-700 rounded-full">
          <Wallet className="h-12 w-12 text-tributary-400" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">Connect Wallet</h3>
      <p className="text-muted-foreground mb-6 text-center max-w-sm">{message}</p>

      <ConnectButton />
    </motion.div>
  )
}
