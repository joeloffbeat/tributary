// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRoyaltyMarketplace {
    struct Listing {
        uint256 listingId;
        address seller;
        address royaltyToken;
        address vault;
        uint256 amount;
        uint256 pricePerToken;
        address paymentToken;
        uint256 sold;
        bool isActive;
        bool isPrimarySale;
        uint256 createdAt;
        uint256 expiresAt;
    }

    struct CreateListingParams {
        address royaltyToken;
        uint256 amount;
        uint256 pricePerToken;
        address paymentToken;
        uint256 duration;
    }

    function createListing(CreateListingParams calldata params) external returns (uint256);
    function buy(uint256 listingId, uint256 amount) external;
    function cancelListing(uint256 listingId) external;
    function updatePrice(uint256 listingId, uint256 newPrice) external;
    function getActiveListing(uint256 listingId) external view returns (Listing memory);
    function getListingsByToken(address token) external view returns (Listing[] memory);
    function getFloorPrice(address token) external view returns (uint256);
}
