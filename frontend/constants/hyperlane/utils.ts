// =============================================================================
// Hyperlane Utils
// =============================================================================
// Helper functions for working with Hyperlane deployments
// =============================================================================

import type { Address } from 'viem'
import type { HyperlaneMode, HyperlaneDeployment, WarpRouteDeployment } from './types'
import {
  HOSTED_DEPLOYMENTS,
  getHostedDeployment,
  hasHostedDeployment,
  getAllHostedDeployments,
} from './hosted'
import {
  SELF_HOSTED_DEPLOYMENTS,
  getSelfHostedDeployment,
  hasSelfHostedDeployment,
  getAllSelfHostedDeployments,
} from './self-hosted'
import {
  HOSTED_WARP_ROUTES,
  SELF_HOSTED_WARP_ROUTES,
} from './warp-routes'

// =============================================================================
// Deployment Getters (Mode-aware)
// =============================================================================

/**
 * Get deployments based on mode
 */
export function getDeployments(mode: HyperlaneMode): Record<number, HyperlaneDeployment> {
  return mode === 'hosted' ? HOSTED_DEPLOYMENTS : SELF_HOSTED_DEPLOYMENTS
}

/**
 * Get warp routes based on mode
 */
export function getWarpRoutes(mode: HyperlaneMode): WarpRouteDeployment[] {
  return mode === 'hosted' ? HOSTED_WARP_ROUTES : SELF_HOSTED_WARP_ROUTES
}

/**
 * Get a specific deployment
 */
export function getHyperlaneDeployment(
  chainId: number,
  mode: HyperlaneMode = 'self-hosted'
): HyperlaneDeployment | undefined {
  return mode === 'hosted'
    ? getHostedDeployment(chainId)
    : getSelfHostedDeployment(chainId)
}

/**
 * Check if a chain has Hyperlane deployed
 */
export function isHyperlaneDeployed(
  chainId: number,
  mode: HyperlaneMode = 'self-hosted'
): boolean {
  return mode === 'hosted'
    ? hasHostedDeployment(chainId)
    : hasSelfHostedDeployment(chainId)
}

/**
 * Get mailbox address for a chain
 */
export function getMailboxAddress(
  chainId: number,
  mode: HyperlaneMode = 'self-hosted'
): Address | undefined {
  const deployment = getHyperlaneDeployment(chainId, mode)
  return deployment?.mailbox
}

/**
 * Get all supported chain IDs for a mode
 */
export function getSupportedChainIds(mode: HyperlaneMode): number[] {
  const deployments = getDeployments(mode)
  return Object.keys(deployments).map(Number)
}

/**
 * Get all supported chains as array
 */
export function getSupportedChains(mode: HyperlaneMode): HyperlaneDeployment[] {
  return mode === 'hosted'
    ? getAllHostedDeployments()
    : getAllSelfHostedDeployments()
}

/**
 * Get testnet chains only
 */
export function getTestnetChains(mode: HyperlaneMode): HyperlaneDeployment[] {
  return getSupportedChains(mode).filter(chain => chain.isTestnet)
}

/**
 * Get mainnet chains only
 */
export function getMainnetChains(mode: HyperlaneMode): HyperlaneDeployment[] {
  return getSupportedChains(mode).filter(chain => !chain.isTestnet)
}

/**
 * Get domain ID for a chain
 */
export function getDomainId(
  chainId: number,
  mode: HyperlaneMode = 'self-hosted'
): number | undefined {
  const deployment = getHyperlaneDeployment(chainId, mode)
  return deployment?.domainId
}

/**
 * Get ICA router address for a chain
 */
export function getICARouterAddress(
  chainId: number,
  mode: HyperlaneMode = 'self-hosted'
): Address | undefined {
  const deployment = getHyperlaneDeployment(chainId, mode)
  return deployment?.interchainAccountRouter
}

/**
 * Get test recipient address for a chain
 */
export function getTestRecipientAddress(
  chainId: number,
  mode: HyperlaneMode = 'self-hosted'
): Address | undefined {
  const deployment = getHyperlaneDeployment(chainId, mode)
  return deployment?.testRecipient
}
