import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts"
import {
  Listed,
  Sold,
  Cancelled,
  PriceUpdated
} from "../../generated/RoyaltyMarketplace/RoyaltyMarketplace"
import { Listing, Trade, Token, ProtocolStats, Vault } from "../../generated/schema"

const PROTOCOL_STATS_ID = "protocol"
const USDT_DECIMALS = 6
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

export function handleListed(event: Listed): void {
  let listingId = event.params.listingId.toString()

  // Look up the token to find the vault
  let tokenId = event.params.royaltyToken.toHexString()
  let token = Token.load(tokenId)
  if (token == null) return

  let listing = new Listing(listingId)
  listing.token = tokenId
  listing.vault = token.vault
  listing.seller = event.params.seller
  listing.amount = toDecimal(event.params.amount, TOKEN_DECIMALS)
  listing.pricePerToken = toDecimal(event.params.pricePerToken, USDT_DECIMALS)
  listing.sold = BigDecimal.fromString("0")
  listing.isActive = true
  listing.isPrimarySale = event.params.isPrimarySale
  listing.createdAt = event.block.timestamp
  listing.expiresAt = null
  listing.save()
}

export function handleSold(event: Sold): void {
  let listingId = event.params.listingId.toString()
  let listing = Listing.load(listingId)
  if (listing == null) return

  // Create trade ID: txHash-logIndex
  let tradeId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()

  let amount = toDecimal(event.params.amount, TOKEN_DECIMALS)
  let totalPrice = toDecimal(event.params.totalPrice, USDT_DECIMALS)
  let fee = toDecimal(event.params.fee, USDT_DECIMALS)

  let trade = new Trade(tradeId)
  trade.listing = listingId
  trade.buyer = event.params.buyer
  trade.amount = amount
  trade.totalPrice = totalPrice
  trade.fee = fee
  trade.timestamp = event.block.timestamp
  trade.txHash = event.transaction.hash
  trade.save()

  // Update listing sold amount
  listing.sold = listing.sold.plus(amount)
  if (listing.sold.ge(listing.amount)) {
    listing.isActive = false
  }
  listing.save()

  // Update protocol stats
  let stats = getOrCreateProtocolStats()
  stats.totalVolume = stats.totalVolume.plus(totalPrice)
  stats.totalFeesCollected = stats.totalFeesCollected.plus(fee)
  stats.save()
}

export function handleCancelled(event: Cancelled): void {
  let listingId = event.params.listingId.toString()
  let listing = Listing.load(listingId)
  if (listing == null) return

  listing.isActive = false
  listing.save()
}

export function handlePriceUpdated(event: PriceUpdated): void {
  let listingId = event.params.listingId.toString()
  let listing = Listing.load(listingId)
  if (listing == null) return

  listing.pricePerToken = toDecimal(event.params.newPrice, USDT_DECIMALS)
  listing.save()
}
