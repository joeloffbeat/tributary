import type { Address } from 'viem'
import type { IPCategory } from './types'

// Supported chains for IPay
export const IPAY_CHAINS = {
  STORY_AENEID: 1315,
  AVALANCHE_FUJI: 43113,
} as const

// Contract addresses
export const IPAY_REGISTRY_ADDRESS = '0x883172EDFF24FE83FDE776f7A9Aaa59CCe5ABA2B' as Address
export const USDC_FUJI_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65' as Address

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
