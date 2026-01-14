// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IRoyaltyVaultFactory } from "./interfaces/IRoyaltyVaultFactory.sol";
import { IRoyaltyMarketplace } from "./interfaces/IRoyaltyMarketplace.sol";
import { IRoyaltyVault } from "./interfaces/IRoyaltyVault.sol";

/// @title RoyaltyMarketplace
/// @notice Marketplace for buying and selling RoyaltyTokens
/// @dev Supports primary sales (creator → investors) and secondary trading with partial fills
contract RoyaltyMarketplace is IRoyaltyMarketplace, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct Trade {
        uint256 listingId;
        address buyer;
        uint256 amount;
        uint256 totalPrice;
        uint256 timestamp;
    }

    IRoyaltyVaultFactory public immutable factory;
    address public protocolTreasury;

    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public listingsBySeller;
    mapping(address => uint256[]) public listingsByToken;
    Trade[] public trades;

    uint256 public listingCount;
    uint256 public tradeCount;
    uint256 public constant DEFAULT_TRADING_FEE = 100; // 1% default for non-vault listings
    uint256 public constant BASIS_POINTS = 10000;

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed royaltyToken,
        uint256 amount,
        uint256 pricePerToken,
        bool isPrimarySale
    );
    event Sold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice,
        uint256 fee
    );
    event Cancelled(uint256 indexed listingId);
    event PriceUpdated(uint256 indexed listingId, uint256 oldPrice, uint256 newPrice);

    error ZeroAddress();
    error ZeroAmount();
    error InvalidPrice();
    error ListingNotActive();
    error ListingExpired();
    error InsufficientAmount();
    error OnlySeller();
    error InvalidToken();

    constructor(address _factory, address _protocolTreasury) Ownable(msg.sender) {
        if (_factory == address(0)) revert ZeroAddress();
        if (_protocolTreasury == address(0)) revert ZeroAddress();
        factory = IRoyaltyVaultFactory(_factory);
        protocolTreasury = _protocolTreasury;
    }

    /// @inheritdoc IRoyaltyMarketplace
    function createListing(CreateListingParams calldata params) external whenNotPaused returns (uint256 listingId) {
        if (params.amount == 0) revert ZeroAmount();
        if (params.pricePerToken == 0) revert InvalidPrice();
        if (params.royaltyToken == address(0)) revert ZeroAddress();
        if (params.paymentToken == address(0)) revert ZeroAddress();

        // Transfer tokens to marketplace (escrow)
        IERC20(params.royaltyToken).safeTransferFrom(msg.sender, address(this), params.amount);

        listingId = listingCount++;

        // Detect if primary sale (seller is the vault)
        address vault;
        bool isPrimarySale;
        try factory.getVaultRecord(msg.sender) returns (IRoyaltyVaultFactory.VaultRecord memory record) {
            if (record.vault == msg.sender && record.token == params.royaltyToken) {
                vault = msg.sender;
                isPrimarySale = true;
            }
        } catch {}

        uint256 expiresAt = params.duration > 0 ? block.timestamp + params.duration : 0;

        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            royaltyToken: params.royaltyToken,
            vault: vault,
            amount: params.amount,
            pricePerToken: params.pricePerToken,
            paymentToken: params.paymentToken,
            sold: 0,
            isActive: true,
            isPrimarySale: isPrimarySale,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });

        listingsBySeller[msg.sender].push(listingId);
        listingsByToken[params.royaltyToken].push(listingId);

        emit Listed(listingId, msg.sender, params.royaltyToken, params.amount, params.pricePerToken, isPrimarySale);
    }

    /// @inheritdoc IRoyaltyMarketplace
    function buy(uint256 listingId, uint256 amount) external nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];

        if (!listing.isActive) revert ListingNotActive();
        if (listing.expiresAt != 0 && block.timestamp > listing.expiresAt) revert ListingExpired();
        if (amount == 0) revert ZeroAmount();

        uint256 available = listing.amount - listing.sold;
        if (amount > available) revert InsufficientAmount();

        // Get trading fee from vault or use default
        uint256 tradingFeeBps = _getVaultTradingFee(listing.vault);

        uint256 totalPrice = amount * listing.pricePerToken;
        uint256 fee = (totalPrice * tradingFeeBps) / BASIS_POINTS;
        uint256 sellerAmount = totalPrice - fee;

        // Transfer payment
        IERC20(listing.paymentToken).safeTransferFrom(msg.sender, listing.seller, sellerAmount);
        if (fee > 0) {
            IERC20(listing.paymentToken).safeTransferFrom(msg.sender, protocolTreasury, fee);
        }

        // Transfer tokens to buyer
        IERC20(listing.royaltyToken).safeTransfer(msg.sender, amount);

        // Update listing
        listing.sold += amount;
        if (listing.sold >= listing.amount) {
            listing.isActive = false;
        }

        // Record trade
        trades.push(Trade({
            listingId: listingId,
            buyer: msg.sender,
            amount: amount,
            totalPrice: totalPrice,
            timestamp: block.timestamp
        }));
        tradeCount++;

        emit Sold(listingId, msg.sender, amount, totalPrice, fee);
    }

    /// @notice Gets trading fee for a vault, defaults to DEFAULT_TRADING_FEE for non-vault listings
    /// @param vault Vault address (can be address(0) for non-vault listings)
    /// @return Trading fee in basis points
    function _getVaultTradingFee(address vault) internal view returns (uint256) {
        if (vault == address(0)) return DEFAULT_TRADING_FEE;
        try IRoyaltyVault(vault).getVaultInfo() returns (IRoyaltyVault.VaultInfo memory info) {
            return info.tradingFeeBps;
        } catch {
            return DEFAULT_TRADING_FEE;
        }
    }

    /// @inheritdoc IRoyaltyMarketplace
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];

        if (msg.sender != listing.seller) revert OnlySeller();
        if (!listing.isActive) revert ListingNotActive();

        uint256 unsold = listing.amount - listing.sold;
        listing.isActive = false;

        if (unsold > 0) {
            IERC20(listing.royaltyToken).safeTransfer(listing.seller, unsold);
        }

        emit Cancelled(listingId);
    }

    /// @inheritdoc IRoyaltyMarketplace
    function updatePrice(uint256 listingId, uint256 newPrice) external {
        Listing storage listing = listings[listingId];

        if (msg.sender != listing.seller) revert OnlySeller();
        if (!listing.isActive) revert ListingNotActive();
        if (newPrice == 0) revert InvalidPrice();

        uint256 oldPrice = listing.pricePerToken;
        listing.pricePerToken = newPrice;

        emit PriceUpdated(listingId, oldPrice, newPrice);
    }

    /// @inheritdoc IRoyaltyMarketplace
    function getActiveListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /// @inheritdoc IRoyaltyMarketplace
    function getListingsByToken(address token) external view returns (Listing[] memory) {
        uint256[] storage ids = listingsByToken[token];
        Listing[] memory result = new Listing[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = listings[ids[i]];
        }
        return result;
    }

    /// @notice Returns listings by a specific seller
    function getListingsBySeller(address seller) external view returns (Listing[] memory) {
        uint256[] storage ids = listingsBySeller[seller];
        Listing[] memory result = new Listing[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = listings[ids[i]];
        }
        return result;
    }

    /// @notice Returns paginated active listings
    function getActiveListings(uint256 offset, uint256 limit) external view returns (Listing[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < listingCount && count < offset + limit; i++) {
            if (listings[i].isActive) count++;
        }

        uint256 resultCount = count > offset ? count - offset : 0;
        if (resultCount > limit) resultCount = limit;

        Listing[] memory result = new Listing[](resultCount);
        uint256 current = 0;
        uint256 added = 0;

        for (uint256 i = 0; i < listingCount && added < resultCount; i++) {
            if (listings[i].isActive) {
                if (current >= offset) {
                    result[added++] = listings[i];
                }
                current++;
            }
        }
        return result;
    }

    /// @notice Returns trade history for a token
    function getTradeHistory(address token, uint256 limit) external view returns (Trade[] memory) {
        uint256 count = 0;
        for (uint256 i = trades.length; i > 0 && count < limit; i--) {
            if (listings[trades[i - 1].listingId].royaltyToken == token) count++;
        }

        Trade[] memory result = new Trade[](count);
        uint256 added = 0;

        for (uint256 i = trades.length; i > 0 && added < count; i--) {
            Trade storage t = trades[i - 1];
            if (listings[t.listingId].royaltyToken == token) {
                result[added++] = t;
            }
        }
        return result;
    }

    /// @inheritdoc IRoyaltyMarketplace
    function getFloorPrice(address token) external view returns (uint256 floor) {
        uint256[] storage ids = listingsByToken[token];
        floor = type(uint256).max;

        for (uint256 i = 0; i < ids.length; i++) {
            Listing storage listing = listings[ids[i]];
            if (listing.isActive && listing.sold < listing.amount) {
                if (listing.expiresAt == 0 || block.timestamp <= listing.expiresAt) {
                    if (listing.pricePerToken < floor) {
                        floor = listing.pricePerToken;
                    }
                }
            }
        }

        if (floor == type(uint256).max) floor = 0;
    }

    /// @notice Returns a trade by index
    function getTrade(uint256 index) external view returns (Trade memory) {
        return trades[index];
    }

    /// @notice Pauses the marketplace
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses the marketplace
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Updates protocol treasury address
    function setProtocolTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        protocolTreasury = newTreasury;
    }
}
