import { BigInt } from "@graphprotocol/graph-ts"
import {
  PaymentReceived,
  LicenseMinted,
  DerivativeCreated,
  IPRegistered,
  LicenseTransferred,
  DisputeRaised,
  PaymentFailed,
  ListingCreated,
  ListingUpdated,
  ListingDeactivated,
  ListingUsed,
  TrustedDomainUpdated,
  WIPDeposited,
  WIPWithdrawn,
  ExchangeRateUpdated,
  LicenseTokenListed,
  LicenseListingPurchased
} from "../generated/IPayReceiver/IPayReceiver"
import {
  Creator,
  Listing,
  Usage,
  Payment,
  LicenseMint,
  DerivativeCreation,
  IPRegistration,
  LicenseTransfer,
  Dispute,
  PaymentFailure,
  LicenseListing,
  TrustedDomain,
  LiquidityEvent,
  ExchangeRateUpdate,
  ProtocolStats
} from "../generated/schema"

function getOrCreateStats(): ProtocolStats {
  let stats = ProtocolStats.load("global")
  if (stats == null) {
    stats = new ProtocolStats("global")
    stats.totalPayments = BigInt.fromI32(0)
    stats.totalLicensesMinted = BigInt.fromI32(0)
    stats.totalDerivativesCreated = BigInt.fromI32(0)
    stats.totalIPsRegistered = BigInt.fromI32(0)
    stats.totalDisputesRaised = BigInt.fromI32(0)
    stats.totalListingsCreated = BigInt.fromI32(0)
    stats.totalListingUsages = BigInt.fromI32(0)
    stats.totalLicenseListings = BigInt.fromI32(0)
    stats.totalWIPDeposited = BigInt.fromI32(0)
    stats.totalWIPWithdrawn = BigInt.fromI32(0)
  }
  return stats
}

function getOrCreateCreator(address: string): Creator {
  let creator = Creator.load(address)
  if (creator == null) {
    creator = new Creator(address)
    creator.totalListings = BigInt.fromI32(0)
    creator.totalRevenue = BigInt.fromI32(0)
    creator.totalUses = BigInt.fromI32(0)
  }
  return creator
}

export function handlePaymentReceived(event: PaymentReceived): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let payment = new Payment(id)

  payment.messageId = event.params.messageId
  payment.payer = event.params.payer
  payment.ipId = event.params.ipId
  payment.usdcAmount = event.params.usdcAmount
  payment.wipAmount = event.params.wipAmount
  payment.timestamp = event.block.timestamp
  payment.blockNumber = event.block.number
  payment.transactionHash = event.transaction.hash
  payment.save()

  let stats = getOrCreateStats()
  stats.totalPayments = stats.totalPayments.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleLicenseMinted(event: LicenseMinted): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let mint = new LicenseMint(id)

  mint.messageId = event.params.messageId
  mint.ipId = event.params.ipId
  mint.recipient = event.params.recipient
  mint.licenseTokenId = event.params.licenseTokenId
  mint.wipAmount = event.params.wipAmount
  mint.timestamp = event.block.timestamp
  mint.blockNumber = event.block.number
  mint.transactionHash = event.transaction.hash
  mint.save()

  let stats = getOrCreateStats()
  stats.totalLicensesMinted = stats.totalLicensesMinted.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleDerivativeCreated(event: DerivativeCreated): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let derivative = new DerivativeCreation(id)

  derivative.messageId = event.params.messageId
  derivative.parentIpId = event.params.parentIpId
  derivative.derivativeIpId = event.params.derivativeIpId
  derivative.wipAmount = event.params.wipAmount
  derivative.timestamp = event.block.timestamp
  derivative.blockNumber = event.block.number
  derivative.transactionHash = event.transaction.hash
  derivative.save()

  let stats = getOrCreateStats()
  stats.totalDerivativesCreated = stats.totalDerivativesCreated.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleIPRegistered(event: IPRegistered): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let registration = new IPRegistration(id)

  registration.messageId = event.params.messageId
  registration.nftContract = event.params.nftContract
  registration.tokenId = event.params.tokenId
  registration.ipId = event.params.ipId
  registration.timestamp = event.block.timestamp
  registration.blockNumber = event.block.number
  registration.transactionHash = event.transaction.hash
  registration.save()

  let stats = getOrCreateStats()
  stats.totalIPsRegistered = stats.totalIPsRegistered.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleLicenseTransferred(event: LicenseTransferred): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let transfer = new LicenseTransfer(id)

  transfer.messageId = event.params.messageId
  transfer.licenseTokenId = event.params.licenseTokenId
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.timestamp = event.block.timestamp
  transfer.blockNumber = event.block.number
  transfer.transactionHash = event.transaction.hash
  transfer.save()
}

export function handleDisputeRaised(event: DisputeRaised): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let dispute = new Dispute(id)

  dispute.messageId = event.params.messageId
  dispute.disputeId = event.params.disputeId
  dispute.targetIpId = event.params.targetIpId
  dispute.disputant = event.params.disputant
  dispute.bondAmount = event.params.bondAmount
  dispute.timestamp = event.block.timestamp
  dispute.blockNumber = event.block.number
  dispute.transactionHash = event.transaction.hash
  dispute.save()

  let stats = getOrCreateStats()
  stats.totalDisputesRaised = stats.totalDisputesRaised.plus(BigInt.fromI32(1))
  stats.save()
}

export function handlePaymentFailed(event: PaymentFailed): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let failure = new PaymentFailure(id)

  failure.messageId = event.params.messageId
  failure.operationType = event.params.operationType
  failure.reason = event.params.reason
  failure.timestamp = event.block.timestamp
  failure.blockNumber = event.block.number
  failure.transactionHash = event.transaction.hash
  failure.save()
}

export function handleListingCreated(event: ListingCreated): void {
  let id = event.params.listingId.toString()

  // Get or create creator
  let creatorAddress = event.params.creator.toHexString()
  let creator = getOrCreateCreator(creatorAddress)
  creator.totalListings = creator.totalListings.plus(BigInt.fromI32(1))
  creator.save()

  // Create listing
  let listing = new Listing(id)
  listing.storyIPId = event.params.storyIPId
  listing.creator = creatorAddress
  listing.pricePerUse = event.params.priceUSDC // Map priceUSDC to pricePerUse
  listing.metadataUri = "" // Not in event, would need contract call
  listing.assetIpfsHash = "" // Not in event, would need contract call
  listing.totalUses = BigInt.fromI32(0)
  listing.totalRevenue = BigInt.fromI32(0)
  listing.active = true
  listing.createdAt = event.block.timestamp
  listing.title = event.params.title
  listing.category = event.params.category
  listing.sourceChain = event.params.sourceChain
  listing.blockNumber = event.block.number
  listing.transactionHash = event.transaction.hash
  listing.save()

  let stats = getOrCreateStats()
  stats.totalListingsCreated = stats.totalListingsCreated.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleListingUpdated(event: ListingUpdated): void {
  let id = event.params.listingId.toString()
  let listing = Listing.load(id)

  if (listing != null) {
    listing.pricePerUse = event.params.newPrice
    listing.save()
  }
}

export function handleListingDeactivated(event: ListingDeactivated): void {
  let id = event.params.listingId.toString()
  let listing = Listing.load(id)

  if (listing != null) {
    listing.active = false
    listing.save()
  }
}

export function handleListingUsed(event: ListingUsed): void {
  // Create usage record
  let usageId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let usage = new Usage(usageId)
  usage.listing = event.params.listingId.toString()
  usage.user = event.params.user
  usage.amount = event.params.paymentAmount
  usage.timestamp = event.block.timestamp
  usage.txHash = event.transaction.hash
  usage.save()

  // Update listing stats
  let listingId = event.params.listingId.toString()
  let listing = Listing.load(listingId)
  if (listing != null) {
    listing.totalUses = listing.totalUses.plus(BigInt.fromI32(1))
    listing.totalRevenue = listing.totalRevenue.plus(event.params.paymentAmount)
    listing.save()

    // Update creator stats
    let creator = Creator.load(listing.creator)
    if (creator != null) {
      creator.totalUses = creator.totalUses.plus(BigInt.fromI32(1))
      creator.totalRevenue = creator.totalRevenue.plus(event.params.paymentAmount)
      creator.save()
    }
  }

  let stats = getOrCreateStats()
  stats.totalListingUsages = stats.totalListingUsages.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleTrustedDomainUpdated(event: TrustedDomainUpdated): void {
  let id = event.params.domain.toString() + "-" + event.params.sender.toHexString()
  let domain = new TrustedDomain(id)

  domain.domain = event.params.domain
  domain.sender = event.params.sender
  domain.enabled = event.params.enabled
  domain.timestamp = event.block.timestamp
  domain.blockNumber = event.block.number
  domain.transactionHash = event.transaction.hash
  domain.save()
}

export function handleWIPDeposited(event: WIPDeposited): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let liquidity = new LiquidityEvent(id)

  liquidity.eventType = "deposit"
  liquidity.actor = event.params.depositor
  liquidity.amount = event.params.amount
  liquidity.newLiquidity = event.params.newLiquidity
  liquidity.timestamp = event.block.timestamp
  liquidity.blockNumber = event.block.number
  liquidity.transactionHash = event.transaction.hash
  liquidity.save()

  let stats = getOrCreateStats()
  stats.totalWIPDeposited = stats.totalWIPDeposited.plus(event.params.amount)
  stats.save()
}

export function handleWIPWithdrawn(event: WIPWithdrawn): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let liquidity = new LiquidityEvent(id)

  liquidity.eventType = "withdraw"
  liquidity.actor = event.params.recipient
  liquidity.amount = event.params.amount
  liquidity.newLiquidity = event.params.newLiquidity
  liquidity.timestamp = event.block.timestamp
  liquidity.blockNumber = event.block.number
  liquidity.transactionHash = event.transaction.hash
  liquidity.save()

  let stats = getOrCreateStats()
  stats.totalWIPWithdrawn = stats.totalWIPWithdrawn.plus(event.params.amount)
  stats.save()
}

export function handleExchangeRateUpdated(event: ExchangeRateUpdated): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let update = new ExchangeRateUpdate(id)

  update.oldRate = event.params.oldRate
  update.newRate = event.params.newRate
  update.timestamp = event.block.timestamp
  update.blockNumber = event.block.number
  update.transactionHash = event.transaction.hash
  update.save()
}

export function handleLicenseTokenListed(event: LicenseTokenListed): void {
  let id = event.params.listingId.toString()
  let listing = new LicenseListing(id)

  listing.licenseTokenId = event.params.licenseTokenId
  listing.seller = event.params.seller
  listing.price = event.params.price
  listing.active = true
  listing.createdAt = event.block.timestamp
  listing.blockNumber = event.block.number
  listing.transactionHash = event.transaction.hash
  listing.save()

  let stats = getOrCreateStats()
  stats.totalLicenseListings = stats.totalLicenseListings.plus(BigInt.fromI32(1))
  stats.save()
}

export function handleLicenseListingPurchased(event: LicenseListingPurchased): void {
  let id = event.params.listingId.toString()
  let listing = LicenseListing.load(id)

  if (listing != null) {
    listing.active = false
    listing.purchasedBy = event.params.buyer
    listing.purchasedAt = event.block.timestamp
    listing.save()
  }
}
