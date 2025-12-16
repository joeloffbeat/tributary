// =============================================================================
// iPay Operation Types
// =============================================================================
// Operation type constants matching the IPayReceiver contract
// Each operation corresponds to a specific Story Protocol action
// =============================================================================

import type { IPayOperationType, IPayOperationName } from './types'

// =============================================================================
// Operation Type Constants
// =============================================================================

/** Mint a license token for an IP asset */
export const OP_MINT_LICENSE = 1 as const

/** Create a derivative IP from parent */
export const OP_CREATE_DERIVATIVE = 2 as const

/** Register a new IP asset */
export const OP_REGISTER_IP = 3 as const

/** Transfer a license token */
export const OP_TRANSFER_LICENSE = 4 as const

/** Raise a dispute against an IP */
export const OP_RAISE_DISPUTE = 5 as const

/** Create a new listing (marketplace operation) */
export const OP_CREATE_LISTING = 6 as const

/** Update an existing listing */
export const OP_UPDATE_LISTING = 7 as const

/** Deactivate a listing */
export const OP_DEACTIVATE_LISTING = 8 as const

/** Mint NFT, register as IP, and attach license terms */
export const OP_MINT_AND_REGISTER_IP = 9 as const

/** Create a new SPG NFT collection for a creator */
export const OP_CREATE_COLLECTION = 10 as const

/** List a license token for sale */
export const OP_LIST_LICENSE_TOKEN = 11 as const

/** Purchase a listed license token */
export const OP_PURCHASE_LICENSE_LISTING = 12 as const

/** Mint a license token with default minting fee */
export const OP_MINT_LICENSE_WITH_FEE = 13 as const

/** Create derivative using owned license tokens */
export const OP_CREATE_DERIVATIVE_WITH_LICENSE = 14 as const

// =============================================================================
// Operation Types Object
// =============================================================================

/** All operation types mapped by name */
export const IPAY_OPERATION_TYPES = {
  MINT_LICENSE: OP_MINT_LICENSE,
  CREATE_DERIVATIVE: OP_CREATE_DERIVATIVE,
  REGISTER_IP: OP_REGISTER_IP,
  TRANSFER_LICENSE: OP_TRANSFER_LICENSE,
  RAISE_DISPUTE: OP_RAISE_DISPUTE,
  CREATE_LISTING: OP_CREATE_LISTING,
  UPDATE_LISTING: OP_UPDATE_LISTING,
  DEACTIVATE_LISTING: OP_DEACTIVATE_LISTING,
  MINT_AND_REGISTER_IP: OP_MINT_AND_REGISTER_IP,
  CREATE_COLLECTION: OP_CREATE_COLLECTION,
  LIST_LICENSE_TOKEN: OP_LIST_LICENSE_TOKEN,
  PURCHASE_LICENSE_LISTING: OP_PURCHASE_LICENSE_LISTING,
  MINT_LICENSE_WITH_FEE: OP_MINT_LICENSE_WITH_FEE,
  CREATE_DERIVATIVE_WITH_LICENSE: OP_CREATE_DERIVATIVE_WITH_LICENSE,
} as const

// =============================================================================
// Operation Labels (for UI display)
// =============================================================================

/** Human-readable labels for each operation type */
export const IPAY_OPERATION_LABELS: Record<IPayOperationType, string> = {
  [OP_MINT_LICENSE]: 'Mint License',
  [OP_CREATE_DERIVATIVE]: 'Create Derivative',
  [OP_REGISTER_IP]: 'Register IP',
  [OP_TRANSFER_LICENSE]: 'Transfer License',
  [OP_RAISE_DISPUTE]: 'Raise Dispute',
  [OP_CREATE_LISTING]: 'Create Listing',
  [OP_UPDATE_LISTING]: 'Update Listing',
  [OP_DEACTIVATE_LISTING]: 'Deactivate Listing',
  [OP_MINT_AND_REGISTER_IP]: 'Mint & Register IP',
  [OP_CREATE_COLLECTION]: 'Create Collection',
  [OP_LIST_LICENSE_TOKEN]: 'List License Token',
  [OP_PURCHASE_LICENSE_LISTING]: 'Purchase License',
  [OP_MINT_LICENSE_WITH_FEE]: 'Mint License (Fee)',
  [OP_CREATE_DERIVATIVE_WITH_LICENSE]: 'Create Derivative',
}

/** Descriptions for each operation type */
export const IPAY_OPERATION_DESCRIPTIONS: Record<IPayOperationType, string> = {
  [OP_MINT_LICENSE]: 'Mint a license token for an existing IP asset',
  [OP_CREATE_DERIVATIVE]: 'Create a derivative work from a licensed IP',
  [OP_REGISTER_IP]: 'Register a new intellectual property asset',
  [OP_TRANSFER_LICENSE]: 'Transfer a license token to another address',
  [OP_RAISE_DISPUTE]: 'Raise a dispute against an IP for infringement',
  [OP_CREATE_LISTING]: 'List an IP license for sale on the marketplace',
  [OP_UPDATE_LISTING]: 'Update the price or details of a listing',
  [OP_DEACTIVATE_LISTING]: 'Remove a listing from the marketplace',
  [OP_MINT_AND_REGISTER_IP]: 'Mint an NFT, register it as IP, and attach license terms',
  [OP_CREATE_COLLECTION]: 'Create a new SPG NFT collection for your IP assets',
  [OP_LIST_LICENSE_TOKEN]: 'List an owned license token for sale',
  [OP_PURCHASE_LICENSE_LISTING]: 'Purchase a listed license token from another user',
  [OP_MINT_LICENSE_WITH_FEE]: 'Mint a license token with the default minting fee',
  [OP_CREATE_DERIVATIVE_WITH_LICENSE]: 'Create a derivative IP using owned license tokens',
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the label for an operation type
 */
export function getOperationLabel(opType: IPayOperationType): string {
  return IPAY_OPERATION_LABELS[opType] ?? 'Unknown Operation'
}

/**
 * Get the description for an operation type
 */
export function getOperationDescription(opType: IPayOperationType): string {
  return IPAY_OPERATION_DESCRIPTIONS[opType] ?? 'Unknown operation type'
}

/**
 * Check if an operation type is valid
 */
export function isValidOperationType(opType: number): opType is IPayOperationType {
  return opType >= 1 && opType <= 14
}

/**
 * Get operation type from name
 */
export function getOperationTypeByName(name: IPayOperationName): IPayOperationType {
  return IPAY_OPERATION_TYPES[name]
}
