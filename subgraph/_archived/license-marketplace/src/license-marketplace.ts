import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  ListingCreated as ListingCreatedEvent,
  ListingSold as ListingSoldEvent,
  ListingCancelled as ListingCancelledEvent,
  ListingPriceUpdated as ListingPriceUpdatedEvent,
} from '../generated/LicenseMarketplace/LicenseMarketplace'
import { LicenseListing, Seller, Buyer, MarketplaceStats, DailyStats } from '../generated/schema'

const PROTOCOL_STATS_ID = 'marketplace'
const SECONDS_PER_DAY = 86400

function getOrCreateStats(): MarketplaceStats {
  let stats = MarketplaceStats.load(PROTOCOL_STATS_ID)
  if (!stats) {
    stats = new MarketplaceStats(PROTOCOL_STATS_ID)
    stats.totalListings = BigInt.zero()
    stats.activeListings = BigInt.zero()
    stats.totalSales = BigInt.zero()
    stats.totalVolume = BigInt.zero()
    stats.totalFees = BigInt.zero()
    stats.uniqueSellers = BigInt.zero()
    stats.uniqueBuyers = BigInt.zero()
  }
  return stats
}

function getOrCreateSeller(address: Bytes, timestamp: BigInt): Seller {
  let seller = Seller.load(address)
  if (!seller) {
    seller = new Seller(address)
    seller.totalListings = BigInt.zero()
    seller.activeListings = BigInt.zero()
    seller.totalSales = BigInt.zero()
    seller.totalRevenue = BigInt.zero()
    seller.firstListingAt = timestamp
    seller.lastActivityAt = timestamp

    // Update unique sellers count
    let stats = getOrCreateStats()
    stats.uniqueSellers = stats.uniqueSellers.plus(BigInt.fromI32(1))
    stats.save()
  }
  return seller
}

function getOrCreateBuyer(address: Bytes, timestamp: BigInt): Buyer {
  let buyer = Buyer.load(address)
  if (!buyer) {
    buyer = new Buyer(address)
    buyer.totalPurchases = BigInt.zero()
    buyer.totalSpent = BigInt.zero()
    buyer.firstPurchaseAt = timestamp
    buyer.lastPurchaseAt = timestamp

    // Update unique buyers count
    let stats = getOrCreateStats()
    stats.uniqueBuyers = stats.uniqueBuyers.plus(BigInt.fromI32(1))
    stats.save()
  }
  return buyer
}

function getOrCreateDailyStats(timestamp: BigInt): DailyStats {
  let dayId = timestamp.div(BigInt.fromI32(SECONDS_PER_DAY))
  let id = dayId.toString()
  let stats = DailyStats.load(id)
  if (!stats) {
    stats = new DailyStats(id)
    stats.date = dayId.times(BigInt.fromI32(SECONDS_PER_DAY))
    stats.newListings = BigInt.zero()
    stats.sales = BigInt.zero()
    stats.volume = BigInt.zero()
    stats.fees = BigInt.zero()
  }
  return stats
}

export function handleListingCreated(event: ListingCreatedEvent): void {
  // First get or create seller
  let seller = getOrCreateSeller(event.params.seller, event.block.timestamp)

  let listing = new LicenseListing(event.params.listingId.toString())
  listing.listingId = event.params.listingId
  listing.seller = seller.id
  listing.sellerAddress = event.params.seller
  listing.buyer = null
  listing.licenseTokenId = event.params.licenseTokenId
  listing.ipId = event.params.ipId
  listing.licenseTermsId = event.params.licenseTermsId
  listing.priceUSDC = event.params.priceUSDC
  listing.active = true
  listing.sold = false
  listing.createdAt = event.block.timestamp
  listing.createdAtBlock = event.block.number
  listing.soldAt = null
  listing.transactionHash = event.transaction.hash
  listing.saleTransactionHash = null
  listing.feeAmount = null
  listing.save()

  // Update seller
  seller.totalListings = seller.totalListings.plus(BigInt.fromI32(1))
  seller.activeListings = seller.activeListings.plus(BigInt.fromI32(1))
  seller.lastActivityAt = event.block.timestamp
  seller.save()

  // Update protocol stats
  let stats = getOrCreateStats()
  stats.totalListings = stats.totalListings.plus(BigInt.fromI32(1))
  stats.activeListings = stats.activeListings.plus(BigInt.fromI32(1))
  stats.save()

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp)
  dailyStats.newListings = dailyStats.newListings.plus(BigInt.fromI32(1))
  dailyStats.save()
}

export function handleListingSold(event: ListingSoldEvent): void {
  let listing = LicenseListing.load(event.params.listingId.toString())
  if (!listing) return

  listing.buyer = event.params.buyer
  listing.active = false
  listing.sold = true
  listing.soldAt = event.block.timestamp
  listing.saleTransactionHash = event.transaction.hash
  listing.feeAmount = event.params.fee
  listing.save()

  // Update seller
  let seller = Seller.load(event.params.seller)
  if (seller) {
    seller.activeListings = seller.activeListings.minus(BigInt.fromI32(1))
    seller.totalSales = seller.totalSales.plus(BigInt.fromI32(1))
    seller.totalRevenue = seller.totalRevenue.plus(event.params.priceUSDC.minus(event.params.fee))
    seller.lastActivityAt = event.block.timestamp
    seller.save()
  }

  // Update buyer
  let buyer = getOrCreateBuyer(event.params.buyer, event.block.timestamp)
  buyer.totalPurchases = buyer.totalPurchases.plus(BigInt.fromI32(1))
  buyer.totalSpent = buyer.totalSpent.plus(event.params.priceUSDC)
  buyer.lastPurchaseAt = event.block.timestamp
  buyer.save()

  // Update protocol stats
  let stats = getOrCreateStats()
  stats.activeListings = stats.activeListings.minus(BigInt.fromI32(1))
  stats.totalSales = stats.totalSales.plus(BigInt.fromI32(1))
  stats.totalVolume = stats.totalVolume.plus(event.params.priceUSDC)
  stats.totalFees = stats.totalFees.plus(event.params.fee)
  stats.save()

  // Update daily stats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp)
  dailyStats.sales = dailyStats.sales.plus(BigInt.fromI32(1))
  dailyStats.volume = dailyStats.volume.plus(event.params.priceUSDC)
  dailyStats.fees = dailyStats.fees.plus(event.params.fee)
  dailyStats.save()
}

export function handleListingCancelled(event: ListingCancelledEvent): void {
  let listing = LicenseListing.load(event.params.listingId.toString())
  if (!listing) return

  listing.active = false
  listing.save()

  // Update seller
  let seller = Seller.load(event.params.seller)
  if (seller) {
    seller.activeListings = seller.activeListings.minus(BigInt.fromI32(1))
    seller.lastActivityAt = event.block.timestamp
    seller.save()
  }

  // Update protocol stats
  let stats = getOrCreateStats()
  stats.activeListings = stats.activeListings.minus(BigInt.fromI32(1))
  stats.save()
}

export function handleListingPriceUpdated(event: ListingPriceUpdatedEvent): void {
  let listing = LicenseListing.load(event.params.listingId.toString())
  if (!listing) return

  listing.priceUSDC = event.params.newPrice
  listing.save()
}
