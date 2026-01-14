'use client'

import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface ErrorCardProps {
  title?: string
  message?: string
  onRetry?: () => void
  showHome?: boolean
  showBack?: boolean
}

export function ErrorCard({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  showHome = false,
  showBack = false,
}: ErrorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-river-800/50 border-red-500/30 max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>

          {/* Message */}
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-river-400 text-sm mb-6">{message}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            {showBack && (
              <Button onClick={() => window.history.back()} variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}
            {showHome && (
              <Button asChild variant="ghost" className="gap-2">
                <Link href="/tributary">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
