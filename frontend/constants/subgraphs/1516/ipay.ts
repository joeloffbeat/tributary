import type { SubgraphConfig } from '../index'

// TODO: Deploy iPay subgraph to Story Aeneid and update endpoint
// This subgraph will index the LicenseMarketplace contract on Story Aeneid
// Deployment pending after contract deployment to Story Aeneid

export const ipaySubgraph: SubgraphConfig = {
  name: 'ipay',
  description: 'Indexes iPay LicenseMarketplace for IP asset licensing on Story Aeneid',
  goldsky: {
    // TODO: Update after deploying subgraph to Goldsky
    endpoint: '',
    versionEndpoint: '',
  },
  contracts: [
    {
      name: 'LicenseMarketplace',
      // TODO: Update after deploying contract to Story Aeneid
      address: '',
      chainId: 1516,
      chainName: 'Story Aeneid',
      explorerUrl: '',
      startBlock: 0,
    },
  ],
}
