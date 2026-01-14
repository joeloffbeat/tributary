import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts"
import { VaultCreated } from "../../generated/RoyaltyVaultFactory/RoyaltyVaultFactory"
import { Vault, Token, ProtocolStats } from "../../generated/schema"
import { RoyaltyVault, RoyaltyToken } from "../../generated/templates"

const PROTOCOL_STATS_ID = "protocol"
const TOKEN_DECIMALS = 18

function toDecimal(value: BigInt, decimals: i32): BigDecimal {
  let precision = BigInt.fromI32(10).pow(decimals as u8).toBigDecimal()
  return value.toBigDecimal().div(precision)
}

function getOrCreateProtocolStats(): ProtocolStats {
  let stats = ProtocolStats.load(PROTOCOL_STATS_ID)
  if (stats == null) {
    stats = new ProtocolStats(PROTOCOL_STATS_ID)
    stats.totalVaults = BigInt.fromI32(0)
    stats.totalVolume = BigDecimal.fromString("0")
    stats.totalRoyaltiesDistributed = BigDecimal.fromString("0")
    stats.totalFeesCollected = BigDecimal.fromString("0")
    stats.totalHolders = BigInt.fromI32(0)
    stats.save()
  }
  return stats
}

export function handleVaultCreated(event: VaultCreated): void {
  let vaultAddress = event.params.vault
  let tokenAddress = event.params.token

  // Create Token entity first
  let tokenId = tokenAddress.toHexString()
  let token = new Token(tokenId)
  token.vault = vaultAddress.toHexString()
  token.name = event.params.tokenName
  token.symbol = event.params.tokenName // Use name as symbol initially
  token.totalSupply = toDecimal(event.params.totalSupply, TOKEN_DECIMALS)
  token.holderCount = BigInt.fromI32(0)
  token.save()

  // Create Vault entity
  let vaultId = vaultAddress.toHexString()
  let vault = new Vault(vaultId)
  vault.token = tokenId
  vault.creator = event.params.creator
  vault.storyIPId = event.params.storyIPId
  vault.paymentToken = Address.zero() // Will be populated from vault contract
  vault.dividendBps = event.params.dividendBps
  vault.tradingFeeBps = event.params.tradingFeeBps
  vault.totalDeposited = BigDecimal.fromString("0")
  vault.totalDistributed = BigDecimal.fromString("0")
  vault.pendingDistribution = BigDecimal.fromString("0")
  vault.distributionCount = BigInt.fromI32(0)
  vault.isActive = true
  vault.createdAt = event.block.timestamp
  vault.save()

  // Update protocol stats
  let stats = getOrCreateProtocolStats()
  stats.totalVaults = stats.totalVaults.plus(BigInt.fromI32(1))
  stats.save()

  // Create data source templates to index vault and token events
  RoyaltyVault.create(vaultAddress)
  RoyaltyToken.create(tokenAddress)
}
