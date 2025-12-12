import type { HyperlaneChainInfo, HyperlaneToken } from '@/lib/services/hyperlane-service'

export type { HyperlaneMode } from '@/constants/hyperlane'

export type BridgeStep = {
  id: 'approve' | 'transfer' | 'relay'
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  txHash?: string
  messageId?: string
  error?: string
}

export type TrackedMessage = {
  messageId: string
  originChainId: number
  destinationChainId: number
  type: 'bridge' | 'message' | 'ica'
  status: 'pending' | 'delivered' | 'failed'
  originTxHash: string
  destinationTxHash?: string
  timestamp: number
  description: string
  body?: string // Decoded message body from Hyperlane API
  lastChecked?: number // Timestamp of last status check
}

export type ChainSelectOption = HyperlaneChainInfo & {
  disabled?: boolean
  disabledReason?: string
}

export type HyperlaneTxSuccess = {
  txHash: string
  messageId: string
}

export type { HyperlaneToken, HyperlaneChainInfo }
