import type { SubgraphConfig } from '../index'

// iPay subgraph configuration for Story Aeneid (Chain ID: 1315)
// Indexes the IPayReceiver and LicenseMarketplace contracts

export const ipaySubgraph: SubgraphConfig = {
  name: 'ipay',
  description: 'Indexes iPay contracts for cross-chain IP licensing on Story Aeneid',
  goldsky: {
    endpoint: 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/story-ipay/prod/gn',
    versionEndpoint: 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/story-ipay/1.3.0/gn',
  },
  contracts: [
    {
      name: 'IPayReceiver',
      // IPayReceiver contract on Story Aeneid
      address: '0x70C55848161C4ee78A726ABE715ccD5F4C69B9fa',
      chainId: 1315,
      chainName: 'Story Aeneid',
      explorerUrl: 'https://aeneid.storyscan.xyz',
      startBlock: 12241560, // Deployment block for new contract
    },
  ],
}
