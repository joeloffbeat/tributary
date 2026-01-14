import type { Address } from 'viem'

export interface Listing {
  id: string
  seller: Address
  tokenAddress: Address
  vaultAddress: Address
  amount: bigint
  remainingAmount: bigint
  pricePerToken: bigint
  totalValue: bigint
  expiresAt: number
  createdAt: number
  isActive: boolean

  // Enriched data
  tokenSymbol?: string
  tokenName?: string
  sellerName?: string
  vaultIPId?: string
}

export interface OrderBookEntry {
  price: bigint
  totalAmount: bigint
  listingCount: number
  listings: Listing[]
}

export interface TradeParams {
  listingId: string
  amount: bigint
  pricePerToken: bigint
}

export type OrderType = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'filled' | 'partial' | 'cancelled' | 'expired'
