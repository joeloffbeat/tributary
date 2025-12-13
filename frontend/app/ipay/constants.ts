import type { Address } from 'viem'
import type { IPCategory } from './types'

// Supported chains for IPay
export const IPAY_CHAINS = {
  STORY_AENEID: 1315,
  AVALANCHE_FUJI: 43113,
} as const

// Hyperlane domain IDs
export const HYPERLANE_DOMAINS = {
  STORY_AENEID: 1315,
  AVALANCHE_FUJI: 43113,
} as const

// Contract addresses - Avalanche Fuji
export const IPAY_REGISTRY_ADDRESS = '0x883172EDFF24FE83FDE776f7A9Aaa59CCe5ABA2B' as Address
export const LICENSE_MARKETPLACE_ADDRESS = '0x4D3ADE52F597e5F09F4dB6c9138fCcF5DB55b8A8' as Address
export const USDC_FUJI_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65' as Address
export const AVALANCHE_FUJI_MAILBOX = '0x60c3ca08D3df3F5fA583c535D9E44F3629F52452' as Address

// Contract addresses - Story Aeneid
export const IPAY_RECEIVER_ADDRESS = '0xe4c7f7d38C2F6a3f7ac61821C70BB7D18CdCECFE' as Address
export const STORY_MAILBOX_ADDRESS = '0x6feB4f3eeD23D6cdDa54ec67d5d649BE015f782d' as Address
export const STORY_WIP_TOKEN = '0x1514000000000000000000000000000000000000' as Address
export const STORY_USDC_BRIDGED = '0x33641e15d8f590161a47Fe696cF3C819d5636e71' as Address

// Story Protocol module addresses
export const STORY_ROYALTY_MODULE = '0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086' as Address
export const STORY_LICENSING_MODULE = '0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f' as Address
export const STORY_PIL_TEMPLATE = '0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316' as Address
export const STORY_IP_REGISTRY = '0x77319B4031e6eF1250907aa00018B8B1c67a244b' as Address
export const STORY_DISPUTE_MODULE = '0x3F03e6aD8B8B82017cAb15f7d9e4d52b7aA25e63' as Address
export const STORY_LICENSE_TOKEN = '0xfE3838BFb30b34170F00030b52efa71999C4ec3B' as Address

// Operation types for IPayReceiver
export const IPAY_OPERATIONS = {
  MINT_LICENSE: 1,
  CREATE_DERIVATIVE: 2,
  REGISTER_IP: 3,
  TRANSFER_LICENSE: 4,
  RAISE_DISPUTE: 5,
} as const

// Dispute tags
export const DISPUTE_TAGS = {
  IMPROPER_REGISTRATION: 'IMPROPER_REGISTRATION',
  IMPROPER_USAGE: 'IMPROPER_USAGE',
  IMPROPER_PAYMENT: 'IMPROPER_PAYMENT',
  CONTENT_STANDARDS_VIOLATION: 'CONTENT_STANDARDS_VIOLATION',
} as const

export type DisputeTag = keyof typeof DISPUTE_TAGS

// IPayReceiver configuration
export const IPAY_RECEIVER_CONFIG = {
  // Exchange rate: 1 USDC = 10 WIP (with 18 decimals)
  USDC_TO_WIP_RATE: BigInt('10000000000000000000'), // 10e18
  // Default license terms ID for PIL license
  DEFAULT_LICENSE_TERMS_ID: 1n,
} as const

// Price constraints (in USDC, human-readable)
export const MIN_PRICE_USDC = '0.01'
export const MAX_PRICE_USDC = '10000'

// USDC decimals
export const USDC_DECIMALS = 6

// LocalStorage keys
export const STORAGE_KEYS = {
  PAYMENT_HISTORY: 'ipay-payment-history',
  CREATOR_LISTINGS: 'ipay-creator-listings',
} as const

// IP Categories with labels and icons
export const IP_CATEGORIES: Array<{
  value: IPCategory
  label: string
  icon: string
  description: string
}> = [
  { value: 'images', label: 'Images', icon: '🖼️', description: 'Photos, illustrations, graphics' },
  { value: 'music', label: 'Music', icon: '🎵', description: 'Songs, beats, sound effects' },
  { value: 'code', label: 'Code', icon: '💻', description: 'Software, scripts, algorithms' },
  { value: 'data', label: 'Data', icon: '📊', description: 'Datasets, research, analytics' },
  { value: 'templates', label: 'Templates', icon: '📄', description: 'Documents, designs, frameworks' },
  { value: 'other', label: 'Other', icon: '📦', description: 'Other intellectual property' },
] as const

// Helper to get category info
export function getCategoryInfo(value: IPCategory) {
  return IP_CATEGORIES.find((cat) => cat.value === value)
}

// IPay Registry ABI
export const IPAY_REGISTRY_ABI = [
  {
    name: 'createListing',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'storyIPId', type: 'address' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'pricePerUse', type: 'uint256' },
      { name: 'assetIpfsHash', type: 'string' },
      { name: 'metadataUri', type: 'string' },
    ],
    outputs: [{ name: 'listingId', type: 'uint256' }],
  },
  {
    name: 'recordUsage',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'listingId', type: 'uint256' },
      { name: 'user', type: 'address' },
      { name: 'paymentTxHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'listings',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'storyIPId', type: 'address' },
      { name: 'creator', type: 'address' },
      { name: 'title', type: 'string' },
      { name: 'pricePerUse', type: 'uint256' },
      { name: 'totalUses', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
    ],
  },
  {
    name: 'getListingsByCreator',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ name: 'listingIds', type: 'uint256[]' }],
  },
  {
    name: 'deactivateListing',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'updatePrice',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'listingId', type: 'uint256' },
      { name: 'newPrice', type: 'uint256' },
    ],
    outputs: [],
  },
] as const

// ERC20 ABI for USDC interactions (approve, allowance, balanceOf, transfer)
export const ERC20_ABI = [
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
] as const

// LicenseMarketplace ABI for license token trading
export const LICENSE_MARKETPLACE_ABI = [
  { name: 'createListing', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'licenseTokenId', type: 'uint256' }, { name: 'price', type: 'uint256' }], outputs: [{ name: 'listingId', type: 'uint256' }] },
  { name: 'purchaseListing', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'listingId', type: 'uint256' }], outputs: [] },
  { name: 'cancelListing', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'listingId', type: 'uint256' }], outputs: [] },
  { name: 'updatePrice', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'listingId', type: 'uint256' }, { name: 'newPrice', type: 'uint256' }], outputs: [] },
  { name: 'listings', type: 'function', stateMutability: 'view', inputs: [{ name: 'listingId', type: 'uint256' }], outputs: [{ name: 'seller', type: 'address' }, { name: 'licenseTokenId', type: 'uint256' }, { name: 'price', type: 'uint256' }, { name: 'isActive', type: 'bool' }] },
  { name: 'listingCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'platformFee', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
] as const
