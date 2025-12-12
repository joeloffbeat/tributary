// =============================================================================
// Hyperlane Constants - Main Entry Point
// =============================================================================
// Re-exports all Hyperlane-related constants and utilities
// =============================================================================

// Types
export * from './types'

// Hosted deployments (official Hyperlane)
export {
  // Main aggregated deployments
  HOSTED_DEPLOYMENTS,
  getHostedDeployment,
  hasHostedDeployment,
  getAllHostedDeployments,
  getHostedTestnetDeployments,
  getHostedMainnetDeployments,
  getHostedMailboxAddress,
  getHostedDomainId,
  // Individual address maps (for direct access)
  HOSTED_MAILBOX,
  hasHostedMailbox,
  getHostedMailbox,
  HOSTED_VALIDATOR_ANNOUNCE,
  getHostedValidatorAnnounce,
  HOSTED_ICA_ROUTER,
  getHostedICARouter,
  HOSTED_TEST_RECIPIENT,
  getHostedTestRecipient,
  // Chain metadata
  HOSTED_CHAIN_METADATA,
  getHostedChainMetadata,
  isHostedChain,
  getHostedChainIds,
  getHostedTestnetChainIds,
  getHostedMainnetChainIds,
} from './hosted'

// Self-hosted deployments (custom)
export {
  SELF_HOSTED_DEPLOYMENTS,
  getSelfHostedDeployment,
  hasSelfHostedDeployment,
  getAllSelfHostedDeployments,
  getSelfHostedChainIds,
  getSelfHostedMailboxAddress,
  getSelfHostedDomainId,
} from './self-hosted'

// Warp routes
export {
  HOSTED_WARP_ROUTES,
  getHostedWarpRoutes,
  getHostedWarpRoute,
  getHostedWarpRoutesForChain,
  SELF_HOSTED_WARP_ROUTES,
  getSelfHostedWarpRoutes,
  getSelfHostedWarpRoute,
  getSelfHostedWarpRoutesForChain,
} from './warp-routes'

// Utils (mode-aware helpers)
export {
  getDeployments,
  getWarpRoutes,
  getHyperlaneDeployment,
  isHyperlaneDeployed,
  getMailboxAddress,
  getSupportedChainIds,
  getSupportedChains,
  getTestnetChains,
  getMainnetChains,
  getDomainId,
  getICARouterAddress,
  getTestRecipientAddress,
} from './utils'

// =============================================================================
// Legacy Exports (for backward compatibility)
// =============================================================================
// These maintain compatibility with existing code that imports from deployments.ts

import { SELF_HOSTED_DEPLOYMENTS } from './self-hosted'
import { SELF_HOSTED_WARP_ROUTES } from './warp-routes'

export const HYPERLANE_DEPLOYMENTS = SELF_HOSTED_DEPLOYMENTS
export const HYPERLANE_WARP_ROUTES = SELF_HOSTED_WARP_ROUTES
