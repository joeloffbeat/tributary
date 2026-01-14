'use client'

import { motion } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NetworkErrorProps {
  onRetry?: () => void
  message?: string
}

export function NetworkError({
  onRetry,
  message = 'Unable to connect to the network. Please check your connection.',
}: NetworkErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      {/* Animated Icon */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-river-800/50 flex items-center justify-center">
          <WifiOff className="h-10 w-10 text-river-500" />
        </div>
      </motion.div>

      {/* Message */}
      <h3 className="text-lg font-semibold text-white mb-2">Connection Lost</h3>
      <p className="text-river-400 text-sm mb-6 text-center max-w-sm">
        {message}
      </p>

      {/* Retry */}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      )}
    </motion.div>
  )
}
