'use client'

import { VaultFormData } from '@/app/create/page'

interface StepConfigureTokenProps {
  data: Partial<VaultFormData>
  onUpdate: (data: Partial<VaultFormData>) => void
  onBack: () => void
  onNext: () => void
}

export function StepConfigureToken({
  data,
  onUpdate,
  onBack,
  onNext,
}: StepConfigureTokenProps) {
  const FIXED_SUPPLY = 10000

  return (
    <div>
      <h2 className="font-title text-3xl mb-2">Configure Token</h2>
      <p className="font-body text-sm text-text-secondary mb-6">
        SET UP YOUR ROYALTY TOKEN DETAILS
      </p>

      <div className="space-y-6">
        {/* Token Name */}
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            TOKEN NAME
          </label>
          <input
            type="text"
            value={data.tokenName || ''}
            onChange={(e) => onUpdate({ tokenName: e.target.value })}
            placeholder="MY IP TOKEN"
            className="input-premium w-full"
          />
        </div>

        {/* Token Symbol */}
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            TOKEN SYMBOL
          </label>
          <input
            type="text"
            value={data.tokenSymbol || ''}
            onChange={(e) => onUpdate({ tokenSymbol: e.target.value.toUpperCase().slice(0, 6) })}
            placeholder="MIT"
            maxLength={6}
            className="input-premium w-full"
          />
        </div>

        {/* Fixed Supply */}
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            TOTAL SUPPLY (FIXED)
          </label>
          <div className="input-premium w-full bg-cream-dark/50 cursor-not-allowed">
            {FIXED_SUPPLY.toLocaleString()} TOKENS
          </div>
          <p className="font-body text-xs text-text-muted mt-1">
            ALL VAULTS HAVE A FIXED SUPPLY OF 10,000 TOKENS
          </p>
        </div>

        {/* Creator Allocation */}
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            YOUR ALLOCATION: {((data.creatorAllocation || 0) / 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={data.creatorAllocation || 3000}
            onChange={(e) => onUpdate({ creatorAllocation: parseInt(e.target.value) })}
            className="w-full accent-tributary"
          />
          <div className="flex justify-between font-body text-xs text-text-muted">
            <span>0%</span>
            <span>{((data.creatorAllocation || 0)).toLocaleString()} TOKENS</span>
            <span>100%</span>
          </div>
          <p className="font-body text-xs text-text-muted mt-1">
            REMAINING {(FIXED_SUPPLY - (data.creatorAllocation || 0)).toLocaleString()} TOKENS WILL BE AVAILABLE FOR SALE
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="btn-secondary">
          BACK
        </button>
        <button
          onClick={onNext}
          disabled={!data.tokenName || !data.tokenSymbol}
          className="btn-primary disabled:opacity-50"
        >
          CONTINUE
        </button>
      </div>
    </div>
  )
}
