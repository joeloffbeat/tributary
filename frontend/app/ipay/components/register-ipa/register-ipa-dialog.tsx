'use client'

import { useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useRegisterIPA } from './hooks/use-register-ipa'
import { StepUploadAsset } from './steps/step-upload-asset'
import { StepIPMetadata } from './steps/step-ip-metadata'
import { StepLicenseTerms } from './steps/step-license-terms'
import { StepReview } from './steps/step-review'
import { REGISTRATION_STEPS } from './types'

interface RegisterIPADialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RegisterIPADialog({
  open,
  onOpenChange,
  onSuccess,
}: RegisterIPADialogProps) {
  const form = useRegisterIPA()

  const progress = useMemo(() => {
    return ((form.currentStepIndex + 1) / REGISTRATION_STEPS.length) * 100
  }, [form.currentStepIndex])

  const handleClose = useCallback(() => {
    form.reset()
    onOpenChange(false)
  }, [form, onOpenChange])

  const handleSubmit = useCallback(async () => {
    const success = await form.submitRegistration()
    if (success) {
      handleClose()
      onSuccess?.()
    }
  }, [form, handleClose, onSuccess])

  // Render step content
  const renderStepContent = () => {
    switch (form.currentStep) {
      case 'upload':
        return <StepUploadAsset form={form} />
      case 'metadata':
        return <StepIPMetadata form={form} />
      case 'license':
        return <StepLicenseTerms form={form} />
      case 'review':
        return <StepReview form={form} />
      default:
        return null
    }
  }

  // Determine if next button should be disabled
  const isNextDisabled = useMemo(() => {
    if (form.isUploading || form.isSubmitting) return true
    if (!form.isCurrentStepValid) return true
    // For upload step, require IPFS upload to be complete
    if (form.currentStep === 'upload' && !form.assetIpfsHash) return true
    return false
  }, [form])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register IP Asset</DialogTitle>
          <DialogDescription>
            Register your intellectual property on Story Protocol via cross-chain messaging
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-3">
          <Progress value={progress} className="h-1" />
          <div className="flex justify-between">
            {REGISTRATION_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => {
                  // Allow navigating to completed steps
                  if (index < form.currentStepIndex) {
                    form.goToStep(step.id)
                  }
                }}
                disabled={index > form.currentStepIndex}
                className={cn(
                  'flex flex-col items-center gap-1 group',
                  index <= form.currentStepIndex
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-50'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    'transition-colors',
                    index < form.currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : index === form.currentStepIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index < form.currentStepIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs hidden sm:block',
                    index === form.currentStepIndex
                      ? 'font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] py-4">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={form.goBack}
            disabled={!form.canGoBack || form.isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {form.isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={isNextDisabled}
            >
              {form.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Register IP
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={form.goNext}
              disabled={isNextDisabled}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
