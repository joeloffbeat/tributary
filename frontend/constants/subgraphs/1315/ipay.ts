import type { SubgraphConfig } from '../index'

// iPay subgraph configuration for Story Aeneid (Chain ID: 1315)
// Indexes the IPayReceiver and LicenseMarketplace contracts

export const ipaySubgraph: SubgraphConfig = {
  name: 'ipay',
  description: 'Indexes iPay contracts for cross-chain IP licensing on Story Aeneid',
  goldsky: {
    endpoint: 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/story-ipay/prod/gn',
    versionEndpoint: 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/story-ipay/1.0.0/gn',
  },
  contracts: [
    {
      name: 'IPayReceiver',
      // IPayReceiver contract on Story Aeneid
      address: '0xA5Cf9339908C3970c2e9Ac4aC0105367f53B80cB',
      chainId: 1315,
      chainName: 'Story Aeneid',
      explorerUrl: 'https://aeneid.storyscan.xyz',
      startBlock: 12168199, // Block 0xb9ac07 - deployment block
    },
    {
      name: 'LicenseMarketplace',
      // TODO: Update after deploying LicenseMarketplace to Story Aeneid
      address: '',
      chainId: 1315,
      chainName: 'Story Aeneid',
      explorerUrl: 'https://aeneid.storyscan.xyz',
      startBlock: 0,
    },
  ],
}
