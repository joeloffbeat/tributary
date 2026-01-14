import { BigInt, BigDecimal, dataSource, Address } from "@graphprotocol/graph-ts"
import {
  Transfer
} from "../../generated/templates/RoyaltyToken/RoyaltyToken"
import { Token, TokenHolder, ProtocolStats } from "../../generated/schema"

const ZERO_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000")
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

export function handleTransfer(event: Transfer): void {
  let tokenAddress = dataSource.address()
  let tokenId = tokenAddress.toHexString()
  let token = Token.load(tokenId)
  if (token == null) return

  let from = event.params.from
  let to = event.params.to
  let value = toDecimal(event.params.value, TOKEN_DECIMALS)

  // Handle mint (from == zero)
  if (from.equals(ZERO_ADDRESS)) {
    // Token supply is set at creation, mints are for initial distribution
    // Track the new holder
  }

  // Handle burn (to == zero)
  if (to.equals(ZERO_ADDRESS)) {
    token.totalSupply = token.totalSupply.minus(value)
    token.save()
  }

  // Update sender balance (if not mint)
  if (!from.equals(ZERO_ADDRESS)) {
    let fromHolderId = tokenId + "-" + from.toHexString()
    let fromHolder = TokenHolder.load(fromHolderId)
    if (fromHolder != null) {
      fromHolder.balance = fromHolder.balance.minus(value)

      // If balance goes to zero, decrease holder count
      if (fromHolder.balance.equals(BigDecimal.fromString("0"))) {
        token.holderCount = token.holderCount.minus(BigInt.fromI32(1))
        token.save()

        // Update protocol stats
        let stats = getOrCreateProtocolStats()
        stats.totalHolders = stats.totalHolders.minus(BigInt.fromI32(1))
        stats.save()
      }

      fromHolder.save()
    }
  }

  // Update receiver balance (if not burn)
  if (!to.equals(ZERO_ADDRESS)) {
    let toHolderId = tokenId + "-" + to.toHexString()
    let toHolder = TokenHolder.load(toHolderId)
    let isNewHolder = false

    if (toHolder == null) {
      isNewHolder = true
      toHolder = new TokenHolder(toHolderId)
      toHolder.token = tokenId
      toHolder.holder = to
      toHolder.balance = BigDecimal.fromString("0")
      toHolder.totalClaimed = BigDecimal.fromString("0")
    } else if (toHolder.balance.equals(BigDecimal.fromString("0"))) {
      // Was a previous holder with zero balance
      isNewHolder = true
    }

    toHolder.balance = toHolder.balance.plus(value)
    toHolder.save()

    // If new holder with positive balance, increase count
    if (isNewHolder && toHolder.balance.gt(BigDecimal.fromString("0"))) {
      token.holderCount = token.holderCount.plus(BigInt.fromI32(1))
      token.save()

      // Update protocol stats
      let stats = getOrCreateProtocolStats()
      stats.totalHolders = stats.totalHolders.plus(BigInt.fromI32(1))
      stats.save()
    }
  }
}
