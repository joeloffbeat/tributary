'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatUSDC } from '@/lib/utils'
import { useClaimAll } from '../hooks/use-claim-all'
import type { PortfolioHolding } from '../types'

interface ClaimAllDialogProps {
  isOpen: boolean
  onClose: () => void
  holdings: PortfolioHolding[]
  totalRewards: bigint
  onSuccess?: () => void
}

type ClaimStatus = 'preview' | 'claiming' | 'success' | 'error'

export function ClaimAllDialog({
  isOpen,
  onClose,
  holdings,
  totalRewards,
  onSuccess,
}: ClaimAllDialogProps) {
  const [status, setStatus] = useState<ClaimStatus>('preview')
  const { claimAll, currentIndex, error, totalClaimed, reset } = useClaimAll()

  const progress = holdings.length > 0 ? ((currentIndex + 1) / holdings.length) * 100 : 0

  const handleClaim = async () => {
    setStatus('claiming')
    try {
      await claimAll(holdings)
      setStatus('success')
      onSuccess?.()
    } catch {
      setStatus('error')
    }
  }

  const handleClose = () => {
    if (status !== 'claiming') {
      setStatus('preview')
      reset()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-river-900 border border-river-700 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-river-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Gift className="h-5 w-5 text-tributary-400" />
                Claim All Rewards
              </h2>
              <Button variant="ghost" size="icon" onClick={handleClose} disabled={status === 'claiming'}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {status === 'preview' && (
              <PreviewStep holdings={holdings} totalRewards={totalRewards} onConfirm={handleClaim} />
            )}
            {status === 'claiming' && (
              <ClaimingStep holdings={holdings} currentIndex={currentIndex} progress={progress} />
            )}
            {status === 'success' && <SuccessStep totalClaimed={totalClaimed} onClose={handleClose} />}
            {status === 'error' && <ErrorStep error={error} onRetry={handleClaim} onClose={handleClose} />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function PreviewStep({ holdings, totalRewards, onConfirm }: { holdings: PortfolioHolding[]; totalRewards: bigint; onConfirm: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-river-400 text-sm">Pending rewards from {holdings.length} vault{holdings.length !== 1 && 's'}:</p>
      <div className="max-h-48 overflow-y-auto space-y-2">
        {holdings.map((h) => (
          <div key={h.vaultAddress} className="flex items-center justify-between p-3 bg-river-800/30 rounded-lg">
            <span className="text-sm text-river-200">{h.tokenName}</span>
            <span className="text-sm font-mono text-tributary-400">{formatUSDC(h.pendingRewards)}</span>
          </div>
        ))}
      </div>
      <div className="p-4 bg-tributary-500/10 border border-tributary-500/30 rounded-xl flex items-center justify-between">
        <span className="font-medium">Total to Claim</span>
        <span className="text-xl font-bold text-tributary-400 font-mono">{formatUSDC(totalRewards)}</span>
      </div>
      <Button onClick={onConfirm} className="w-full bg-gradient-to-r from-tributary-500 to-tributary-600" size="lg">
        <Gift className="h-4 w-4 mr-2" />Claim All Rewards
      </Button>
    </div>
  )
}

function ClaimingStep({ holdings, currentIndex, progress }: { holdings: PortfolioHolding[]; currentIndex: number; progress: number }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-tributary-400 mx-auto animate-spin mb-4" />
        <p className="text-river-400">Claiming vault {Math.min(currentIndex + 1, holdings.length)} of {holdings.length}</p>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="max-h-32 overflow-y-auto space-y-1">
        {holdings.map((h, idx) => (
          <div key={h.vaultAddress} className="flex items-center justify-between text-sm py-1">
            <span className={idx <= currentIndex ? 'text-white' : 'text-river-500'}>{h.tokenName}</span>
            {idx < currentIndex && <Check className="h-4 w-4 text-green-400" />}
            {idx === currentIndex && <Loader2 className="h-4 w-4 animate-spin text-tributary-400" />}
          </div>
        ))}
      </div>
    </div>
  )
}

function SuccessStep({ totalClaimed, onClose }: { totalClaimed: bigint; onClose: () => void }) {
  return (
    <div className="text-center space-y-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center"
      >
        <Check className="h-8 w-8 text-green-400" />
      </motion.div>
      <div>
        <h3 className="text-lg font-semibold">Rewards Claimed!</h3>
        <p className="text-river-400">
          You successfully claimed <span className="text-tributary-400 font-mono">{formatUSDC(totalClaimed)}</span>
        </p>
      </div>
      <Button onClick={onClose} variant="outline" className="w-full">
        Done
      </Button>
    </div>
  )
}

function ErrorStep({ error, onRetry, onClose }: { error: string | null; onRetry: () => void; onClose: () => void }) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Claim Failed</h3>
        <p className="text-river-400 text-sm">{error || 'An error occurred'}</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onRetry} variant="outline" className="flex-1">
          Retry
        </Button>
        <Button onClick={onClose} variant="ghost" className="flex-1">
          Close
        </Button>
      </div>
    </div>
  )
}
