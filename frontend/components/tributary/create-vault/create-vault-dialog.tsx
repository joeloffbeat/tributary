'use client'

import { useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Check, Vault } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useCreateVault } from './hooks/use-create-vault'
import { StepIPSelection } from './steps/step-ip-selection'
import { StepTokenConfig } from './steps/step-token-config'
import { StepSaleConfig } from './steps/step-sale-config'
import { StepReview } from './steps/step-review'
import { SubmissionProgress } from './components/submission-progress'
import { VAULT_CREATION_STEPS } from './types'

interface CreateVaultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateVaultDialog({ open, onOpenChange, onSuccess }: CreateVaultDialogProps) {
  const form = useCreateVault()

  const progress = useMemo(() => ((form.currentStepIndex + 1) / VAULT_CREATION_STEPS.length) * 100, [form.currentStepIndex])

  const handleClose = useCallback(() => {
    if (form.formData.isSubmitting && form.formData.submissionStep !== 'error' && form.formData.submissionStep !== 'complete') return
    if (form.formData.submissionStep === 'complete' && onSuccess) onSuccess()
    form.reset()
    onOpenChange(false)
  }, [form, onOpenChange, onSuccess])

  const handleSubmit = useCallback(async () => { await form.submitVault() }, [form])

  const renderStepContent = () => {
    switch (form.currentStep) {
      case 'ip-selection': return <StepIPSelection form={form} />
      case 'token-config': return <StepTokenConfig form={form} />
      case 'sale-config': return <StepSaleConfig form={form} />
      case 'review': return <StepReview form={form} />
      default: return null
    }
  }

  const showSubmissionProgress = form.formData.isSubmitting || form.formData.submissionStep === 'complete' || form.formData.submissionStep === 'error'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-river-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <Vault className="h-5 w-5 text-tributary-500" />
            {showSubmissionProgress ? 'Creating Vault' : 'Create Royalty Vault'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {showSubmissionProgress ? 'Please wait while your vault is being created' : 'Tokenize royalties from your intellectual property'}
          </DialogDescription>
        </DialogHeader>

        {showSubmissionProgress ? (
          <SubmissionProgress submissionStep={form.formData.submissionStep} txHash={form.formData.txHash} error={form.formData.error} />
        ) : (
          <>
            <div className="space-y-3">
              <Progress value={progress} className="h-1 bg-river-800 [&>div]:bg-tributary-500" />
              <div className="flex justify-between">
                {VAULT_CREATION_STEPS.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => index < form.currentStepIndex && form.goToStep(step.id)}
                    disabled={index > form.currentStepIndex}
                    className={cn('flex flex-col items-center gap-1 group', index <= form.currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed opacity-50')}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      index < form.currentStepIndex && 'bg-tributary-500 text-white',
                      index === form.currentStepIndex && 'bg-tributary-500 text-white',
                      index > form.currentStepIndex && 'bg-river-800 text-slate-500'
                    )}>
                      {index < form.currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className={cn('text-xs hidden sm:block', index === form.currentStepIndex ? 'font-medium text-slate-100' : 'text-slate-500')}>
                      {step.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[350px] py-4">{renderStepContent()}</div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <Button variant="outline" onClick={form.goBack} disabled={!form.canGoBack} className="border-slate-700 hover:bg-river-800">
                <ChevronLeft className="h-4 w-4 mr-1" />Back
              </Button>
              {form.isLastStep ? (
                <Button onClick={handleSubmit} disabled={!form.isCurrentStepValid} className="bg-tributary-500 hover:bg-tributary-600">
                  <Vault className="h-4 w-4 mr-2" />Create Vault
                </Button>
              ) : (
                <Button onClick={form.goNext} disabled={!form.isCurrentStepValid} className="bg-tributary-500 hover:bg-tributary-600">
                  Next<ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </>
        )}

        {(form.formData.submissionStep === 'complete' || form.formData.submissionStep === 'error') && (
          <div className="flex justify-center pt-4 border-t border-slate-700">
            <Button onClick={handleClose} variant="outline" className="border-slate-700">
              {form.formData.submissionStep === 'complete' ? 'Done' : 'Close'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
