import { GraphQLClient } from 'graphql-request'

export const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || ''

export const subgraphClient = new GraphQLClient(SUBGRAPH_URL)

/**
 * Generic helper to query the subgraph
 */
export async function querySubgraph<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!SUBGRAPH_URL) {
    throw new Error('NEXT_PUBLIC_SUBGRAPH_URL is not configured')
  }
  return subgraphClient.request<T>(query, variables)
}

// ============ GraphQL Queries ============

export const QUERIES = {
  // Get all vaults with pagination
  VAULTS: `
    query GetVaults($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!) {
      vaults(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        id
        token {
          id
          name
          symbol
          totalSupply
          holderCount
        }
        creator
        storyIPId
        dividendBps
        tradingFeeBps
        totalDeposited
        totalDistributed
        pendingDistribution
        distributionCount
        createdAt
        isActive
        pool {
          id
          reserveToken
          reserveQuote
          volumeQuote
          txCount
        }
      }
    }
  `,

  // Get single vault by ID
  VAULT: `
    query GetVault($id: ID!) {
      vault(id: $id) {
        id
        token {
          id
          name
          symbol
          totalSupply
          holderCount
          holders {
            holder
            balance
            totalClaimed
          }
        }
        creator
        storyIPId
        dividendBps
        tradingFeeBps
        totalDeposited
        totalDistributed
        pendingDistribution
        distributionCount
        createdAt
        isActive
        distributions(first: 10, orderBy: timestamp, orderDirection: desc) {
          id
          snapshotId
          amount
          totalClaimed
          timestamp
        }
        pool {
          id
          reserveToken
          reserveQuote
          volumeToken
          volumeQuote
          txCount
          feesCollected
        }
      }
    }
  `,

  // Get pool with recent swaps
  POOL_WITH_SWAPS: `
    query GetPoolWithSwaps($poolId: ID!, $swapsFirst: Int!) {
      pool(id: $poolId) {
        id
        token {
          id
          symbol
          name
        }
        quoteToken
        reserveToken
        reserveQuote
        volumeToken
        volumeQuote
        txCount
        feesCollected
        createdAt
        swaps(first: $swapsFirst, orderBy: timestamp, orderDirection: desc) {
          id
          trader
          isBuy
          amountIn
          amountOut
          fee
          price
          timestamp
          txHash
        }
      }
    }
  `,

  // Get candles for charting - 1 minute
  CANDLES_1M: `
    query GetCandles1m($poolId: String!, $from: BigInt!, $first: Int!) {
      candle1ms(
        where: { pool: $poolId, timestamp_gte: $from }
        orderBy: timestamp
        orderDirection: asc
        first: $first
      ) {
        timestamp
        open
        high
        low
        close
        volume
        txCount
      }
    }
  `,

  // Get candles - 5 minutes
  CANDLES_5M: `
    query GetCandles5m($poolId: String!, $from: BigInt!, $first: Int!) {
      candle5ms(
        where: { pool: $poolId, timestamp_gte: $from }
        orderBy: timestamp
        orderDirection: asc
        first: $first
      ) {
        timestamp
        open
        high
        low
        close
        volume
        txCount
      }
    }
  `,

  // Get candles - 1 hour
  CANDLES_1H: `
    query GetCandles1h($poolId: String!, $from: BigInt!, $first: Int!) {
      candle1hs(
        where: { pool: $poolId, timestamp_gte: $from }
        orderBy: timestamp
        orderDirection: asc
        first: $first
      ) {
        timestamp
        open
        high
        low
        close
        volume
        txCount
      }
    }
  `,

  // Get candles - 1 day
  CANDLES_1D: `
    query GetCandles1d($poolId: String!, $from: BigInt!, $first: Int!) {
      candle1ds(
        where: { pool: $poolId, timestamp_gte: $from }
        orderBy: timestamp
        orderDirection: asc
        first: $first
      ) {
        timestamp
        open
        high
        low
        close
        volume
        txCount
      }
    }
  `,

  // Get marketplace listings
  LISTINGS: `
    query GetListings($first: Int!, $skip: Int!, $isActive: Boolean) {
      listings(
        first: $first
        skip: $skip
        where: { isActive: $isActive }
        orderBy: createdAt
        orderDirection: desc
      ) {
        id
        seller
        token {
          id
          name
          symbol
        }
        vault {
          id
          dividendBps
        }
        amount
        pricePerToken
        sold
        isActive
        isPrimarySale
        createdAt
        expiresAt
      }
    }
  `,

  // Get user holdings
  USER_HOLDINGS: `
    query GetUserHoldings($holder: Bytes!) {
      tokenHolders(where: { holder: $holder, balance_gt: "0" }) {
        token {
          id
          name
          symbol
          vault {
            id
            dividendBps
            totalDistributed
            pool {
              reserveQuote
              reserveToken
            }
          }
        }
        balance
        totalClaimed
      }
    }
  `,

  // Get protocol stats
  PROTOCOL_STATS: `
    query GetProtocolStats {
      protocolStats(id: "protocol") {
        totalVaults
        totalVolume
        totalRoyaltiesDistributed
        totalFeesCollected
        totalHolders
      }
    }
  `,

  // Get user's claim history
  USER_CLAIMS: `
    query GetUserClaims($holder: Bytes!, $first: Int!) {
      claims(
        where: { holder: $holder }
        orderBy: timestamp
        orderDirection: desc
        first: $first
      ) {
        id
        distribution {
          vault {
            id
            token {
              name
              symbol
            }
          }
          amount
          snapshotId
        }
        amount
        timestamp
        txHash
      }
    }
  `,

  // Get recent trades for a token
  TOKEN_TRADES: `
    query GetTokenTrades($tokenId: String!, $first: Int!) {
      listings(where: { token: $tokenId }) {
        trades(first: $first, orderBy: timestamp, orderDirection: desc) {
          id
          buyer
          amount
          totalPrice
          fee
          timestamp
          txHash
        }
      }
    }
  `,
}

// ============ Type Definitions ============

export interface Vault {
  id: string
  token: Token
  creator: string
  storyIPId: string
  dividendBps: string
  tradingFeeBps: string
  totalDeposited: string
  totalDistributed: string
  pendingDistribution: string
  distributionCount: string
  createdAt: string
  isActive: boolean
  pool?: Pool
  distributions?: Distribution[]
}

export interface Token {
  id: string
  name: string
  symbol: string
  totalSupply: string
  holderCount: string
  holders?: TokenHolder[]
  vault?: Vault
}

export interface TokenHolder {
  id?: string
  token?: Token
  holder: string
  balance: string
  totalClaimed: string
}

export interface Pool {
  id: string
  token?: Token
  quoteToken?: string
  reserveToken: string
  reserveQuote: string
  volumeToken: string
  volumeQuote: string
  txCount: string
  feesCollected: string
  createdAt?: string
  swaps?: Swap[]
}

export interface Swap {
  id: string
  pool?: string
  trader: string
  isBuy: boolean
  amountIn: string
  amountOut: string
  fee: string
  price: string
  timestamp: string
  txHash: string
}

export interface Candle {
  timestamp: string
  open: string
  high: string
  low: string
  close: string
  volume: string
  txCount: string
}

export interface Distribution {
  id: string
  vault?: Vault
  snapshotId: string
  amount: string
  totalClaimed: string
  timestamp: string
}

export interface Claim {
  id: string
  distribution: Distribution
  holder: string
  amount: string
  timestamp: string
  txHash: string
}

export interface Listing {
  id: string
  seller: string
  token: Token
  vault?: Vault
  amount: string
  pricePerToken: string
  sold: string
  isActive: boolean
  isPrimarySale: boolean
  createdAt: string
  expiresAt?: string
  trades?: Trade[]
}

export interface Trade {
  id: string
  listing?: Listing
  buyer: string
  amount: string
  totalPrice: string
  fee: string
  timestamp: string
  txHash: string
}

export interface ProtocolStats {
  totalVaults: string
  totalVolume: string
  totalRoyaltiesDistributed: string
  totalFeesCollected: string
  totalHolders: string
}
