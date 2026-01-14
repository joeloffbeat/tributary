'use client'

import { Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import type { VaultFormData } from '../types'

interface SubmissionProgressProps {
  submissionStep: VaultFormData['submissionStep']
  txHash: string | null
  error: string | null
}

const STEPS = [
  { id: 'creating-vault', label: 'Preparing vault creation' },
  { id: 'awaiting-signature', label: 'Waiting for signature' },
  { id: 'confirming', label: 'Confirming transaction' },
]

export function SubmissionProgress({ submissionStep, txHash, error }: SubmissionProgressProps) {
  if (submissionStep === 'idle') return null

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        {submissionStep === 'complete' ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-100">Vault Created!</h3>
            <p className="text-sm text-slate-400">Your royalty vault is now live and ready to receive royalties.</p>
          </>
        ) : submissionStep === 'error' ? (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-100">Creation Failed</h3>
            <p className="text-sm text-red-400">{error}</p>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 text-tributary-500 mx-auto animate-spin" />
            <h3 className="text-lg font-semibold text-slate-100">Creating Vault...</h3>
          </>
        )}
      </div>

      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const stepIndex = STEPS.findIndex(s => s.id === submissionStep)
          const isComplete = stepIndex > index || submissionStep === 'complete'
          const isCurrent = step.id === submissionStep

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCurrent ? 'bg-tributary-500/10' : isComplete ? 'bg-green-500/10' : 'bg-river-800/50 opacity-50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isComplete ? 'bg-green-500' : isCurrent ? 'bg-tributary-500' : 'bg-slate-700'
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <span className="text-xs text-slate-400">{index + 1}</span>
                )}
              </div>
              <span className={`text-sm ${isCurrent ? 'text-tributary-400' : isComplete ? 'text-green-400' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {txHash && (
        <a
          href={`https://explorer.mantle.xyz/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-tributary-400 hover:underline"
        >
          View transaction
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  )
}
