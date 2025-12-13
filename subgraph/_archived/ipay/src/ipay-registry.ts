import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  ListingCreated as ListingCreatedEvent,
  IPUsed as IPUsedEvent,
  ListingUpdated as ListingUpdatedEvent,
  ListingDeactivated as ListingDeactivatedEvent
} from "../generated/IPayRegistry/IPayRegistry"
import {
  Listing,
  Usage,
  Creator,
  User,
  ProtocolStats,
  DailyStats
} from "../generated/schema"

// Constants
const PROTOCOL_STATS_ID = "protocol"
const ZERO = BigInt.fromI32(0)
const ONE = BigInt.fromI32(1)

// Helper: Get day ID from timestamp
function getDayId(timestamp: BigInt): string {
  let dayTimestamp = timestamp.toI32() / 86400
  return dayTimestamp.toString()
}

// Helper: Get or create ProtocolStats
function getOrCreateProtocolStats(): ProtocolStats {
  let stats = ProtocolStats.load(PROTOCOL_STATS_ID)
  if (stats == null) {
    stats = new ProtocolStats(PROTOCOL_STATS_ID)
    stats.totalListings = ZERO
    stats.activeListings = ZERO
    stats.totalUsages = ZERO
    stats.totalVolume = ZERO
    stats.uniqueCreators = ZERO
    stats.uniqueUsers = ZERO
  }
  return stats
}

// Helper: Get or create Creator
function getOrCreateCreator(address: Bytes, timestamp: BigInt): Creator {
  let creator = Creator.load(address)
  if (creator == null) {
    creator = new Creator(address)
    creator.totalListings = ZERO
    creator.totalRevenue = ZERO
    creator.totalUses = ZERO
    creator.firstListingAt = timestamp
    creator.lastActivityAt = timestamp

    // Update protocol stats for new creator
    let stats = getOrCreateProtocolStats()
    stats.uniqueCreators = stats.uniqueCreators.plus(ONE)
    stats.save()
  }
  return creator
}

// Helper: Get or create User
function getOrCreateUser(address: Bytes, timestamp: BigInt): User {
  let user = User.load(address)
  if (user == null) {
    user = new User(address)
    user.totalSpent = ZERO
    user.usageCount = ZERO
    user.firstUsageAt = timestamp
    user.lastUsageAt = timestamp

    // Update protocol stats for new user
    let stats = getOrCreateProtocolStats()
    stats.uniqueUsers = stats.uniqueUsers.plus(ONE)
    stats.save()
  }
  return user
}

// Helper: Get or create DailyStats
function getOrCreateDailyStats(timestamp: BigInt): DailyStats {
  let dayId = getDayId(timestamp)
  let stats = DailyStats.load(dayId)
  if (stats == null) {
    stats = new DailyStats(dayId)
    let dayStart = BigInt.fromI32((timestamp.toI32() / 86400) * 86400)
    stats.date = dayStart
    stats.newListings = ZERO
    stats.usageCount = ZERO
    stats.volume = ZERO
    stats.uniqueUsers = ZERO
  }
  return stats
}

// Handler: ListingCreated
export function handleListingCreated(event: ListingCreatedEvent): void {
  let listingId = event.params.listingId.toString()

  // Create Listing entity
  let listing = new Listing(listingId)
  listing.storyIPId = event.params.storyIPId
  listing.pricePerUse = event.params.pricePerUse
  listing.metadataUri = event.params.metadataUri
  listing.assetIpfsHash = event.params.assetIpfsHash
  listing.totalUses = ZERO
  listing.totalRevenue = ZERO
  listing.active = true
  listing.createdAt = event.block.timestamp
  listing.createdAtBlock = event.block.number
  listing.transactionHash = event.transaction.hash

  // Get or create Creator and link
  let creator = getOrCreateCreator(event.params.creator, event.block.timestamp)
  listing.creator = creator.id
  listing.save()

  // Update Creator stats
  creator.totalListings = creator.totalListings.plus(ONE)
  creator.lastActivityAt = event.block.timestamp
  creator.save()

  // Update ProtocolStats
  let protocolStats = getOrCreateProtocolStats()
  protocolStats.totalListings = protocolStats.totalListings.plus(ONE)
  protocolStats.activeListings = protocolStats.activeListings.plus(ONE)
  protocolStats.save()

  // Update DailyStats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp)
  dailyStats.newListings = dailyStats.newListings.plus(ONE)
  dailyStats.save()
}

// Handler: IPUsed
export function handleIPUsed(event: IPUsedEvent): void {
  let listingId = event.params.listingId.toString()

  // Load listing
  let listing = Listing.load(listingId)
  if (listing == null) {
    return // Should not happen, but guard against it
  }

  // Create Usage entity
  let usageId = event.transaction.hash.concatI32(event.logIndex.toI32())
  let usage = new Usage(usageId)
  usage.listing = listing.id
  usage.amount = event.params.amount
  usage.timestamp = event.block.timestamp
  usage.blockNumber = event.block.number
  usage.txHash = event.transaction.hash

  // Get or create User and link
  let user = getOrCreateUser(event.params.user, event.block.timestamp)
  usage.user = user.id
  usage.save()

  // Update User stats
  user.totalSpent = user.totalSpent.plus(event.params.amount)
  user.usageCount = user.usageCount.plus(ONE)
  user.lastUsageAt = event.block.timestamp
  user.save()

  // Update Listing stats
  listing.totalUses = listing.totalUses.plus(ONE)
  listing.totalRevenue = listing.totalRevenue.plus(event.params.amount)
  listing.save()

  // Update Creator stats
  let creator = Creator.load(listing.creator)
  if (creator != null) {
    creator.totalRevenue = creator.totalRevenue.plus(event.params.amount)
    creator.totalUses = creator.totalUses.plus(ONE)
    creator.lastActivityAt = event.block.timestamp
    creator.save()
  }

  // Update ProtocolStats
  let protocolStats = getOrCreateProtocolStats()
  protocolStats.totalUsages = protocolStats.totalUsages.plus(ONE)
  protocolStats.totalVolume = protocolStats.totalVolume.plus(event.params.amount)
  protocolStats.save()

  // Update DailyStats
  let dailyStats = getOrCreateDailyStats(event.block.timestamp)
  dailyStats.usageCount = dailyStats.usageCount.plus(ONE)
  dailyStats.volume = dailyStats.volume.plus(event.params.amount)
  dailyStats.save()
}

// Handler: ListingUpdated
export function handleListingUpdated(event: ListingUpdatedEvent): void {
  let listingId = event.params.listingId.toString()

  let listing = Listing.load(listingId)
  if (listing == null) {
    return
  }

  listing.pricePerUse = event.params.newPrice
  listing.save()

  // Update creator activity
  let creator = Creator.load(listing.creator)
  if (creator != null) {
    creator.lastActivityAt = event.block.timestamp
    creator.save()
  }
}

// Handler: ListingDeactivated
export function handleListingDeactivated(event: ListingDeactivatedEvent): void {
  let listingId = event.params.listingId.toString()

  let listing = Listing.load(listingId)
  if (listing == null) {
    return
  }

  listing.active = false
  listing.save()

  // Update ProtocolStats
  let protocolStats = getOrCreateProtocolStats()
  protocolStats.activeListings = protocolStats.activeListings.minus(ONE)
  protocolStats.save()

  // Update creator activity
  let creator = Creator.load(listing.creator)
  if (creator != null) {
    creator.lastActivityAt = event.block.timestamp
    creator.save()
  }
}
