import { Address, Hex } from 'viem'

// Vault creation steps
export const VAULT_CREATION_STEPS = [
  { id: 'ip-selection', title: 'Select IP' },
  { id: 'token-config', title: 'Token Setup' },
  { id: 'sale-config', title: 'Sale Terms' },
  { id: 'review', title: 'Review' },
] as const

export type VaultCreationStep = typeof VAULT_CREATION_STEPS[number]['id']

// IP Asset from Story Protocol subgraph
export interface StoryIPAsset {
  id: Address
  tokenId: string
  tokenUri: string
  metadata?: {
    name: string
    description?: string
    image?: string
    mediaType?: string
  }
  registeredAt: string
  owner: Address
}

// Form data for vault creation
export interface VaultFormData {
  // Step 1: IP Selection
  selectedIP: StoryIPAsset | null

  // Step 2: Token Config
  tokenName: string
  tokenSymbol: string
  totalSupply: string
  creatorAllocation: string // percentage (0-100)

  // Step 3: Sale Config
  saleEnabled: boolean
  pricePerToken: string
  saleCap: string // max tokens for sale
  startTime?: Date
  endTime?: Date

  // Submission state
  isSubmitting: boolean
  submissionStep: 'idle' | 'creating-vault' | 'awaiting-signature' | 'confirming' | 'complete' | 'error'
  txHash: string | null
  error: string | null
}

export interface UseCreateVaultReturn {
  // Form data
  formData: VaultFormData

  // Step navigation
  currentStep: VaultCreationStep
  currentStepIndex: number
  goNext: () => void
  goBack: () => void
  goToStep: (step: VaultCreationStep) => void
  canGoBack: boolean
  isLastStep: boolean

  // Validation
  isCurrentStepValid: boolean

  // IP Selection
  setSelectedIP: (ip: StoryIPAsset | null) => void
  isLoadingIPs: boolean
  userIPAssets: StoryIPAsset[]
  ipAlreadyHasVault: boolean

  // Token Config
  updateTokenConfig: (field: keyof VaultFormData, value: string) => void

  // Sale Config
  updateSaleConfig: (field: keyof VaultFormData, value: unknown) => void

  // Submission
  submitVault: () => Promise<void>
  reset: () => void
}
