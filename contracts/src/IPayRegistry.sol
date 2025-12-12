// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IPayRegistry
/// @notice Registry for IP listings with x402 micropayment integration
/// @dev Deployed on Avalanche Fuji for IPay project
contract IPayRegistry {
    // ============ Structs ============

    struct Listing {
        bytes32 storyIPId;
        address creator;
        uint256 pricePerUse;
        string metadataUri;
        string assetIpfsHash;
        uint256 totalUses;
        uint256 totalRevenue;
        bool active;
        uint256 createdAt;
    }

    struct UsageRecord {
        uint256 listingId;
        address user;
        uint256 amount;
        uint256 timestamp;
    }

    // ============ State Variables ============

    address public owner;
    uint256 public listingCounter;
    uint256 public usageCounter;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => UsageRecord) public usageRecords;
    mapping(address => uint256[]) private creatorListingIds;
    mapping(address => uint256[]) private userUsageIds;
    mapping(bytes32 => uint256) public storyIPIdToListingId;

    // ============ Events ============

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

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============ Errors ============

    error OnlyOwner();
    error OnlyCreator();
    error ListingNotFound();
    error ListingNotActive();
    error InvalidPrice();
    error InvalidStoryIPId();
    error StoryIPIdAlreadyListed();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier onlyCreator(uint256 listingId) {
        if (listings[listingId].creator != msg.sender) revert OnlyCreator();
        _;
    }

    modifier listingExists(uint256 listingId) {
        if (listings[listingId].creator == address(0)) revert ListingNotFound();
        _;
    }

    modifier listingActive(uint256 listingId) {
        if (!listings[listingId].active) revert ListingNotActive();
        _;
    }

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
    }

    // ============ External Functions ============

    /// @notice Create a new IP listing
    /// @param storyIPId The Story Protocol IP ID
    /// @param pricePerUse Price in wei for each use
    /// @param metadataUri URI to the listing metadata
    /// @param assetIpfsHash IPFS hash of the asset
    /// @return listingId The ID of the created listing
    function createListing(
        bytes32 storyIPId,
        uint256 pricePerUse,
        string calldata metadataUri,
        string calldata assetIpfsHash
    ) external returns (uint256 listingId) {
        if (storyIPId == bytes32(0)) revert InvalidStoryIPId();
        if (pricePerUse == 0) revert InvalidPrice();
        if (storyIPIdToListingId[storyIPId] != 0) revert StoryIPIdAlreadyListed();

        listingCounter++;
        listingId = listingCounter;

        listings[listingId] = Listing({
            storyIPId: storyIPId,
            creator: msg.sender,
            pricePerUse: pricePerUse,
            metadataUri: metadataUri,
            assetIpfsHash: assetIpfsHash,
            totalUses: 0,
            totalRevenue: 0,
            active: true,
            createdAt: block.timestamp
        });

        storyIPIdToListingId[storyIPId] = listingId;
        creatorListingIds[msg.sender].push(listingId);

        emit ListingCreated(listingId, storyIPId, msg.sender, pricePerUse, metadataUri, assetIpfsHash);
    }

    /// @notice Record IP usage after x402 payment verification (only owner/backend)
    /// @param listingId The listing being used
    /// @param user The user who paid for usage
    /// @param amount The amount paid
    /// @return usageId The ID of the usage record
    function recordUsage(
        uint256 listingId,
        address user,
        uint256 amount
    ) external onlyOwner listingExists(listingId) listingActive(listingId) returns (uint256 usageId) {
        usageCounter++;
        usageId = usageCounter;

        usageRecords[usageId] = UsageRecord({
            listingId: listingId,
            user: user,
            amount: amount,
            timestamp: block.timestamp
        });

        listings[listingId].totalUses++;
        listings[listingId].totalRevenue += amount;
        userUsageIds[user].push(usageId);

        emit IPUsed(usageId, listingId, user, amount, block.timestamp);
    }

    /// @notice Update the price of a listing
    /// @param listingId The listing to update
    /// @param newPrice The new price per use
    function updatePrice(
        uint256 listingId,
        uint256 newPrice
    ) external listingExists(listingId) onlyCreator(listingId) {
        if (newPrice == 0) revert InvalidPrice();

        listings[listingId].pricePerUse = newPrice;

        emit ListingUpdated(listingId, newPrice);
    }

    /// @notice Deactivate a listing
    /// @param listingId The listing to deactivate
    function deactivateListing(uint256 listingId) external listingExists(listingId) onlyCreator(listingId) {
        listings[listingId].active = false;

        emit ListingDeactivated(listingId);
    }

    /// @notice Transfer ownership of the contract
    /// @param newOwner The new owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // ============ View Functions ============

    /// @notice Get all listing IDs for a creator
    /// @param creator The creator address
    /// @return Array of listing IDs
    function getCreatorListings(address creator) external view returns (uint256[] memory) {
        return creatorListingIds[creator];
    }

    /// @notice Get all usage record IDs for a user
    /// @param user The user address
    /// @return Array of usage record IDs
    function getUserUsages(address user) external view returns (uint256[] memory) {
        return userUsageIds[user];
    }

    /// @notice Verify a usage receipt exists and is valid
    /// @param usageId The usage record ID
    /// @return valid Whether the receipt exists
    /// @return record The usage record details
    /// @return listing The associated listing details
    function verifyReceipt(uint256 usageId)
        external
        view
        returns (bool valid, UsageRecord memory record, Listing memory listing)
    {
        record = usageRecords[usageId];

        if (record.timestamp == 0) {
            return (false, record, listing);
        }

        listing = listings[record.listingId];
        return (true, record, listing);
    }

    /// @notice Get a listing by Story Protocol IP ID
    /// @param storyIPId The Story Protocol IP ID
    /// @return listingId The listing ID (0 if not found)
    /// @return listing The listing details
    function getListingByStoryIPId(bytes32 storyIPId)
        external
        view
        returns (uint256 listingId, Listing memory listing)
    {
        listingId = storyIPIdToListingId[storyIPId];
        if (listingId != 0) {
            listing = listings[listingId];
        }
    }
}
