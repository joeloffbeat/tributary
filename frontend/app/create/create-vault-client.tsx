'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAccount, ConnectButton } from '@/lib/web3'
import { StepIndicator } from '@/components/create/step-indicator'
import { StepSelectIP } from '@/components/create/step-select-ip'
import { StepConfigureToken } from '@/components/create/step-configure-token'
import { StepConfigureEconomics } from '@/components/create/step-configure-economics'
import { StepReview } from '@/components/create/step-review'
import { useCreateVault, VaultFormData } from '@/hooks/use-create-vault'

export type { VaultFormData }

const STEPS = ['SELECT IP', 'TOKEN', 'ECONOMICS', 'REVIEW']

function CreateVaultContent() {
  const { isConnected } = useAccount()
  const searchParams = useSearchParams()
  const preselectedIP = searchParams.get('ip')

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<VaultFormData>>({
    storyIPId: preselectedIP || '',
    creatorAllocation: 3000, // 30% default
    dividendBps: 500,        // 5% default
    tradingFeeBps: 100,      // 1% default
    initialPrice: 1.0,
  })

  const { createVault, isCreating } = useCreateVault()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="font-title text-6xl mb-6">Create Vault</h1>
        <p className="font-body text-text-secondary mb-8">
          CONNECT YOUR WALLET TO CREATE A VAULT
        </p>
        <ConnectButton />
      </div>
    )
  }

  const updateFormData = (data: Partial<VaultFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleCreate = async () => {
    await createVault(formData as VaultFormData)
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-title text-6xl mb-4">Create Vault</h1>
        <p className="font-body text-text-secondary">
          TOKENIZE YOUR IP IN 4 SIMPLE STEPS
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={step} />

      {/* Step Content */}
      <div className="card-premium p-8 mt-8">
        {step === 1 && (
          <StepSelectIP
            data={formData}
            onUpdate={updateFormData}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepConfigureToken
            data={formData}
            onUpdate={updateFormData}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepConfigureEconomics
            data={formData}
            onUpdate={updateFormData}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <StepReview
            data={formData as VaultFormData}
            onBack={() => setStep(3)}
            onCreate={handleCreate}
            isCreating={isCreating}
          />
        )}
      </div>
    </div>
  )
}

export default function CreateVaultClient() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-6 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-16 bg-cream-dark rounded w-1/2 mx-auto mb-4" />
          <div className="h-8 bg-cream-dark rounded w-1/3 mx-auto" />
        </div>
      </div>
    }>
      <CreateVaultContent />
    </Suspense>
  )
}
