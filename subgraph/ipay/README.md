# IPay Subgraph

Indexes IPayRegistry contract events on Avalanche Fuji for IP asset listings and usage tracking.

## Entities

- **Listing**: IP asset listings with pricing, metadata, and usage stats
- **Usage**: Individual usage events (immutable)
- **Creator**: Aggregated creator stats
- **User**: Aggregated user stats
- **ProtocolStats**: Global protocol metrics
- **DailyStats**: Daily aggregated metrics

## Events Indexed

- `ListingCreated` - New IP asset listed
- `IPUsed` - IP asset used (payment made)
- `ListingUpdated` - Price updated
- `ListingDeactivated` - Listing deactivated

## Setup

1. Update contract address in `config/fuji.json` after deployment
2. Update `startBlock` to the deployment block number

```bash
npm install
npm run prepare:fuji
npm run codegen
npm run build
```

## Deploy

### The Graph Studio
```bash
graph auth --studio <deploy-key>
npm run deploy:thegraph
```

### Goldsky
```bash
goldsky login
npm run deploy:goldsky
```

## Example Queries

### Get all active listings
```graphql
{
  listings(where: { active: true }) {
    id
    storyIPId
    creator { id }
    pricePerUse
    metadataUri
    totalUses
    totalRevenue
  }
}
```

### Get creator stats
```graphql
{
  creators(orderBy: totalRevenue, orderDirection: desc, first: 10) {
    id
    totalListings
    totalRevenue
    totalUses
  }
}
```

### Get recent usages
```graphql
{
  usages(orderBy: timestamp, orderDirection: desc, first: 20) {
    id
    listing { id metadataUri }
    user { id }
    amount
    timestamp
    txHash
  }
}
```

### Get protocol stats
```graphql
{
  protocolStats(id: "protocol") {
    totalListings
    activeListings
    totalUsages
    totalVolume
    uniqueCreators
    uniqueUsers
  }
}
```
