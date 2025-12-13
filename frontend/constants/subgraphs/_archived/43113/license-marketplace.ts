import type { SubgraphConfig } from '../index'

export const licenseMarketplaceSubgraph: SubgraphConfig = {
  name: 'license-marketplace',
  description: 'Indexes LicenseMarketplace for trading Story Protocol license tokens on Avalanche Fuji',
  goldsky: {
    endpoint: 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/license-marketplace/prod/gn',
    versionEndpoint: 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/license-marketplace/1.0.0/gn',
  },
  contracts: [
    {
      name: 'LicenseMarketplace',
      address: '0x4D3ADE52F597e5F09F4dB6c9138fCcF5DB55b8A8',
      chainId: 43113,
      chainName: 'Avalanche Fuji',
      explorerUrl: 'https://testnet.snowtrace.io/address/0x4D3ADE52F597e5F09F4dB6c9138fCcF5DB55b8A8',
      startBlock: 48975500,
    },
  ],
  schemaContent: `
type LicenseListing @entity {
  id: ID!
  listingId: BigInt!
  seller: Seller!
  sellerAddress: Bytes!
  buyer: Bytes
  licenseTokenId: BigInt!
  ipId: Bytes!
  licenseTermsId: BigInt!
  priceUSDC: BigInt!
  active: Boolean!
  sold: Boolean!
  createdAt: BigInt!
  createdAtBlock: BigInt!
  soldAt: BigInt
  transactionHash: Bytes!
  saleTransactionHash: Bytes
  feeAmount: BigInt
}

type Seller @entity {
  id: Bytes!
  totalListings: BigInt!
  activeListings: BigInt!
  totalSales: BigInt!
  totalRevenue: BigInt!
  listings: [LicenseListing!]! @derivedFrom(field: "seller")
  firstListingAt: BigInt!
  lastActivityAt: BigInt!
}

type Buyer @entity {
  id: Bytes!
  totalPurchases: BigInt!
  totalSpent: BigInt!
  firstPurchaseAt: BigInt!
  lastPurchaseAt: BigInt!
}

type MarketplaceStats @entity {
  id: ID!
  totalListings: BigInt!
  activeListings: BigInt!
  totalSales: BigInt!
  totalVolume: BigInt!
  totalFees: BigInt!
  uniqueSellers: BigInt!
  uniqueBuyers: BigInt!
}

type DailyStats @entity {
  id: ID!
  date: BigInt!
  newListings: BigInt!
  sales: BigInt!
  volume: BigInt!
  fees: BigInt!
}
`,
}
