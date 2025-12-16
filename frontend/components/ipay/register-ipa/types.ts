import type { Address } from 'viem'
import { DEFAULT_SOURCE_CHAIN_ID } from '@/constants/ipay'
import { IP_TYPES, type IPType } from '@/constants/protocols/story'

// Registration form steps
export type RegistrationStep = 'upload' | 'metadata' | 'license' | 'review'

// License configuration for PIL terms
export type LicenseConfig = {
  commercialUse: boolean
  derivativesAllowed: boolean
  commercialAttribution: boolean
  derivativesAttribution: boolean
  derivativesReciprocal: boolean
  derivativesApproval: boolean
  commercialRevShare: number // 0-100 percentage
  mintingFee: string // Human-readable WIP amount
}

// IP Metadata for Story Protocol
export type IPMetadataInput = {
  title: string
  description: string
  category: IPType
  tags: string[]
  creatorName: string
}

// Submission step for multi-step progress UI
export type SubmissionStep =
  | 'idle'
  | 'uploading-ip-metadata'
  | 'uploading-nft-metadata'
  | 'preparing-transaction'
  | 'awaiting-signature'
  | 'broadcasting'
  | 'dispatched'
  | 'in-transit'
  | 'complete'
  | 'error'

// Submission step labels for UI (chain name is injected dynamically)
export const SUBMISSION_STEP_LABELS: Record<SubmissionStep, string> = {
  idle: 'Ready',
  'uploading-ip-metadata': 'Uploading IP metadata to IPFS...',
  'uploading-nft-metadata': 'Uploading NFT metadata to IPFS...',
  'preparing-transaction': 'Preparing cross-chain transaction...',
  'awaiting-signature': 'Please sign the transaction in your wallet...',
  broadcasting: 'Broadcasting transaction...',
  dispatched: 'Message dispatched!',
  'in-transit': 'Cross-chain message in transit...',
  complete: 'IP registered on Story Protocol!',
  error: 'Registration failed',
}

// Registration form state
export type RegistrationFormState = {
  // Step 1: Upload
  assetFile: File | null
  assetPreviewUrl: string | null
  assetIpfsHash: string | null

  // Step 2: Metadata
  metadata: IPMetadataInput

  // Step 3: License
  licenseConfig: LicenseConfig

  // Step 4: Review
  sourceChainId: number

  // Progress tracking
  currentStep: RegistrationStep
  isUploading: boolean
  isSubmitting: boolean
  submissionStep: SubmissionStep
  txHash: string | null
  error: string | null
}

// Default license configuration - Non-Commercial Remix
export const DEFAULT_LICENSE_CONFIG: LicenseConfig = {
  commercialUse: false,
  derivativesAllowed: true,
  commercialAttribution: true,
  derivativesAttribution: true,
  derivativesReciprocal: false,
  derivativesApproval: false,
  commercialRevShare: 0,
  mintingFee: '0',
}

// Default metadata
export const DEFAULT_METADATA: IPMetadataInput = {
  title: '',
  description: '',
  category: IP_TYPES[0], // 'Art'
  tags: [],
  creatorName: '',
}

// Initial form state
export const INITIAL_FORM_STATE: RegistrationFormState = {
  assetFile: null,
  assetPreviewUrl: null,
  assetIpfsHash: null,
  metadata: DEFAULT_METADATA,
  licenseConfig: DEFAULT_LICENSE_CONFIG,
  sourceChainId: DEFAULT_SOURCE_CHAIN_ID,
  currentStep: 'upload',
  isUploading: false,
  isSubmitting: false,
  submissionStep: 'idle',
  txHash: null,
  error: null,
}

// Steps configuration
export const REGISTRATION_STEPS: Array<{
  id: RegistrationStep
  title: string
  description: string
}> = [
  { id: 'upload', title: 'Upload Asset', description: 'Upload your IP asset to IPFS' },
  { id: 'metadata', title: 'IP Metadata', description: 'Add title, description, and details' },
  { id: 'license', title: 'License Terms', description: 'Configure PIL license terms' },
  { id: 'review', title: 'Review & Submit', description: 'Review and submit registration' },
]

// API request types
export type RegisterIPRequest = {
  sourceChainId: number
  creator: Address
  ipMetadataUri: string
  nftMetadataUri: string
  licenseTerms: {
    commercialUse: boolean
    commercialAttribution: boolean
    commercialRevShare: number
    derivativesAllowed: boolean
    derivativesAttribution: boolean
    derivativesApproval: boolean
    derivativesReciprocal: boolean
    defaultMintingFee: string
  }
}

export type RegisterIPResponse = {
  success: boolean
  messageId?: string
  txHash?: string
  error?: string
}
