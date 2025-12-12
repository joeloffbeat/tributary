'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, ImageIcon, DollarSign, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { useAccount, ConnectButton } from '@/lib/web3'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { IPAsset } from '@/lib/types/story'
import type { IPCategory, CreateListingParams } from '../types'
import { StepSelectIP, StepSetPricing, StepReview } from '../components/create-listing'

type WizardStep = 1 | 2 | 3

const STEPS = [
  { id: 1, label: 'Select IP', icon: ImageIcon },
  { id: 2, label: 'Set Pricing', icon: DollarSign },
  { id: 3, label: 'Review', icon: FileCheck },
] as const

export default function CreateListingPage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)

  // Wizard state
  const [selectedIP, setSelectedIP] = useState<IPAsset | null>(null)
  const [listingParams, setListingParams] = useState<Partial<CreateListingParams>>({})

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <ImageIcon className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Create Listing</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Connect your wallet to create a new IP listing on the marketplace.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  const handleSelectIP = (ip: IPAsset) => {
    setSelectedIP(ip)
    setCurrentStep(2)
  }

  const handleSetPricing = (params: Partial<CreateListingParams>) => {
    setListingParams(params)
    setCurrentStep(3)
  }

  const handleSuccess = () => {
    router.push('/ipay')
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/ipay">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Create Listing</h1>
        <p className="text-muted-foreground">
          List your Story Protocol IP for pay-per-use licensing
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                  currentStep === step.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep > step.id
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  'ml-3 text-sm font-medium hidden sm:block',
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4',
                  currentStep > step.id ? 'bg-green-500' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && <StepSelectIP onSelect={handleSelectIP} />}
        {currentStep === 2 && selectedIP && (
          <StepSetPricing
            selectedIP={selectedIP}
            initialParams={listingParams}
            onSubmit={handleSetPricing}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && selectedIP && (
          <StepReview
            selectedIP={selectedIP}
            listingParams={listingParams as CreateListingParams}
            onSuccess={handleSuccess}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  )
}
