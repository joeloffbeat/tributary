# Prompt 14: Create Vault Page

## Objective
Create the vault creation flow as a dedicated page with step-by-step wizard.

## Economics Reminder
- **Fixed Supply**: 10,000 tokens for ALL vaults
- **Dividend %**: Creator sets (0-100%) - portion of profits to holders
- **Trade Fee %**: Creator sets (0-5%) - fee on each trade

## Requirements

### Create Vault Page
File: `frontend/app/create/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAccount, ConnectButton } from '@/lib/web3'
import { StepIndicator } from '@/components/create/step-indicator'
import { StepSelectIP } from '@/components/create/step-select-ip'
import { StepConfigureToken } from '@/components/create/step-configure-token'
import { StepConfigureEconomics } from '@/components/create/step-configure-economics'
import { StepReview } from '@/components/create/step-review'
import { useCreateVault } from '@/hooks/use-create-vault'

export interface VaultFormData {
  // Step 1: IP Selection
  storyIPId: string
  ipName: string

  // Step 2: Token Config
  tokenName: string
  tokenSymbol: string
  creatorAllocation: number // Out of 10,000

  // Step 3: Economics
  dividendBps: number      // Basis points (500 = 5%)
  tradingFeeBps: number    // Basis points (100 = 1%)
  initialPrice: number     // USD per token
}

const STEPS = ['SELECT IP', 'TOKEN', 'ECONOMICS', 'REVIEW']

export default function CreateVaultPage() {
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
      <div className="card p-8 mt-8">
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
```

### Step Indicator
File: `frontend/components/create/step-indicator.tsx`

```tsx
'use client'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isComplete = stepNumber < currentStep

        return (
          <div key={step} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-stat text-sm ${
                  isActive
                    ? 'bg-primary text-white'
                    : isComplete
                    ? 'bg-primary/20 text-primary'
                    : 'bg-cream-dark text-text-muted'
                }`}
              >
                {isComplete ? '✓' : stepNumber}
              </div>
              <p className={`font-body text-xs mt-2 ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`}>
                {step}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 mx-2 ${
                  isComplete ? 'bg-primary' : 'bg-cream-dark'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

### Step 1: Select IP
File: `frontend/components/create/step-select-ip.tsx`

```tsx
'use client'

import { useAccount } from '@/lib/web3'
import { useUserIPs } from '@/hooks/use-user-ips'
import { VaultFormData } from '@/app/create/page'

interface StepSelectIPProps {
  data: Partial<VaultFormData>
  onUpdate: (data: Partial<VaultFormData>) => void
  onNext: () => void
}

export function StepSelectIP({ data, onUpdate, onNext }: StepSelectIPProps) {
  const { address } = useAccount()
  const { data: ips, isLoading } = useUserIPs(address!)

  const availableIPs = ips?.filter((ip) => !ip.hasVault) || []

  const handleSelect = (ip: any) => {
    onUpdate({
      storyIPId: ip.id,
      ipName: ip.name,
      tokenName: `${ip.name} Token`,
      tokenSymbol: ip.name.slice(0, 4).toUpperCase(),
    })
  }

  return (
    <div>
      <h2 className="font-title text-3xl mb-2">Select Your IP</h2>
      <p className="font-body text-sm text-text-secondary mb-6">
        CHOOSE WHICH INTELLECTUAL PROPERTY TO TOKENIZE
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-cream-dark rounded animate-pulse" />
          ))}
        </div>
      ) : availableIPs.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-body text-text-secondary mb-4">
            NO AVAILABLE IPS FOUND
          </p>
          <a
            href="https://app.story.foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            REGISTER IP ON STORY →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {availableIPs.map((ip) => (
            <button
              key={ip.id}
              onClick={() => handleSelect(ip)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                data.storyIPId === ip.id
                  ? 'border-primary bg-primary/5'
                  : 'border-cream-dark hover:border-primary/50'
              }`}
            >
              <p className="font-title text-xl">{ip.name}</p>
              <p className="font-body text-xs text-text-muted">{ip.type}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!data.storyIPId}
          className="btn-primary disabled:opacity-50"
        >
          CONTINUE
        </button>
      </div>
    </div>
  )
}
```

### Step 2: Configure Token
File: `frontend/components/create/step-configure-token.tsx`

```tsx
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
            className="input w-full"
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
            className="input w-full"
          />
        </div>

        {/* Fixed Supply */}
        <div>
          <label className="font-body text-xs text-text-muted block mb-2">
            TOTAL SUPPLY (FIXED)
          </label>
          <div className="input w-full bg-cream-dark/50 cursor-not-allowed">
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
            className="w-full accent-primary"
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
```

### Step 3: Configure Economics
File: `frontend/components/create/step-configure-economics.tsx`

```tsx
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
            className="w-full accent-primary"
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
            className="w-full accent-primary"
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
              className="input w-full pl-8"
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
```

### Step 4: Review
File: `frontend/components/create/step-review.tsx`

```tsx
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
      <p className="font-body text-xs text-primary mb-3">{title}</p>
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
```

### Create Vault Hook
File: `frontend/hooks/use-create-vault.ts`

```typescript
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletClient, usePublicClient } from '@/lib/web3'
import { parseUnits } from 'viem'
import { CONTRACTS } from '@/constants/contracts'
import { RoyaltyVaultFactoryABI } from '@/constants/abis'
import { VaultFormData } from '@/app/create/page'

export function useCreateVault() {
  const router = useRouter()
  const walletClient = useWalletClient()
  const publicClient = usePublicClient()
  const [isCreating, setIsCreating] = useState(false)

  const createVault = async (data: VaultFormData) => {
    if (!walletClient) return

    setIsCreating(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.FACTORY,
        abi: RoyaltyVaultFactoryABI,
        functionName: 'createVault',
        args: [{
          storyIPId: data.storyIPId as `0x${string}`,
          tokenName: data.tokenName,
          tokenSymbol: data.tokenSymbol,
          creatorAllocation: BigInt(data.creatorAllocation) * BigInt(10 ** 18) / BigInt(100),
          dividendBps: BigInt(data.dividendBps),
          tradingFeeBps: BigInt(data.tradingFeeBps),
          paymentToken: CONTRACTS.MOCK_USDT,
        }],
      })

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      // Get vault address from event
      // TODO: Parse VaultCreated event

      router.push('/profile')
    } catch (error) {
      console.error('Failed to create vault:', error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  return { createVault, isCreating }
}
```

## Verification
- [ ] Step wizard flows correctly
- [ ] IP selection shows Story Protocol IPs
- [ ] Token config enforces fixed 10K supply
- [ ] Economics sliders work correctly
- [ ] Review shows all data
- [ ] Vault creation transaction succeeds
- [ ] Redirects to profile after creation

## Files to Create
- `frontend/app/create/page.tsx`
- `frontend/components/create/step-indicator.tsx`
- `frontend/components/create/step-select-ip.tsx`
- `frontend/components/create/step-configure-token.tsx`
- `frontend/components/create/step-configure-economics.tsx`
- `frontend/components/create/step-review.tsx`
- `frontend/hooks/use-create-vault.ts`
