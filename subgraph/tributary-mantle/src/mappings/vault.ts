import { BigInt, BigDecimal, dataSource } from "@graphprotocol/graph-ts"
import {
  RoyaltyReceived,
  RoyaltyDistributed,
  Claimed
} from "../../generated/templates/RoyaltyVault/RoyaltyVault"
import { Vault, Distribution, Claim, TokenHolder, ProtocolStats } from "../../generated/schema"

const PROTOCOL_STATS_ID = "protocol"
const USDT_DECIMALS = 6

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

export function handleRoyaltyReceived(event: RoyaltyReceived): void {
  let vaultAddress = dataSource.address()
  let vaultId = vaultAddress.toHexString()
  let vault = Vault.load(vaultId)
  if (vault == null) return

  let amount = toDecimal(event.params.amount, USDT_DECIMALS)
  let dividendAmount = toDecimal(event.params.dividendAmount, USDT_DECIMALS)

  // Update vault totals
  vault.totalDeposited = vault.totalDeposited.plus(amount)
  vault.pendingDistribution = vault.pendingDistribution.plus(dividendAmount)
  vault.save()
}

export function handleRoyaltyDistributed(event: RoyaltyDistributed): void {
  let vaultAddress = dataSource.address()
  let vaultId = vaultAddress.toHexString()
  let vault = Vault.load(vaultId)
  if (vault == null) return

  // Create distribution ID: vault-distributionId
  let distributionId = vaultId + "-" + event.params.distributionId.toString()
  let amount = toDecimal(event.params.amount, USDT_DECIMALS)

  let distribution = new Distribution(distributionId)
  distribution.vault = vaultId
  distribution.snapshotId = event.params.snapshotId
  distribution.amount = amount
  distribution.totalClaimed = BigDecimal.fromString("0")
  distribution.timestamp = event.block.timestamp
  distribution.save()

  // Update vault totals
  vault.totalDistributed = vault.totalDistributed.plus(amount)
  vault.pendingDistribution = vault.pendingDistribution.minus(amount)
  vault.distributionCount = vault.distributionCount.plus(BigInt.fromI32(1))
  vault.save()

  // Update protocol stats
  let stats = getOrCreateProtocolStats()
  stats.totalRoyaltiesDistributed = stats.totalRoyaltiesDistributed.plus(amount)
  stats.save()
}

export function handleClaimed(event: Claimed): void {
  let vaultAddress = dataSource.address()
  let vaultId = vaultAddress.toHexString()

  // Create claim ID: distribution-holder
  let distributionId = vaultId + "-" + event.params.distributionId.toString()
  let claimId = distributionId + "-" + event.params.holder.toHexString()

  let amount = toDecimal(event.params.amount, USDT_DECIMALS)

  let claim = new Claim(claimId)
  claim.distribution = distributionId
  claim.holder = event.params.holder
  claim.amount = amount
  claim.timestamp = event.block.timestamp
  claim.txHash = event.transaction.hash
  claim.save()

  // Update distribution total claimed
  let distribution = Distribution.load(distributionId)
  if (distribution != null) {
    distribution.totalClaimed = distribution.totalClaimed.plus(amount)
    distribution.save()
  }

  // Update token holder total claimed
  let vault = Vault.load(vaultId)
  if (vault != null) {
    let holderId = vault.token + "-" + event.params.holder.toHexString()
    let holder = TokenHolder.load(holderId)
    if (holder != null) {
      holder.totalClaimed = holder.totalClaimed.plus(amount)
      holder.save()
    }
  }
}
