import type { SubgraphConfig } from '../index'

export const ipaySubgraph: SubgraphConfig = {
  name: 'ipay-registry',
  description: 'Indexes IPay Registry IP asset listings and usage payments on Avalanche Fuji',
  thegraph: {
    endpoint: '', // Not deployed to TheGraph
  },
  goldsky: {
    endpoint: 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/ipay/prod/gn',
    versionEndpoint: 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/ipay/1.0.0/gn',
  },
  activeProvider: 'goldsky',
  contracts: [
    {
      name: 'IPayRegistry',
      address: '0x883172EDFF24FE83FDE776f7A9Aaa59CCe5ABA2B',
      chainId: 43113,
      chainName: 'Avalanche Fuji',
      explorerUrl: 'https://testnet.snowtrace.io/address/0x883172EDFF24FE83FDE776f7A9Aaa59CCe5ABA2B',
      startBlock: 48922200,
    },
  ],
  schemaContent: `
type Listing @entity {
  id: ID!
  storyIPId: Bytes!
  creator: Creator!
  pricePerUse: BigInt!
  metadataUri: String!
  assetIpfsHash: String!
  totalUses: BigInt!
  totalRevenue: BigInt!
  active: Boolean!
  createdAt: BigInt!
  createdAtBlock: BigInt!
  transactionHash: Bytes!
  usages: [Usage!]! @derivedFrom(field: "listing")
}

type Usage @entity(immutable: true) {
  id: Bytes!
  listing: Listing!
  user: User!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  txHash: Bytes!
}

type Creator @entity {
  id: Bytes!
  totalListings: BigInt!
  totalRevenue: BigInt!
  totalUses: BigInt!
  listings: [Listing!]! @derivedFrom(field: "creator")
  firstListingAt: BigInt!
  lastActivityAt: BigInt!
}

type User @entity {
  id: Bytes!
  totalSpent: BigInt!
  usageCount: BigInt!
  usages: [Usage!]! @derivedFrom(field: "user")
  firstUsageAt: BigInt!
  lastUsageAt: BigInt!
}

type ProtocolStats @entity {
  id: ID!
  totalListings: BigInt!
  activeListings: BigInt!
  totalUsages: BigInt!
  totalVolume: BigInt!
  uniqueCreators: BigInt!
  uniqueUsers: BigInt!
}
`,
}
