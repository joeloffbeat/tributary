'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, AlertCircle, Loader2, Check, ArrowRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatTokenAmount, formatUSDC } from '@/lib/utils'
import { useExecuteTrade } from './hooks/use-execute-trade'
import type { Listing } from './types'

interface BuyTokensDialogProps {
  isOpen: boolean
  onClose: () => void
  listing: Listing
  onSuccess?: () => void
}

type TradeStep = 'input' | 'confirm' | 'executing' | 'success' | 'error'

export function BuyTokensDialog({ isOpen, onClose, listing, onSuccess }: BuyTokensDialogProps) {
  const [step, setStep] = useState<TradeStep>('input')
  const [quantity, setQuantity] = useState(100)
  const { executeTrade, approvalProgress, txHash, error, reset } = useExecuteTrade()

  const tokenAmount = (listing.remainingAmount * BigInt(quantity)) / 100n
  const totalCost = (tokenAmount * listing.pricePerToken) / BigInt(1e18)
  const priceImpact = useMemo(() => (quantity < 50 ? '0' : ((quantity - 50) * 0.1).toFixed(2)), [quantity])

  const handleConfirm = async () => {
    setStep('executing')
    try {
      await executeTrade({ listingId: listing.id, amount: tokenAmount, pricePerToken: listing.pricePerToken })
      setStep('success')
      onSuccess?.()
    } catch {
      setStep('error')
    }
  }

  const handleClose = () => {
    reset()
    setStep('input')
    setQuantity(100)
    onClose()
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
          <div className="p-6 border-b border-river-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-tributary-400" />
                Buy {listing.tokenSymbol}
              </h2>
              <Button variant="ghost" size="icon" onClick={handleClose} disabled={step === 'executing'}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-6">
            {step === 'input' && (
              <InputStep listing={listing} quantity={quantity} setQuantity={setQuantity} tokenAmount={tokenAmount} totalCost={totalCost} priceImpact={priceImpact} onContinue={() => setStep('confirm')} />
            )}
            {step === 'confirm' && (
              <ConfirmStep listing={listing} tokenAmount={tokenAmount} totalCost={totalCost} onBack={() => setStep('input')} onConfirm={handleConfirm} />
            )}
            {step === 'executing' && <ExecutingStep approvalProgress={approvalProgress} />}
            {step === 'success' && (
              <SuccessStep tokenAmount={tokenAmount} tokenSymbol={listing.tokenSymbol || 'tokens'} txHash={txHash} onClose={handleClose} />
            )}
            {step === 'error' && <ErrorStep error={error} onRetry={() => setStep('confirm')} onClose={handleClose} />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function InputStep({ listing, quantity, setQuantity, tokenAmount, totalCost, priceImpact, onContinue }: {
  listing: Listing; quantity: number; setQuantity: (q: number) => void; tokenAmount: bigint; totalCost: bigint; priceImpact: string; onContinue: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Amount to Buy</Label>
          <span className="text-sm text-river-400">{formatTokenAmount(tokenAmount)} ({quantity}%)</span>
        </div>
        <Slider value={[quantity]} onValueChange={([v]) => setQuantity(v)} min={1} max={100} step={1} />
        <p className="text-xs text-river-500">Available: {formatTokenAmount(listing.remainingAmount)} tokens</p>
      </div>
      <div className="space-y-2 p-4 bg-river-800/30 rounded-xl">
        <div className="flex justify-between text-sm">
          <span className="text-river-400">Price per token</span>
          <span className="font-mono">{formatUSDC(listing.pricePerToken)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-river-400">Quantity</span>
          <span className="font-mono">{formatTokenAmount(tokenAmount)}</span>
        </div>
        {parseFloat(priceImpact) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-river-400 flex items-center gap-1">
              Price Impact
              <TooltipProvider><Tooltip><TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger><TooltipContent>Large orders may affect market price</TooltipContent></Tooltip></TooltipProvider>
            </span>
            <span className="font-mono text-yellow-400">~{priceImpact}%</span>
          </div>
        )}
      </div>
      <Card className="bg-tributary-500/10 border-tributary-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Cost</span>
            <span className="text-xl font-bold text-tributary-400 font-mono">{formatUSDC(totalCost)}</span>
          </div>
        </CardContent>
      </Card>
      <Button onClick={onContinue} className="w-full bg-gradient-to-r from-tributary-500 to-tributary-600" size="lg">
        Continue <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}

function ConfirmStep({ listing, tokenAmount, totalCost, onBack, onConfirm }: {
  listing: Listing; tokenAmount: bigint; totalCost: bigint; onBack: () => void; onConfirm: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-river-400 mb-4">You are about to purchase:</p>
        <p className="text-3xl font-bold text-white mb-2">{formatTokenAmount(tokenAmount)}</p>
        <p className="text-tributary-400">{listing.tokenSymbol} tokens</p>
      </div>
      <div className="p-4 bg-river-800/30 rounded-xl space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-river-400">Total Cost</span>
          <span className="font-mono">{formatUSDC(totalCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-river-400">Seller</span>
          <span className="font-mono text-xs truncate max-w-[200px]">{listing.seller}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-tributary-500 to-tributary-600">Confirm Purchase</Button>
      </div>
    </div>
  )
}

function ExecutingStep({ approvalProgress }: { approvalProgress: number }) {
  return (
    <div className="text-center space-y-4 py-8">
      <Loader2 className="h-12 w-12 text-tributary-400 mx-auto animate-spin" />
      <div>
        <p className="font-medium mb-2">Processing Transaction</p>
        <p className="text-sm text-river-400">{approvalProgress < 50 ? 'Approving USDC...' : 'Executing trade...'}</p>
      </div>
      <Progress value={approvalProgress} className="h-2" />
    </div>
  )
}

function SuccessStep({ tokenAmount, tokenSymbol, txHash, onClose }: {
  tokenAmount: bigint; tokenSymbol: string; txHash: string | null; onClose: () => void
}) {
  return (
    <div className="text-center space-y-4 py-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
        <Check className="h-8 w-8 text-green-400" />
      </motion.div>
      <div>
        <h3 className="text-lg font-semibold">Purchase Complete!</h3>
        <p className="text-river-400">You now own {formatTokenAmount(tokenAmount)} {tokenSymbol}</p>
      </div>
      {txHash && (
        <a href={`https://sepolia.mantlescan.xyz/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-sm text-tributary-400 hover:underline">
          View transaction
        </a>
      )}
      <Button onClick={onClose} variant="outline" className="w-full">Done</Button>
    </div>
  )
}

function ErrorStep({ error, onRetry, onClose }: { error: string | null; onRetry: () => void; onClose: () => void }) {
  return (
    <div className="text-center space-y-4 py-4">
      <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Transaction Failed</h3>
        <p className="text-river-400 text-sm">{error || 'Something went wrong'}</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onRetry} variant="outline" className="flex-1">Retry</Button>
        <Button onClick={onClose} variant="ghost" className="flex-1">Close</Button>
      </div>
    </div>
  )
}
