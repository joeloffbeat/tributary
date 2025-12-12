'use client'

import { Zap, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAccount } from '@/lib/web3'
import { useIPayPayment } from '../../hooks/use-ipay-payment'
import { PriceDisplay } from '../shared/price-display'
import type { IPListing, UsageReceipt } from '../../types'

interface PricingCardProps {
  listing: IPListing
  onPaymentSuccess?: (receipt: UsageReceipt) => void
}

export function PricingCard({ listing, onPaymentSuccess }: PricingCardProps) {
  const { isConnected } = useAccount()
  const { payForIP, isPaying, steps, lastReceipt, error, resetPayment } = useIPayPayment()

  const handlePayAndUse = async () => {
    const result = await payForIP(listing)
    if (result.success && result.receipt) {
      onPaymentSuccess?.(result.receipt)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Price per Use</span>
          <PriceDisplay
            amount={listing.pricePerUse}
            className="text-2xl text-primary"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Steps */}
        {isPaying && (
          <div className="space-y-2 mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-2 text-sm"
              >
                {step.status === 'pending' && (
                  <div className="h-4 w-4 rounded-full border-2" />
                )}
                {step.status === 'in_progress' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {step.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {step.status === 'failed' && (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className={step.status === 'in_progress' ? 'text-foreground' : 'text-muted-foreground'}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={resetPayment}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Pay Button */}
        <Button
          className="w-full"
          size="lg"
          disabled={!isConnected || !listing.isActive || isPaying}
          onClick={handlePayAndUse}
        >
          {isPaying ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Pay & Use
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Payment via x402 protocol on Avalanche Fuji</p>
          <p>USDC will be deducted from your wallet</p>
        </div>

        {!listing.isActive && (
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              This listing is currently inactive
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PricingCard
