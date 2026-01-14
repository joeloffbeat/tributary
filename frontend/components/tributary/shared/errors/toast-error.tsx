'use client'

import { AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastErrorProps {
  message: string
  isVisible: boolean
  onDismiss: () => void
}

export function ToastError({ message, isVisible, onDismiss }: ToastErrorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200 flex-1">{message}</p>
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
