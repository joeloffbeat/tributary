// =============================================================================
// Bridge USDC - Types
// =============================================================================

import type { Address, Hex } from 'viem'

export interface UsdcChainConfig {
  chainId: number
  chainName: string
  displayName: string
  routerAddress: Address
  tokenAddress: Address
  mailboxAddress: Address
  type: 'collateral' | 'synthetic'
  explorerUrl: string
  rpcUrl: string
}

export type BridgeStep =
  | 'idle'
  | 'approving'        // Step 1: Approving USDC spend
  | 'sending'          // Step 2: Sending transferRemote tx
  | 'confirming'       // Step 3: Waiting for source tx confirmation
  | 'waiting_relay'    // Step 4: Waiting for relayer (with timeout)
  | 'processing'       // Step 5: Server processing (fallback)
  | 'confirming_dest'  // Step 6: Confirming destination tx
  | 'complete'         // Done!
  | 'error'

export interface BridgeState {
  step: BridgeStep
  sourceTxHash?: Hex
  messageId?: Hex
  messageBytes?: Hex
  destTxHash?: Hex
  error?: string
  // For UI progress
  currentStepIndex: number
  totalSteps: number
}

export interface BridgeQuote {
  inputAmount: bigint
  outputAmount: bigint
  interchainGasFee: bigint
  estimatedTime: number // seconds
}

export const BRIDGE_STEPS: { step: BridgeStep; label: string }[] = [
  { step: 'approving', label: 'Approving USDC' },
  { step: 'sending', label: 'Sending to bridge' },
  { step: 'confirming', label: 'Confirming transaction' },
  { step: 'waiting_relay', label: 'Waiting for relay' },
  { step: 'processing', label: 'Processing on destination' },
  { step: 'complete', label: 'Bridge complete!' },
]
