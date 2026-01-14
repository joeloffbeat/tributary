'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertCircle, CheckCircle2, Coins } from 'lucide-react'
import { parseUnits, formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useAccount } from '@/lib/web3'
import { useOutsideClick } from '@/hooks/use-outside-click'
import { useBuyTokens } from '../hooks/use-buy-tokens'
import { formatUSDC } from '@/lib/utils'
import type { TributaryVault } from '../types'

interface BuyTokensDialogProps {
  vault: TributaryVault | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (txHash: string, amount: string) => void
}

export function BuyTokensDialog({ vault, isOpen, onClose, onSuccess }: BuyTokensDialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState<string>('100')
  const { buy, approve, reset, status, error, needsApproval, usdcBalance, isLoadingBalances } = useBuyTokens(vault!)

  useEffect(() => {
    if (isOpen) reset()
  }, [isOpen, reset])

  useOutsideClick(ref, onClose)

  // Calculate amounts
  const tokenAmount = useMemo(() => {
    try { return parseUnits(amount || '0', vault?.tokenDecimals ?? 18) } catch { return 0n }
  }, [amount, vault?.tokenDecimals])

  const totalCost = useMemo(() => {
    if (!vault || tokenAmount === 0n) return 0n
    return (tokenAmount * vault.tokenPrice) / BigInt(10 ** (vault.tokenDecimals ?? 18))
  }, [tokenAmount, vault])

  const hasInsufficientBalance = usdcBalance < totalCost
  const maxTokens = vault ? Number(formatUnits(vault.availableTokens, vault.tokenDecimals)) : 0

  const handleBuy = async () => {
    if (!vault) return
    if (needsApproval) {
      await approve(totalCost)
    } else {
      const txHash = await buy(tokenAmount)
      if (txHash) onSuccess(txHash, amount)
    }
  }

  if (!isOpen || !vault) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div ref={ref} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-river-900 border border-river-700 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-river-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Buy {vault.tokenSymbol}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Token Amount Input */}
            <div className="space-y-2">
              <Label>Amount of Tokens</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount" className="bg-river-800/50 text-lg" min="1" max={maxTokens} />
              <Slider min={1} max={Math.max(1, maxTokens)} step={1} value={[Number(amount) || 1]}
                onValueChange={([val]) => setAmount(val.toString())} className="mt-2" />
              <p className="text-xs text-river-500">Available: {maxTokens.toLocaleString()} {vault.tokenSymbol}</p>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-river-800/30 rounded-xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-river-400">Token Price</span>
                <span className="font-mono">{formatUSDC(vault.tokenPrice)} / token</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-river-400">Quantity</span>
                <span className="font-mono">{amount || '0'} {vault.tokenSymbol}</span>
              </div>
              <div className="border-t border-river-700 pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-tributary-400 font-mono">{formatUSDC(totalCost)}</span>
              </div>
            </div>

            {/* Balance Check */}
            {isLoadingBalances ? (
              <div className="flex items-center gap-2 text-river-400 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading balance...</div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-river-400">Your USDC Balance</span>
                <span className={hasInsufficientBalance ? 'text-red-400' : 'text-river-200'}>{formatUSDC(usdcBalance)}</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                <CheckCircle2 className="h-4 w-4" />Transaction submitted successfully!
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-river-700">
            <Button onClick={handleBuy} disabled={!isConnected || hasInsufficientBalance || status === 'pending' || tokenAmount === 0n}
              className="w-full bg-gradient-to-r from-tributary-500 to-tributary-600 hover:from-tributary-600 hover:to-tributary-700" size="lg">
              {status === 'pending' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{needsApproval ? 'Approving...' : 'Buying...'}</>
              ) : needsApproval ? 'Approve USDC' : (
                <><Coins className="h-4 w-4 mr-2" />Buy Tokens</>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
