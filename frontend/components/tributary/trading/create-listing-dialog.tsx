'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { formatTokenAmount, formatUSDC } from '@/lib/utils'
import { useCreateListing } from './hooks/use-create-listing'
import type { PortfolioHolding } from '../portfolio/types'

interface CreateListingDialogProps {
  isOpen: boolean
  onClose: () => void
  holding: PortfolioHolding
  onSuccess?: () => void
}

export function CreateListingDialog({
  isOpen,
  onClose,
  holding,
  onSuccess,
}: CreateListingDialogProps) {
  const [pricePerToken, setPricePerToken] = useState('')
  const [quantity, setQuantity] = useState(50) // Percentage of holdings
  const [hasExpiry, setHasExpiry] = useState(false)
  const [expiryDays, setExpiryDays] = useState(7)

  const { createListing, isPending, error } = useCreateListing()

  const tokenAmount = (holding.balance * BigInt(quantity)) / 100n
  const totalValue =
    pricePerToken && parseFloat(pricePerToken) > 0
      ? (tokenAmount * BigInt(Math.floor(parseFloat(pricePerToken) * 1e6))) / BigInt(1e18)
      : 0n

  const handleSubmit = async () => {
    if (!pricePerToken || parseFloat(pricePerToken) <= 0) return

    await createListing({
      vaultAddress: holding.vaultAddress,
      tokenAddress: holding.tokenAddress,
      amount: tokenAmount,
      pricePerToken: BigInt(Math.floor(parseFloat(pricePerToken) * 1e6)),
      expiresAt: hasExpiry ? Math.floor(Date.now() / 1000) + expiryDays * 86400 : 0,
    })

    onSuccess?.()
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
          {/* Header */}
          <div className="p-6 border-b border-river-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Tag className="h-5 w-5 text-tributary-400" />
                  Create Listing
                </h2>
                <p className="text-sm text-river-400 mt-1">
                  List {holding.tokenSymbol} tokens for sale
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quantity Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Quantity to Sell</Label>
                <span className="text-sm text-river-400">
                  {formatTokenAmount(tokenAmount)} tokens ({quantity}%)
                </span>
              </div>
              <Slider
                value={[quantity]}
                onValueChange={([v]) => setQuantity(v)}
                min={1}
                max={100}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-river-500">
                <span>1%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Price Per Token */}
            <div className="space-y-2">
              <Label>Price Per Token (USDC)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={pricePerToken}
                  onChange={(e) => setPricePerToken(e.target.value)}
                  className="pr-16 bg-river-800/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-river-400">
                  USDC
                </span>
              </div>
              <p className="text-xs text-river-500">
                Your balance: {formatTokenAmount(holding.balance)} {holding.tokenSymbol}
              </p>
            </div>

            {/* Expiry Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Set Expiry</Label>
                <Switch checked={hasExpiry} onCheckedChange={setHasExpiry} />
              </div>
              {hasExpiry && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex gap-2">
                    {[1, 3, 7, 14, 30].map((days) => (
                      <Button
                        key={days}
                        variant={expiryDays === days ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExpiryDays(days)}
                        className="flex-1"
                      >
                        {days}d
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Summary */}
            <Card className="bg-tributary-500/10 border-tributary-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-river-300">Total Value</span>
                  <span className="text-xl font-bold text-tributary-400 font-mono">
                    {formatUSDC(totalValue)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!pricePerToken || parseFloat(pricePerToken) <= 0 || isPending}
                className="flex-1 bg-gradient-to-r from-tributary-500 to-tributary-600"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Listing
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
