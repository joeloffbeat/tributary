'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOutsideClick } from '@/hooks/use-outside-click'

interface PurchaseSuccessModalProps {
  txHash: string
  tokenSymbol: string
  amount: string
  isOpen: boolean
  onClose: () => void
  onViewPortfolio: () => void
}

export function PurchaseSuccessModal({ txHash, tokenSymbol, amount, isOpen, onClose, onViewPortfolio }: PurchaseSuccessModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, onClose)

  // Close on escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!isOpen) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Celebration particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div key={i} className="absolute w-2 h-2 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: '-10px', backgroundColor: ['#14B8A6', '#06B6D4', '#10B981'][i % 3] }}
            animate={{ y: ['0vh', '100vh'], opacity: [1, 0], rotate: [0, 360] }}
            transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, repeat: 0 }} />
        ))}
      </div>

      <motion.div ref={ref} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-river-900 border border-river-700 rounded-2xl p-8 text-center relative">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </motion.div>

        <h2 className="text-xl font-semibold mb-2">Purchase Complete!</h2>
        <p className="text-river-400 mb-6">You now own {amount} {tokenSymbol} tokens</p>

        <div className="space-y-3">
          <Button onClick={onViewPortfolio} className="w-full bg-gradient-to-r from-tributary-500 to-tributary-600">
            View Portfolio <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <a href={`https://sepolia.mantlescan.xyz/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-tributary-400 hover:text-tributary-300">
            View Transaction <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
