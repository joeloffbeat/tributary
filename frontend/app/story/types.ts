// Story Protocol Operations Types

export type OperationStatus = 'idle' | 'pending' | 'success' | 'error'

export interface OperationResult {
  status: OperationStatus
  hash?: `0x${string}`
  error?: string
}

export interface PayRoyaltyParams {
  receiverIpId: `0x${string}`
  payerIpId: `0x${string}` // Use zero address for direct payment
  token: `0x${string}`
  amount: bigint
}

export interface ClaimRevenueParams {
  ancestorIpId: `0x${string}`
  claimer: `0x${string}`
  currencyTokens: `0x${string}`[]
  childIpIds: `0x${string}`[]
}

export interface RaiseDisputeParams {
  targetIpId: `0x${string}`
  disputeEvidenceHash: `0x${string}` // bytes32 IPFS CID
  targetTag: `0x${string}` // bytes32 dispute tag
  data: `0x${string}` // additional data
}
