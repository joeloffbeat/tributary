import type { Address, Hex } from 'viem'

export interface PortfolioStats {
  totalValue: bigint
  totalPendingRewards: bigint
  totalEarned: bigint
  averageApy: number
  holdingCount: number
  holdings: PortfolioHolding[]
  valueChange24h?: number
}

export interface PortfolioHolding {
  vaultAddress: Address
  tokenAddress: Address
  tokenSymbol: string
  tokenName: string
  storyIPId: Hex

  // User's position
  balance: bigint
  percentage: number // % of total supply owned
  value: bigint // Current value in USDC

  // Rewards
  pendingRewards: bigint
  totalClaimed: bigint
  lastClaimTimestamp: number

  // Vault metrics
  apy: number
  totalVaultValue: bigint

  // Metadata
  imageUrl?: string
}

export interface InvestmentEvent {
  id: string
  type: 'buy' | 'sell' | 'claim' | 'distribution'
  vaultAddress: Address
  tokenSymbol: string
  amount: bigint
  value: bigint
  timestamp: number
  txHash: string
}
