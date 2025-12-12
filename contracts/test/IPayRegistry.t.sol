// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {IPayRegistry} from "../src/IPayRegistry.sol";

contract IPayRegistryTest is Test {
    IPayRegistry public registry;

    address public owner;
    address public creator;
    address public user;
    address public otherUser;

    bytes32 public constant STORY_IP_ID = keccak256("test-story-ip-id");
    bytes32 public constant STORY_IP_ID_2 = keccak256("test-story-ip-id-2");
    uint256 public constant PRICE_PER_USE = 0.01 ether;
    string public constant METADATA_URI = "ipfs://QmTest123";
    string public constant ASSET_IPFS_HASH = "QmAsset456";

    event ListingCreated(
        uint256 indexed listingId,
        bytes32 indexed storyIPId,
        address indexed creator,
        uint256 pricePerUse,
        string metadataUri,
        string assetIpfsHash
    );

    event IPUsed(
        uint256 indexed usageId,
        uint256 indexed listingId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event ListingUpdated(uint256 indexed listingId, uint256 newPrice);
    event ListingDeactivated(uint256 indexed listingId);

    function setUp() public {
        owner = address(this);
        creator = makeAddr("creator");
        user = makeAddr("user");
        otherUser = makeAddr("otherUser");

        registry = new IPayRegistry();
    }

    // ============ Constructor Tests ============

    function test_constructor_setsOwner() public view {
        assertEq(registry.owner(), owner);
    }

    function test_constructor_countersStartAtZero() public view {
        assertEq(registry.listingCounter(), 0);
        assertEq(registry.usageCounter(), 0);
    }

    // ============ createListing Tests ============

    function test_createListing_success() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        assertEq(listingId, 1);
        assertEq(registry.listingCounter(), 1);

        (
            bytes32 storyIPId,
            address listingCreator,
            uint256 pricePerUse,
            string memory metadataUri,
            string memory assetIpfsHash,
            uint256 totalUses,
            uint256 totalRevenue,
            bool active,
            uint256 createdAt
        ) = registry.listings(listingId);

        assertEq(storyIPId, STORY_IP_ID);
        assertEq(listingCreator, creator);
        assertEq(pricePerUse, PRICE_PER_USE);
        assertEq(metadataUri, METADATA_URI);
        assertEq(assetIpfsHash, ASSET_IPFS_HASH);
        assertEq(totalUses, 0);
        assertEq(totalRevenue, 0);
        assertTrue(active);
        assertEq(createdAt, block.timestamp);
    }

    function test_createListing_emitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit ListingCreated(1, STORY_IP_ID, creator, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.prank(creator);
        registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);
    }

    function test_createListing_updatesCreatorListings() public {
        vm.prank(creator);
        registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        uint256[] memory listings = registry.getCreatorListings(creator);
        assertEq(listings.length, 1);
        assertEq(listings[0], 1);
    }

    function test_createListing_updatesStoryIPIdMapping() public {
        vm.prank(creator);
        registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        assertEq(registry.storyIPIdToListingId(STORY_IP_ID), 1);
    }

    function test_createListing_revertsOnZeroStoryIPId() public {
        vm.prank(creator);
        vm.expectRevert(IPayRegistry.InvalidStoryIPId.selector);
        registry.createListing(bytes32(0), PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);
    }

    function test_createListing_revertsOnZeroPrice() public {
        vm.prank(creator);
        vm.expectRevert(IPayRegistry.InvalidPrice.selector);
        registry.createListing(STORY_IP_ID, 0, METADATA_URI, ASSET_IPFS_HASH);
    }

    function test_createListing_revertsOnDuplicateStoryIPId() public {
        vm.prank(creator);
        registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.prank(creator);
        vm.expectRevert(IPayRegistry.StoryIPIdAlreadyListed.selector);
        registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);
    }

    // ============ recordUsage Tests ============

    function test_recordUsage_success() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        uint256 usageId = registry.recordUsage(listingId, user, PRICE_PER_USE);

        assertEq(usageId, 1);
        assertEq(registry.usageCounter(), 1);

        (uint256 recordListingId, address recordUser, uint256 amount, uint256 timestamp) = registry.usageRecords(usageId);

        assertEq(recordListingId, listingId);
        assertEq(recordUser, user);
        assertEq(amount, PRICE_PER_USE);
        assertEq(timestamp, block.timestamp);
    }

    function test_recordUsage_updatesListingStats() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        registry.recordUsage(listingId, user, PRICE_PER_USE);
        registry.recordUsage(listingId, user, PRICE_PER_USE);

        (,,,,,uint256 totalUses, uint256 totalRevenue,,) = registry.listings(listingId);

        assertEq(totalUses, 2);
        assertEq(totalRevenue, PRICE_PER_USE * 2);
    }

    function test_recordUsage_emitsEvent() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.expectEmit(true, true, true, true);
        emit IPUsed(1, listingId, user, PRICE_PER_USE, block.timestamp);

        registry.recordUsage(listingId, user, PRICE_PER_USE);
    }

    function test_recordUsage_updatesUserUsages() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        registry.recordUsage(listingId, user, PRICE_PER_USE);

        uint256[] memory usages = registry.getUserUsages(user);
        assertEq(usages.length, 1);
        assertEq(usages[0], 1);
    }

    function test_recordUsage_revertsOnNonOwner() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.prank(user);
        vm.expectRevert(IPayRegistry.OnlyOwner.selector);
        registry.recordUsage(listingId, user, PRICE_PER_USE);
    }

    function test_recordUsage_revertsOnNonExistentListing() public {
        vm.expectRevert(IPayRegistry.ListingNotFound.selector);
        registry.recordUsage(999, user, PRICE_PER_USE);
    }

    function test_recordUsage_revertsOnInactiveListing() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.prank(creator);
        registry.deactivateListing(listingId);

        vm.expectRevert(IPayRegistry.ListingNotActive.selector);
        registry.recordUsage(listingId, user, PRICE_PER_USE);
    }

    // ============ updatePrice Tests ============

    function test_updatePrice_success() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        uint256 newPrice = 0.02 ether;
        vm.prank(creator);
        registry.updatePrice(listingId, newPrice);

        (,,uint256 pricePerUse,,,,,,) = registry.listings(listingId);
        assertEq(pricePerUse, newPrice);
    }

    function test_updatePrice_emitsEvent() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        uint256 newPrice = 0.02 ether;
        vm.expectEmit(true, false, false, true);
        emit ListingUpdated(listingId, newPrice);

        vm.prank(creator);
        registry.updatePrice(listingId, newPrice);
    }

    function test_updatePrice_revertsOnNonCreator() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.prank(user);
        vm.expectRevert(IPayRegistry.OnlyCreator.selector);
        registry.updatePrice(listingId, 0.02 ether);
    }

    function test_updatePrice_revertsOnZeroPrice() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.prank(creator);
        vm.expectRevert(IPayRegistry.InvalidPrice.selector);
        registry.updatePrice(listingId, 0);
    }

    function test_updatePrice_revertsOnNonExistentListing() public {
        vm.prank(creator);
        vm.expectRevert(IPayRegistry.ListingNotFound.selector);
        registry.updatePrice(999, 0.02 ether);
    }

    // ============ deactivateListing Tests ============

    function test_deactivateListing_success() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.prank(creator);
        registry.deactivateListing(listingId);

        (,,,,,,,bool active,) = registry.listings(listingId);
        assertFalse(active);
    }

    function test_deactivateListing_emitsEvent() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.expectEmit(true, false, false, false);
        emit ListingDeactivated(listingId);

        vm.prank(creator);
        registry.deactivateListing(listingId);
    }

    function test_deactivateListing_revertsOnNonCreator() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.prank(user);
        vm.expectRevert(IPayRegistry.OnlyCreator.selector);
        registry.deactivateListing(listingId);
    }

    function test_deactivateListing_revertsOnNonExistentListing() public {
        vm.prank(creator);
        vm.expectRevert(IPayRegistry.ListingNotFound.selector);
        registry.deactivateListing(999);
    }

    // ============ verifyReceipt Tests ============

    function test_verifyReceipt_validReceipt() public {
        vm.prank(creator);
        uint256 listingId = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        uint256 usageId = registry.recordUsage(listingId, user, PRICE_PER_USE);

        (bool valid, IPayRegistry.UsageRecord memory record, IPayRegistry.Listing memory listing) =
            registry.verifyReceipt(usageId);

        assertTrue(valid);
        assertEq(record.listingId, listingId);
        assertEq(record.user, user);
        assertEq(record.amount, PRICE_PER_USE);
        assertEq(listing.storyIPId, STORY_IP_ID);
        assertEq(listing.creator, creator);
    }

    function test_verifyReceipt_invalidReceipt() public view {
        (bool valid,,) = registry.verifyReceipt(999);
        assertFalse(valid);
    }

    // ============ getListingByStoryIPId Tests ============

    function test_getListingByStoryIPId_found() public {
        vm.prank(creator);
        registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        (uint256 listingId, IPayRegistry.Listing memory listing) = registry.getListingByStoryIPId(STORY_IP_ID);

        assertEq(listingId, 1);
        assertEq(listing.storyIPId, STORY_IP_ID);
        assertEq(listing.creator, creator);
    }

    function test_getListingByStoryIPId_notFound() public view {
        (uint256 listingId, IPayRegistry.Listing memory listing) = registry.getListingByStoryIPId(STORY_IP_ID);

        assertEq(listingId, 0);
        assertEq(listing.creator, address(0));
    }

    // ============ transferOwnership Tests ============

    function test_transferOwnership_success() public {
        address newOwner = makeAddr("newOwner");

        registry.transferOwnership(newOwner);

        assertEq(registry.owner(), newOwner);
    }

    function test_transferOwnership_revertsOnNonOwner() public {
        address newOwner = makeAddr("newOwner");

        vm.prank(user);
        vm.expectRevert(IPayRegistry.OnlyOwner.selector);
        registry.transferOwnership(newOwner);
    }

    function test_transferOwnership_revertsOnZeroAddress() public {
        vm.expectRevert("Invalid new owner");
        registry.transferOwnership(address(0));
    }

    // ============ Multiple Listings Tests ============

    function test_multipleListings_differentCreators() public {
        vm.prank(creator);
        uint256 listingId1 = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.prank(otherUser);
        uint256 listingId2 = registry.createListing(STORY_IP_ID_2, PRICE_PER_USE * 2, METADATA_URI, ASSET_IPFS_HASH);

        assertEq(listingId1, 1);
        assertEq(listingId2, 2);

        uint256[] memory creatorListings = registry.getCreatorListings(creator);
        uint256[] memory otherUserListings = registry.getCreatorListings(otherUser);

        assertEq(creatorListings.length, 1);
        assertEq(otherUserListings.length, 1);
        assertEq(creatorListings[0], 1);
        assertEq(otherUserListings[0], 2);
    }

    function test_multipleUsages_sameUser() public {
        vm.prank(creator);
        uint256 listingId1 = registry.createListing(STORY_IP_ID, PRICE_PER_USE, METADATA_URI, ASSET_IPFS_HASH);

        vm.prank(otherUser);
        uint256 listingId2 = registry.createListing(STORY_IP_ID_2, PRICE_PER_USE * 2, METADATA_URI, ASSET_IPFS_HASH);

        registry.recordUsage(listingId1, user, PRICE_PER_USE);
        registry.recordUsage(listingId2, user, PRICE_PER_USE * 2);
        registry.recordUsage(listingId1, user, PRICE_PER_USE);

        uint256[] memory userUsages = registry.getUserUsages(user);
        assertEq(userUsages.length, 3);
    }
}
