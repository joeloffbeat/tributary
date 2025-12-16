// Story Protocol Constants
// Chain ID: 1315 (Aeneid Testnet)

import { Address } from 'viem'

// Contract addresses on Story Aeneid Testnet (Chain ID: 1315)
export const STORY_CONTRACTS = {
  // Core Protocol Contracts
  IP_ASSET_REGISTRY: '0x77319B4031e6eF1250907aa00018B8B1c67a244b' as Address,
  REGISTRATION_WORKFLOWS: '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424' as Address,
  LICENSE_REGISTRY: '0x529a750E02d8E2f15649c13D69a465286a780e24' as Address,
  LICENSING_MODULE: '0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f' as Address,
  PIL_TEMPLATE: '0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316' as Address,
  ROYALTY_MODULE: '0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086' as Address,
  ROYALTY_POLICY_LAP: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E' as Address,
  DISPUTE_MODULE: '0x3f03E6AD8B8B82017caB15f7D9e4D52b7aa25E63' as Address,

  // Tokens
  WIP_TOKEN: '0x1514000000000000000000000000000000000000' as Address, // Wrapped IP Token

  // SPG (Simple Programmable Governance) Contracts
  SPG_NFT_BEACON: '0xD2926B9ecaE85fF59B6FB0ff02f568a680c01218' as Address,
  DERIVATION_WORKFLOWS: '0x9e2d496f72C547C2C535B167e06ED8729B374a4f' as Address,
  LICENSE_ATTACHMENT_WORKFLOWS: '0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8' as Address,
  ROYALTY_WORKFLOWS: '0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890' as Address,
} as const

// Convenience export for commonly used addresses
export const WIP_TOKEN_ADDRESS = STORY_CONTRACTS.WIP_TOKEN

// Explorer URLs
export const STORY_EXPLORER = 'https://aeneid.explorer.story.foundation'
export const STORY_FAUCET = 'https://faucet.story.foundation'
export const STORY_DOCS = 'https://docs.story.foundation'

// API endpoints
export const STORY_API_BASE = 'https://api.story.foundation'
export const STORY_API_PROXY = '/api/story'

// Chain configuration
export const STORY_CHAIN_ID = 1315
export const STORY_CHAIN_NAME = 'Story Aeneid Testnet'
export const STORY_RPC_URL = 'https://aeneid.storyrpc.io'

// IP Types supported by Story Protocol
export const IP_TYPES = [
  'Art',
  'Character',
  'Music',
  'Video',
  'Book',
  'Patent',
  'Trademark',
  'Trade Secret',
  'Software',
  'Dataset',
  'Model',
  'Other',
] as const

export type IPType = (typeof IP_TYPES)[number]

// Dispute Tags for Story Protocol disputes
export const DISPUTE_TAGS = [
  {
    value: 'IMPROPER_REGISTRATION',
    label: 'Improper Registration',
    description: 'The IP was registered when it already exists or infringes on existing IP',
  },
  {
    value: 'IMPROPER_USAGE',
    label: 'Improper Usage',
    description: 'Violates PIL terms like territory restrictions or channel limitations',
  },
  {
    value: 'IMPROPER_PAYMENT',
    label: 'Improper Payment',
    description: 'Missing or incorrect royalty payments',
  },
  {
    value: 'CONTENT_STANDARDS_VIOLATION',
    label: 'Content Standards Violation',
    description: 'Violates content standards (No-Hate, No-Drugs, No-Pornography, etc.)',
  },
] as const

export type DisputeTag = (typeof DISPUTE_TAGS)[number]['value']

// Helper to get dispute tag by value
export function getDisputeTagInfo(value: string) {
  return DISPUTE_TAGS.find((tag) => tag.value === value)
}

// License type labels
export const LICENSE_TYPE_LABELS = {
  non_commercial: 'Non-Commercial Social Remix',
  commercial_use: 'Commercial Use',
  commercial_remix: 'Commercial Remix',
} as const

export type LicenseType = keyof typeof LICENSE_TYPE_LABELS
