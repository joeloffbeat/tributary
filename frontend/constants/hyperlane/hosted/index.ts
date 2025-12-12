// =============================================================================
// Hyperlane Hosted Deployments - Aggregator
// =============================================================================
// Combines all individual address files into full deployment records
// =============================================================================

import type { Address } from 'viem'
import type { HyperlaneDeployment } from '../types'
import { HOSTED_MAILBOX, hasHostedMailbox, getHostedMailbox } from './mailbox'
import { HOSTED_VALIDATOR_ANNOUNCE, getHostedValidatorAnnounce } from './validator-announce'
import { HOSTED_ICA_ROUTER, getHostedICARouter } from './ica-router'
import { HOSTED_TEST_RECIPIENT, getHostedTestRecipient } from './test-recipient'
import { HOSTED_CHAIN_METADATA, getHostedChainMetadata, isHostedChain, getHostedChainIds } from './chain-metadata'

// Re-export individual address maps for direct access
export { HOSTED_MAILBOX, hasHostedMailbox, getHostedMailbox } from './mailbox'
export { HOSTED_VALIDATOR_ANNOUNCE, getHostedValidatorAnnounce } from './validator-announce'
export { HOSTED_ICA_ROUTER, getHostedICARouter } from './ica-router'
export { HOSTED_TEST_RECIPIENT, getHostedTestRecipient } from './test-recipient'
export {
  HOSTED_CHAIN_METADATA,
  getHostedChainMetadata,
  isHostedChain,
  getHostedChainIds,
  getHostedTestnetChainIds,
  getHostedMainnetChainIds,
} from './chain-metadata'
export {
  HOSTED_DEFAULT_ISM_VALIDATORS_MAINNET,
  hasHostedDefaultIsmValidators,
  getHostedDefaultIsmValidators,
  getHostedDefaultIsmValidatorsChainIds,
  HOSTED_DEFAULT_ISM_VALIDATORS_MAINNET_COUNT,
} from './default-ism-validators-mainnet'
export {
  HOSTED_DEFAULT_ISM_VALIDATORS_TESTNET,
  hasHostedDefaultIsmValidatorsTestnet,
  getHostedDefaultIsmValidatorsTestnet,
  getHostedDefaultIsmValidatorsTestnetChainIds,
  HOSTED_DEFAULT_ISM_VALIDATORS_TESTNET_COUNT,
} from './default-ism-validators-testnet'

/**
 * Build full deployment object from individual address files
 */
function buildHostedDeployment(chainId: number): HyperlaneDeployment | null {
  const metadata = getHostedChainMetadata(chainId)
  const mailbox = getHostedMailbox(chainId)
  const validatorAnnounce = getHostedValidatorAnnounce(chainId)

  // Require at minimum: metadata, mailbox, and validatorAnnounce
  if (!metadata || !mailbox || !validatorAnnounce) {
    return null
  }

  return {
    ...metadata,
    mailbox,
    validatorAnnounce,
    interchainAccountRouter: getHostedICARouter(chainId),
    testRecipient: getHostedTestRecipient(chainId),
  }
}

/**
 * Full hosted deployments aggregated from individual files
 * This is the main export for getting complete deployment info
 */
export const HOSTED_DEPLOYMENTS: Record<number, HyperlaneDeployment> = (() => {
  const deployments: Record<number, HyperlaneDeployment> = {}

  // Build deployments for all chains that have metadata
  for (const chainId of getHostedChainIds()) {
    const deployment = buildHostedDeployment(chainId)
    if (deployment) {
      deployments[chainId] = deployment
    }
  }

  return deployments
})()

/**
 * Get a specific hosted deployment
 */
export function getHostedDeployment(chainId: number): HyperlaneDeployment | undefined {
  return HOSTED_DEPLOYMENTS[chainId]
}

/**
 * Check if a chain has a complete hosted deployment
 */
export function hasHostedDeployment(chainId: number): boolean {
  return chainId in HOSTED_DEPLOYMENTS
}

/**
 * Get all hosted deployments as array
 */
export function getAllHostedDeployments(): HyperlaneDeployment[] {
  return Object.values(HOSTED_DEPLOYMENTS)
}

/**
 * Get hosted testnet deployments
 */
export function getHostedTestnetDeployments(): HyperlaneDeployment[] {
  return getAllHostedDeployments().filter(d => d.isTestnet)
}

/**
 * Get hosted mainnet deployments
 */
export function getHostedMainnetDeployments(): HyperlaneDeployment[] {
  return getAllHostedDeployments().filter(d => !d.isTestnet)
}

/**
 * Get mailbox address for a hosted chain
 */
export function getHostedMailboxAddress(chainId: number): Address | undefined {
  return HOSTED_DEPLOYMENTS[chainId]?.mailbox
}

/**
 * Get domain ID for a hosted chain
 */
export function getHostedDomainId(chainId: number): number | undefined {
  return HOSTED_DEPLOYMENTS[chainId]?.domainId
}
