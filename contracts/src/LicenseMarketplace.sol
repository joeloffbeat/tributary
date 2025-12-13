// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title LicenseMarketplace
/// @notice Marketplace for trading Story Protocol license tokens on Avalanche Fuji
/// @dev Stores listings referencing license tokens escrowed on Story Aeneid
contract LicenseMarketplace is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Structs ============

    struct LicenseListing {
        uint256 id;
        address seller;
        uint256 licenseTokenId;
        address ipId;
        uint256 licenseTermsId;
        uint256 priceUSDC;
        bool active;
        address buyer;
        uint256 createdAt;
        uint256 soldAt;
    }

    // ============ State Variables ============

    IERC20 public immutable usdc;
    address public owner;
    uint256 public nextListingId;
    uint256 public platformFee; // Basis points (e.g., 250 = 2.5%)
    address public feeRecipient;
    bool public paused;

    // ============ Mappings ============

    mapping(uint256 => LicenseListing) public listings;
    mapping(address => uint256[]) public sellerListings;
    mapping(uint256 => bool) public licenseTokenListed; // Prevent duplicate listings

    // ============ Events ============

    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        uint256 indexed licenseTokenId,
        address ipId,
        uint256 licenseTermsId,
        uint256 priceUSDC
    );

    event ListingSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 priceUSDC,
        uint256 fee
    );

    event ListingCancelled(uint256 indexed listingId, address indexed seller);
    event ListingPriceUpdated(uint256 indexed listingId, uint256 oldPrice, uint256 newPrice);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    // ============ Errors ============

    error OnlyOwner();
    error OnlySeller();
    error InvalidPrice();
    error InvalidFee();
    error ListingNotActive();
    error ListingNotFound();
    error AlreadyListed();
    error ContractPaused();
    error ZeroAddress();
    error CannotBuyOwnListing();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // ============ Constructor ============

    constructor(address _usdc, address _feeRecipient, uint256 _platformFee) {
        if (_usdc == address(0)) revert ZeroAddress();
        if (_feeRecipient == address(0)) revert ZeroAddress();
        if (_platformFee > 1000) revert InvalidFee(); // Max 10%

        usdc = IERC20(_usdc);
        feeRecipient = _feeRecipient;
        platformFee = _platformFee;
        owner = msg.sender;
        nextListingId = 1;
    }

    // ============ External Functions ============

    /// @notice Create a listing for a license token
    /// @dev Seller must have escrowed the license token on Story via IPayReceiver
    /// @param licenseTokenId License token ID on Story
    /// @param ipId Associated IP Asset address
    /// @param licenseTermsId License terms ID
    /// @param priceUSDC Price in USDC (6 decimals)
    function createListing(
        uint256 licenseTokenId,
        address ipId,
        uint256 licenseTermsId,
        uint256 priceUSDC
    ) external whenNotPaused returns (uint256 listingId) {
        if (priceUSDC == 0) revert InvalidPrice();
        if (licenseTokenListed[licenseTokenId]) revert AlreadyListed();

        listingId = nextListingId++;

        listings[listingId] = LicenseListing({
            id: listingId,
            seller: msg.sender,
            licenseTokenId: licenseTokenId,
            ipId: ipId,
            licenseTermsId: licenseTermsId,
            priceUSDC: priceUSDC,
            active: true,
            buyer: address(0),
            createdAt: block.timestamp,
            soldAt: 0
        });

        sellerListings[msg.sender].push(listingId);
        licenseTokenListed[licenseTokenId] = true;

        emit ListingCreated(listingId, msg.sender, licenseTokenId, ipId, licenseTermsId, priceUSDC);
    }

    /// @notice Purchase a license listing
    /// @dev Buyer must have approved USDC. Cross-chain transfer handled separately.
    /// @param listingId ID of the listing to purchase
    function purchaseListing(uint256 listingId) external nonReentrant whenNotPaused {
        LicenseListing storage listing = listings[listingId];

        if (listing.id == 0) revert ListingNotFound();
        if (!listing.active) revert ListingNotActive();
        if (msg.sender == listing.seller) revert CannotBuyOwnListing();

        // Calculate fees
        uint256 feeAmount = (listing.priceUSDC * platformFee) / 10000;
        uint256 sellerAmount = listing.priceUSDC - feeAmount;

        // Transfer USDC from buyer
        usdc.safeTransferFrom(msg.sender, listing.seller, sellerAmount);
        if (feeAmount > 0) {
            usdc.safeTransferFrom(msg.sender, feeRecipient, feeAmount);
        }

        // Update listing
        listing.active = false;
        listing.buyer = msg.sender;
        listing.soldAt = block.timestamp;

        emit ListingSold(listingId, msg.sender, listing.seller, listing.priceUSDC, feeAmount);
    }

    /// @notice Cancel a listing
    /// @param listingId ID of the listing to cancel
    function cancelListing(uint256 listingId) external {
        LicenseListing storage listing = listings[listingId];

        if (listing.id == 0) revert ListingNotFound();
        if (listing.seller != msg.sender) revert OnlySeller();
        if (!listing.active) revert ListingNotActive();

        listing.active = false;
        licenseTokenListed[listing.licenseTokenId] = false;

        emit ListingCancelled(listingId, msg.sender);
    }

    /// @notice Update listing price
    /// @param listingId ID of the listing
    /// @param newPrice New price in USDC
    function updatePrice(uint256 listingId, uint256 newPrice) external {
        if (newPrice == 0) revert InvalidPrice();

        LicenseListing storage listing = listings[listingId];

        if (listing.id == 0) revert ListingNotFound();
        if (listing.seller != msg.sender) revert OnlySeller();
        if (!listing.active) revert ListingNotActive();

        uint256 oldPrice = listing.priceUSDC;
        listing.priceUSDC = newPrice;

        emit ListingPriceUpdated(listingId, oldPrice, newPrice);
    }

    // ============ View Functions ============

    /// @notice Get all listings by seller
    function getListingsBySeller(address seller) external view returns (uint256[] memory) {
        return sellerListings[seller];
    }

    /// @notice Get active listings (paginated)
    function getActiveListings(uint256 offset, uint256 limit)
        external
        view
        returns (LicenseListing[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) count++;
        }

        uint256 resultSize = count > offset ? count - offset : 0;
        if (resultSize > limit) resultSize = limit;

        LicenseListing[] memory result = new LicenseListing[](resultSize);
        uint256 resultIndex = 0;
        uint256 skipped = 0;

        for (uint256 i = 1; i < nextListingId && resultIndex < resultSize; i++) {
            if (listings[i].active) {
                if (skipped < offset) {
                    skipped++;
                } else {
                    result[resultIndex++] = listings[i];
                }
            }
        }

        return result;
    }

    /// @notice Get listing details
    function getListing(uint256 listingId) external view returns (LicenseListing memory) {
        return listings[listingId];
    }

    // ============ Admin Functions ============

    function setPlatformFee(uint256 newFee) external onlyOwner {
        if (newFee > 1000) revert InvalidFee(); // Max 10%
        uint256 oldFee = platformFee;
        platformFee = newFee;
        emit PlatformFeeUpdated(oldFee, newFee);
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
}
