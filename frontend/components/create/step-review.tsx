'use client'

import { VaultFormData } from '@/app/create/page'
import { Loader2 } from 'lucide-react'

interface StepReviewProps {
  data: VaultFormData
  onBack: () => void
  onCreate: () => void
  isCreating: boolean
}

export function StepReview({ data, onBack, onCreate, isCreating }: StepReviewProps) {
  return (
    <div>
      <h2 className="font-title text-3xl mb-2">Review & Create</h2>
      <p className="font-body text-sm text-text-secondary mb-6">
        CONFIRM YOUR VAULT CONFIGURATION
      </p>

      <div className="space-y-6">
        {/* IP Info */}
        <ReviewSection title="INTELLECTUAL PROPERTY">
          <ReviewRow label="IP NAME" value={data.ipName} />
        </ReviewSection>

        {/* Token Info */}
        <ReviewSection title="TOKEN">
          <ReviewRow label="NAME" value={data.tokenName} />
          <ReviewRow label="SYMBOL" value={data.tokenSymbol} />
          <ReviewRow label="TOTAL SUPPLY" value="10,000" />
          <ReviewRow label="YOUR ALLOCATION" value={`${(data.creatorAllocation / 100).toFixed(0)}% (${data.creatorAllocation.toLocaleString()} tokens)`} />
          <ReviewRow label="FOR SALE" value={`${((10000 - data.creatorAllocation) / 100).toFixed(0)}% (${(10000 - data.creatorAllocation).toLocaleString()} tokens)`} />
        </ReviewSection>

        {/* Economics */}
        <ReviewSection title="ECONOMICS">
          <ReviewRow label="DIVIDEND RATE" value={`${(data.dividendBps / 100).toFixed(1)}%`} />
          <ReviewRow label="TRADING FEE" value={`${(data.tradingFeeBps / 100).toFixed(1)}%`} />
          <ReviewRow label="INITIAL PRICE" value={`$${data.initialPrice.toFixed(2)}`} />
          <ReviewRow label="MARKET CAP" value={`$${(data.initialPrice * 10000).toLocaleString()}`} />
        </ReviewSection>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="btn-secondary" disabled={isCreating}>
          BACK
        </button>
        <button
          onClick={onCreate}
          disabled={isCreating}
          className="btn-primary flex items-center gap-2"
        >
          {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
          {isCreating ? 'CREATING...' : 'CREATE VAULT'}
        </button>
      </div>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-cream-light rounded-lg p-4">
      <p className="font-body text-xs text-tributary mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-body text-xs text-text-muted">{label}</span>
      <span className="font-stat text-sm">{value}</span>
    </div>
  )
}
