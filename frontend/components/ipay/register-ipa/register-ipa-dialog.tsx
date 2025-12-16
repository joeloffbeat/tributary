'use client'

import { useCallback, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Upload,
  FileText,
  Send,
  Wallet,
  Radio,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react'
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
import {
  REGISTRATION_STEPS,
  SUBMISSION_STEP_LABELS,
  type SubmissionStep,
} from './types'
import { SELF_HOSTED_DEPLOYMENTS } from '@/constants/hyperlane/self-hosted'
import { isChainSupported } from '@/constants/ipay'

interface RegisterIPADialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// Submission steps configuration for progress UI
// Note: labels with {chain} will be replaced dynamically
const SUBMISSION_STEPS: Array<{
  id: SubmissionStep
  icon: typeof Upload
  label: string
  dynamicLabel?: (chainName: string) => string
}> = [
  { id: 'uploading-ip-metadata', icon: Upload, label: 'Upload IP Metadata' },
  { id: 'uploading-nft-metadata', icon: FileText, label: 'Upload NFT Metadata' },
  { id: 'preparing-transaction', icon: Send, label: 'Prepare Transaction' },
  { id: 'awaiting-signature', icon: Wallet, label: 'Sign Transaction' },
  { id: 'broadcasting', icon: Radio, label: 'Broadcasting Transaction' },
  {
    id: 'dispatched',
    icon: Check,
    label: 'Dispatched',
    dynamicLabel: (chainName) => `Dispatched from ${chainName}`,
  },
  { id: 'in-transit', icon: Clock, label: 'In Transit to Story' },
]

function getStepStatus(
  currentStep: SubmissionStep,
  stepId: SubmissionStep
): 'pending' | 'current' | 'completed' | 'error' {
  if (currentStep === 'error') return 'error'
  if (currentStep === 'complete') return 'completed'

  const currentIndex = SUBMISSION_STEPS.findIndex((s) => s.id === currentStep)
  const stepIndex = SUBMISSION_STEPS.findIndex((s) => s.id === stepId)

  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) return 'current'
  return 'pending'
}

function SubmissionProgress({
  submissionStep,
  txHash,
  sourceChainId,
  error,
}: {
  submissionStep: SubmissionStep
  txHash: string | null
  sourceChainId: number
  error: string | null
}) {
  const deployment = SELF_HOSTED_DEPLOYMENTS[sourceChainId]
  const explorerUrl = deployment?.explorerUrl
  const chainName = deployment?.displayName || `Chain ${sourceChainId}`

  if (submissionStep === 'idle') return null

  // Get dynamic label for current step
  const getCurrentStepLabel = () => {
    const step = SUBMISSION_STEPS.find((s) => s.id === submissionStep)
    if (step?.dynamicLabel) return step.dynamicLabel(chainName)
    return SUBMISSION_STEP_LABELS[submissionStep]
  }

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        {submissionStep === 'complete' ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Message Dispatched!</h3>
            <p className="text-sm text-muted-foreground">
              Your IP registration request has been sent to Story Protocol.
              The relayer will deliver it shortly.
            </p>
          </>
        ) : submissionStep === 'error' ? (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="text-lg font-semibold">Registration Failed</h3>
            <p className="text-sm text-destructive">{error}</p>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
            <h3 className="text-lg font-semibold">{getCurrentStepLabel()}</h3>
          </>
        )}
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        {SUBMISSION_STEPS.map((step) => {
          const status = getStepStatus(submissionStep, step.id)
          const Icon = step.icon
          const label = step.dynamicLabel ? step.dynamicLabel(chainName) : step.label

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                status === 'current' && 'bg-primary/10',
                status === 'completed' && 'bg-green-500/10',
                status === 'error' && 'bg-destructive/10',
                status === 'pending' && 'opacity-50'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  status === 'current' && 'bg-primary text-primary-foreground',
                  status === 'completed' && 'bg-green-500 text-white',
                  status === 'error' && 'bg-destructive text-destructive-foreground',
                  status === 'pending' && 'bg-muted text-muted-foreground'
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : status === 'current' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === 'error' ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  status === 'current' && 'text-primary',
                  status === 'completed' && 'text-green-600',
                  status === 'error' && 'text-destructive'
                )}
              >
                {label}
              </span>
            </div>
          )
        })}

        {/* Final step: Registered on Story (shown when complete) */}
        {submissionStep === 'complete' && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 text-white">
              <Check className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-green-600">
              Registered on Story Protocol
            </span>
          </div>
        )}
      </div>

      {/* Transaction Hash */}
      {txHash && explorerUrl && (
        <div className="pt-4 border-t">
          <a
            href={`${explorerUrl}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            View Transaction on {chainName}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  )
}

export function RegisterIPADialog({
  open,
  onOpenChange,
}: RegisterIPADialogProps) {
  const form = useRegisterIPA()

  const progress = useMemo(() => {
    return ((form.currentStepIndex + 1) / REGISTRATION_STEPS.length) * 100
  }, [form.currentStepIndex])

  const handleClose = useCallback(() => {
    // Don't allow closing during submission (except on error/complete)
    if (
      form.isSubmitting &&
      form.submissionStep !== 'error' &&
      form.submissionStep !== 'complete'
    ) {
      return
    }
    form.reset()
    onOpenChange(false)
  }, [form, onOpenChange])

  const handleSubmit = useCallback(async () => {
    await form.submitRegistration()
  }, [form])

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
    if (form.currentStep === 'upload' && !form.assetIpfsHash) return true
    // On review step, also check if chain is supported
    if (form.currentStep === 'review') {
      const chainId = form.connectedChainId ?? 0
      const chainSupported = isChainSupported(chainId) && !!SELF_HOSTED_DEPLOYMENTS[chainId]
      if (!chainSupported) return true
    }
    return false
  }, [form])

  // Show submission progress when submitting
  const showSubmissionProgress =
    form.isSubmitting ||
    form.submissionStep === 'complete' ||
    form.submissionStep === 'error'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showSubmissionProgress ? 'Registering IP Asset' : 'Register IP Asset'}
          </DialogTitle>
          <DialogDescription>
            {showSubmissionProgress
              ? 'Please wait while your IP is being registered on Story Protocol'
              : 'Register your intellectual property on Story Protocol via cross-chain messaging'}
          </DialogDescription>
        </DialogHeader>

        {showSubmissionProgress ? (
          <SubmissionProgress
            submissionStep={form.submissionStep}
            txHash={form.txHash}
            sourceChainId={form.connectedChainId ?? form.sourceChainId}
            error={form.error}
          />
        ) : (
          <>
            {/* Progress */}
            <div className="space-y-3">
              <Progress value={progress} className="h-1" />
              <div className="flex justify-between">
                {REGISTRATION_STEPS.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => {
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
                <Button onClick={handleSubmit} disabled={isNextDisabled}>
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
                <Button onClick={form.goNext} disabled={isNextDisabled}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </>
        )}

        {/* Close/Done Button when complete or error */}
        {(form.submissionStep === 'complete' ||
          form.submissionStep === 'error') && (
          <div className="flex justify-center pt-4 border-t">
            <Button onClick={handleClose} variant="outline">
              {form.submissionStep === 'complete' ? 'Done' : 'Close'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
