// ============================================================================
// TEMPLATE: Subgraph Configuration
// Replace: SUBGRAPH_NAME, chain IDs, endpoints
// ============================================================================

export interface SubgraphConfig {
  name: string
  goldsky: {
    endpoint: string
  }
}

// Per-chain subgraph configs
export const subgraphConfigs: Record<number, SubgraphConfig> = {
  // Sepolia (chainId: 11155111)
  11155111: {
    name: 'SUBGRAPH_NAME',
    goldsky: {
      endpoint:
        'https://api.goldsky.com/api/public/[PROJECT_ID]/subgraphs/SUBGRAPH_NAME/prod/gn',
    },
  },

  // Mainnet (chainId: 1)
  1: {
    name: 'SUBGRAPH_NAME',
    goldsky: {
      endpoint:
        'https://api.goldsky.com/api/public/[PROJECT_ID]/subgraphs/SUBGRAPH_NAME/prod/gn',
    },
  },
}

/**
 * Get subgraph endpoint for current chain
 */
export function getSubgraphEndpoint(chainId: number): string {
  const config = subgraphConfigs[chainId]
  if (!config) {
    throw new Error(`No subgraph config for chain ${chainId}`)
  }
  return config.goldsky.endpoint
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(subgraphConfigs).map(Number)
}
