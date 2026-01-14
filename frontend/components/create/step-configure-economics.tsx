'use client'

import { VaultFormData } from '@/app/create/page'

interface StepConfigureEconomicsProps {
  data: Partial<VaultFormData>
  onUpdate: (data: Partial<VaultFormData>) => void
  onBack: () => void
  onNext: () => void
}

export function StepConfigureEconomics({
  data,
  onUpdate,
  onBack,
  onNext,
}: StepConfigureEconomicsProps) {
  return (
    <div>
      <h2 className="font-title text-3xl mb-2">Configure Economics</h2>
      <p className="font-body text-sm text-text-secondary mb-6">
        SET DIVIDEND AND TRADING PARAMETERS
      </p>

      <div className="space-y-8">
        {/* Dividend Rate */}
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            DIVIDEND RATE: {((data.dividendBps || 0) / 100).toFixed(1)}%
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={data.dividendBps || 500}
            onChange={(e) => onUpdate({ dividendBps: parseInt(e.target.value) })}
            className="w-full accent-tributary"
          />
          <div className="flex justify-between font-body text-xs text-text-muted">
            <span>0%</span>
            <span>100%</span>
          </div>
          <p className="font-body text-xs text-text-muted mt-2">
            PERCENTAGE OF YOUR IP REVENUE DISTRIBUTED TO TOKEN HOLDERS.
            THE REMAINING {(100 - (data.dividendBps || 0) / 100).toFixed(1)}% STAYS WITH YOU.
          </p>
        </div>

        {/* Trading Fee */}
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            TRADING FEE: {((data.tradingFeeBps || 0) / 100).toFixed(1)}%
          </label>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={data.tradingFeeBps || 100}
            onChange={(e) => onUpdate({ tradingFeeBps: parseInt(e.target.value) })}
            className="w-full accent-tributary"
          />
          <div className="flex justify-between font-body text-xs text-text-muted">
            <span>0%</span>
            <span>5%</span>
          </div>
          <p className="font-body text-xs text-text-muted mt-2">
            FEE CHARGED ON EACH BUY/SELL TRADE OF YOUR TOKEN.
          </p>
        </div>

        {/* Initial Price */}
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            INITIAL PRICE (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={data.initialPrice || 1}
              onChange={(e) => onUpdate({ initialPrice: parseFloat(e.target.value) })}
              className="input-premium w-full pl-8"
            />
          </div>
          <p className="font-body text-xs text-text-muted mt-1">
            STARTING PRICE PER TOKEN. MARKET CAP: ${((data.initialPrice || 1) * 10000).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="btn-secondary">
          BACK
        </button>
        <button onClick={onNext} className="btn-primary">
          REVIEW
        </button>
      </div>
    </div>
  )
}
