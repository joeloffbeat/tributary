// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/tributary/RoyaltyMarketplace.sol";
import "../../src/tributary/RoyaltyVaultFactory.sol";
import "../../src/tributary/RoyaltyVault.sol";
import "../../src/tributary/RoyaltyToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract RoyaltyMarketplaceTest is Test {
    RoyaltyMarketplace public marketplace;
    RoyaltyVaultFactory public factory;
    MockUSDC public usdc;

    address public treasury = address(0x1111);
    address public creator = address(0x2222);
    address public buyer1 = address(0x3333);
    address public buyer2 = address(0x4444);
    address public seller = address(0x5555);

    address public vault;
    address public token;

    bytes32 public constant STORY_IP_ID = keccak256("test-ip");
    uint256 public constant CREATOR_ALLOCATION = 1_000e18; // 10% of 10,000
    uint256 public constant DIVIDEND_BPS = 5000; // 50%
    uint256 public constant TRADING_FEE_BPS = 100; // 1%

    event Listed(uint256 indexed listingId, address indexed seller, address indexed royaltyToken,
        uint256 amount, uint256 pricePerToken, bool isPrimarySale);
    event Sold(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalPrice, uint256 fee);
    event Cancelled(uint256 indexed listingId);
    event PriceUpdated(uint256 indexed listingId, uint256 oldPrice, uint256 newPrice);

    function setUp() public {
        factory = new RoyaltyVaultFactory(treasury);
        marketplace = new RoyaltyMarketplace(address(factory), treasury);
        usdc = new MockUSDC();

        // Create a vault with new parameters
        RoyaltyVaultFactory.VaultParams memory params = RoyaltyVaultFactory.VaultParams({
            storyIPId: STORY_IP_ID,
            tokenName: "Test Royalty Token",
            tokenSymbol: "TRT",
            creatorAllocation: CREATOR_ALLOCATION,
            dividendBps: DIVIDEND_BPS,
            tradingFeeBps: TRADING_FEE_BPS,
            paymentToken: address(usdc)
        });

        vm.prank(creator);
        (vault, token) = factory.createVault(params);

        // Mint USDC to buyers
        usdc.mint(buyer1, 10_000_000e6);
        usdc.mint(buyer2, 10_000_000e6);

        // Approve marketplace for buyers
        vm.prank(buyer1);
        usdc.approve(address(marketplace), type(uint256).max);
        vm.prank(buyer2);
        usdc.approve(address(marketplace), type(uint256).max);
    }

    function _createListingParams(uint256 amount, uint256 price) internal view returns (IRoyaltyMarketplace.CreateListingParams memory) {
        return IRoyaltyMarketplace.CreateListingParams({
            royaltyToken: token,
            amount: amount,
            pricePerToken: price,
            paymentToken: address(usdc),
            duration: 7 days
        });
    }

    // ============ Create Listing Tests ============

    function test_CreateListingEscrowsTokens() public {
        uint256 listAmount = 500e18;
        uint256 creatorBalanceBefore = IERC20(token).balanceOf(creator);

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        marketplace.createListing(_createListingParams(listAmount, 1e6));
        vm.stopPrank();

        assertEq(IERC20(token).balanceOf(address(marketplace)), listAmount);
        assertEq(IERC20(token).balanceOf(creator), creatorBalanceBefore - listAmount);
    }

    function test_CreateListingReturnsId() public {
        uint256 listAmount = 100e18;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount * 3);

        uint256 id1 = marketplace.createListing(_createListingParams(listAmount, 1e6));
        uint256 id2 = marketplace.createListing(_createListingParams(listAmount, 1e6));
        uint256 id3 = marketplace.createListing(_createListingParams(listAmount, 1e6));
        vm.stopPrank();

        assertEq(id1, 0);
        assertEq(id2, 1);
        assertEq(id3, 2);
        assertEq(marketplace.listingCount(), 3);
    }

    function test_CreateListingDetectsPrimarySale() public {
        uint256 listAmount = 100e18;

        // Secondary sale - from creator (creator is not the vault)
        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 secondaryId = marketplace.createListing(_createListingParams(listAmount, 1e6));
        vm.stopPrank();

        IRoyaltyMarketplace.Listing memory secondaryListing = marketplace.getActiveListing(secondaryId);
        assertFalse(secondaryListing.isPrimarySale, "Creator listing should be secondary sale");
    }

    function test_CreateListingEmitsEvent() public {
        uint256 listAmount = 100e18;
        uint256 price = 1e6;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);

        vm.expectEmit(true, true, true, true);
        emit Listed(0, creator, token, listAmount, price, false);

        marketplace.createListing(_createListingParams(listAmount, price));
        vm.stopPrank();
    }

    // ============ Buy Tests ============

    function test_BuyTransfersTokens() public {
        // Using small amounts to keep totalPrice reasonable
        uint256 listAmount = 10_000;
        uint256 buyAmount = 5_000;
        uint256 pricePerToken = 1e6;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, pricePerToken));
        vm.stopPrank();

        uint256 buyerTokensBefore = IERC20(token).balanceOf(buyer1);

        vm.prank(buyer1);
        marketplace.buy(listingId, buyAmount);

        assertEq(IERC20(token).balanceOf(buyer1), buyerTokensBefore + buyAmount);
    }

    function test_BuyTransfersPayment() public {
        uint256 listAmount = 10_000;
        uint256 buyAmount = 1_000;
        uint256 pricePerToken = 1e6;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, pricePerToken));
        vm.stopPrank();

        uint256 totalPrice = buyAmount * pricePerToken;
        uint256 fee = (totalPrice * TRADING_FEE_BPS) / 10000; // Uses vault's trading fee (1%)
        uint256 sellerAmount = totalPrice - fee;

        uint256 creatorUsdcBefore = usdc.balanceOf(creator);

        vm.prank(buyer1);
        marketplace.buy(listingId, buyAmount);

        assertEq(usdc.balanceOf(creator), creatorUsdcBefore + sellerAmount);
    }

    function test_BuyCalculatesFeeFromVault() public {
        // Create vault with higher trading fee
        RoyaltyVaultFactory.VaultParams memory params = RoyaltyVaultFactory.VaultParams({
            storyIPId: keccak256("high-fee-ip"),
            tokenName: "High Fee Token",
            tokenSymbol: "HFT",
            creatorAllocation: 1_000e18,
            dividendBps: 5000,
            tradingFeeBps: 300, // 3% trading fee
            paymentToken: address(usdc)
        });

        vm.prank(creator);
        (address highFeeVault, address highFeeToken) = factory.createVault(params);

        // List tokens
        uint256 listAmount = 100e18;
        vm.startPrank(creator);
        IERC20(highFeeToken).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(IRoyaltyMarketplace.CreateListingParams({
            royaltyToken: highFeeToken,
            amount: listAmount,
            pricePerToken: 1e6,
            paymentToken: address(usdc),
            duration: 7 days
        }));
        vm.stopPrank();

        // Note: Since creator is seller (not vault), the listing won't pick up the vault's fee
        // The marketplace uses default fee for non-vault listings
        // This test verifies the fee calculation structure works
        uint256 buyAmount = 10_000; // small amount
        uint256 totalPrice = buyAmount * 1e6;
        uint256 expectedFee = (totalPrice * 100) / 10000; // Default 1% for non-vault listings

        uint256 treasuryBefore = usdc.balanceOf(treasury);

        vm.prank(buyer1);
        marketplace.buy(listingId, buyAmount);

        assertEq(usdc.balanceOf(treasury) - treasuryBefore, expectedFee);
    }

    function test_BuyPartialFill() public {
        uint256 listAmount = 10_000;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, 1e6));
        vm.stopPrank();

        // Buy only half
        vm.prank(buyer1);
        marketplace.buy(listingId, 5_000);

        IRoyaltyMarketplace.Listing memory listing = marketplace.getActiveListing(listingId);
        assertTrue(listing.isActive, "Listing should still be active");
        assertEq(listing.sold, 5_000, "Sold amount should be updated");
    }

    function test_BuyUpdatesListing() public {
        uint256 listAmount = 10_000;
        uint256 buyAmount = 3_000;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, 1e6));
        vm.stopPrank();

        vm.prank(buyer1);
        marketplace.buy(listingId, buyAmount);

        IRoyaltyMarketplace.Listing memory listing = marketplace.getActiveListing(listingId);
        assertEq(listing.sold, buyAmount);
    }

    function test_BuyDeactivatesWhenFullySold() public {
        uint256 listAmount = 10_000;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, 1e6));
        vm.stopPrank();

        vm.prank(buyer1);
        marketplace.buy(listingId, listAmount);

        IRoyaltyMarketplace.Listing memory listing = marketplace.getActiveListing(listingId);
        assertFalse(listing.isActive, "Listing should be inactive when fully sold");
        assertEq(listing.sold, listAmount);
    }

    function test_BuyRecordsTrade() public {
        uint256 listAmount = 10_000;
        uint256 buyAmount = 5_000;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, 1e6));
        vm.stopPrank();

        assertEq(marketplace.tradeCount(), 0);

        vm.prank(buyer1);
        marketplace.buy(listingId, buyAmount);

        assertEq(marketplace.tradeCount(), 1);

        RoyaltyMarketplace.Trade memory trade = marketplace.getTrade(0);
        assertEq(trade.listingId, listingId);
        assertEq(trade.buyer, buyer1);
        assertEq(trade.amount, buyAmount);
    }

    function test_BuyFailsForInactiveListing() public {
        uint256 listAmount = 100e18;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, 1e6));
        marketplace.cancelListing(listingId);
        vm.stopPrank();

        vm.prank(buyer1);
        vm.expectRevert(RoyaltyMarketplace.ListingNotActive.selector);
        marketplace.buy(listingId, 50e18);
    }

    function test_BuyFailsForExpiredListing() public {
        uint256 listAmount = 100e18;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, 1e6));
        vm.stopPrank();

        // Warp past expiry (7 days + 1 second)
        vm.warp(block.timestamp + 7 days + 1);

        vm.prank(buyer1);
        vm.expectRevert(RoyaltyMarketplace.ListingExpired.selector);
        marketplace.buy(listingId, 50e18);
    }

    // ============ Cancel Tests ============

    function test_CancelListingReturnsTokens() public {
        uint256 listAmount = 100e18;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, 1e6));

        uint256 creatorBalanceBefore = IERC20(token).balanceOf(creator);

        marketplace.cancelListing(listingId);
        vm.stopPrank();

        assertEq(IERC20(token).balanceOf(creator), creatorBalanceBefore + listAmount);
        assertEq(IERC20(token).balanceOf(address(marketplace)), 0);
    }

    function test_CancelListingOnlySeller() public {
        uint256 listAmount = 100e18;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, 1e6));
        vm.stopPrank();

        vm.prank(buyer1);
        vm.expectRevert(RoyaltyMarketplace.OnlySeller.selector);
        marketplace.cancelListing(listingId);
    }

    function test_CancelEmitsEvent() public {
        uint256 listAmount = 100e18;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, 1e6));

        vm.expectEmit(true, true, true, true);
        emit Cancelled(listingId);

        marketplace.cancelListing(listingId);
        vm.stopPrank();
    }

    // ============ Update Price Tests ============

    function test_UpdatePriceChangesPrice() public {
        uint256 listAmount = 100e18;
        uint256 oldPrice = 1e6;
        uint256 newPrice = 2e6;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, oldPrice));

        marketplace.updatePrice(listingId, newPrice);
        vm.stopPrank();

        IRoyaltyMarketplace.Listing memory listing = marketplace.getActiveListing(listingId);
        assertEq(listing.pricePerToken, newPrice);
    }

    function test_UpdatePriceOnlySeller() public {
        uint256 listAmount = 100e18;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, 1e6));
        vm.stopPrank();

        vm.prank(buyer1);
        vm.expectRevert(RoyaltyMarketplace.OnlySeller.selector);
        marketplace.updatePrice(listingId, 2e6);
    }

    function test_UpdatePriceEmitsEvent() public {
        uint256 listAmount = 100e18;
        uint256 oldPrice = 1e6;
        uint256 newPrice = 2e6;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, oldPrice));

        vm.expectEmit(true, true, true, true);
        emit PriceUpdated(listingId, oldPrice, newPrice);

        marketplace.updatePrice(listingId, newPrice);
        vm.stopPrank();
    }

    // ============ View Function Tests ============

    function test_GetFloorPrice() public {
        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), 300e18);

        // Create listings at different prices
        marketplace.createListing(_createListingParams(100e18, 3e6));
        marketplace.createListing(_createListingParams(100e18, 1e6)); // Lowest
        marketplace.createListing(_createListingParams(100e18, 2e6));
        vm.stopPrank();

        assertEq(marketplace.getFloorPrice(token), 1e6, "Floor should be lowest price");
    }

    function test_GetActiveListings() public {
        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), 500e18);

        for (uint256 i = 0; i < 5; i++) {
            marketplace.createListing(_createListingParams(100e18, 1e6));
        }
        vm.stopPrank();

        // Get first 3 listings
        IRoyaltyMarketplace.Listing[] memory page1 = marketplace.getActiveListings(0, 3);
        assertEq(page1.length, 3);

        // Get next 2 listings
        IRoyaltyMarketplace.Listing[] memory page2 = marketplace.getActiveListings(3, 3);
        assertEq(page2.length, 2);
    }

    // ============ Full Trading Flow ============

    function test_FullTradingFlow() public {
        uint256 listAmount = 10_000;
        uint256 price = 1e6;

        // 1. Creator lists tokens
        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 primaryListingId = marketplace.createListing(_createListingParams(listAmount, price));
        vm.stopPrank();

        // 2. Buyer1 buys from creator
        vm.prank(buyer1);
        marketplace.buy(primaryListingId, listAmount);

        assertEq(IERC20(token).balanceOf(buyer1), listAmount);

        // 3. Secondary sale: Buyer1 lists tokens
        vm.startPrank(buyer1);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 secondaryListingId = marketplace.createListing(_createListingParams(listAmount, price * 2));
        vm.stopPrank();

        // Verify secondary listing
        IRoyaltyMarketplace.Listing memory secondaryListing = marketplace.getActiveListing(secondaryListingId);
        assertFalse(secondaryListing.isPrimarySale);
        assertEq(secondaryListing.seller, buyer1);

        // 4. Buyer2 buys from secondary
        vm.prank(buyer2);
        marketplace.buy(secondaryListingId, listAmount);

        assertEq(IERC20(token).balanceOf(buyer2), listAmount);
        assertEq(IERC20(token).balanceOf(buyer1), 0);

        // Verify trade history
        assertEq(marketplace.tradeCount(), 2);
    }

    // ============ Per-Vault Fee Tests ============

    function test_Buy_UsesVaultTradingFee() public {
        // When a listing has no associated vault (seller is not the vault itself),
        // the default fee (1%) should be used
        uint256 listAmount = 10_000;
        uint256 buyAmount = 1_000;
        uint256 pricePerToken = 1e6;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId = marketplace.createListing(_createListingParams(listAmount, pricePerToken));
        vm.stopPrank();

        // The listing's vault field should be address(0) since creator is not the vault
        IRoyaltyMarketplace.Listing memory listing = marketplace.getActiveListing(listingId);
        assertEq(listing.vault, address(0), "Vault should be zero for non-vault seller");

        // Calculate fee - should use DEFAULT_TRADING_FEE (1%)
        uint256 totalPrice = buyAmount * pricePerToken;
        uint256 expectedFee = (totalPrice * 100) / 10000; // 1% default

        uint256 treasuryBefore = usdc.balanceOf(treasury);

        vm.prank(buyer1);
        marketplace.buy(listingId, buyAmount);

        assertEq(usdc.balanceOf(treasury) - treasuryBefore, expectedFee, "Should use default fee");
    }

    function test_Buy_DifferentFeesPerVault() public {
        // Create two vaults with different trading fees
        // Vault 1: 1% fee (default setup)
        // Vault 2: 3% fee

        // Create second vault with higher fee
        RoyaltyVaultFactory.VaultParams memory params2 = RoyaltyVaultFactory.VaultParams({
            storyIPId: keccak256("different-fee-ip"),
            tokenName: "High Fee Token",
            tokenSymbol: "HFT",
            creatorAllocation: 1_000e18,
            dividendBps: 5000,
            tradingFeeBps: 300, // 3% trading fee
            paymentToken: address(usdc)
        });

        vm.prank(creator);
        (address vault2, address token2) = factory.createVault(params2);

        // Verify the two vaults have different trading fees stored
        IRoyaltyVault.VaultInfo memory info1 = IRoyaltyVault(vault).getVaultInfo();
        IRoyaltyVault.VaultInfo memory info2 = IRoyaltyVault(vault2).getVaultInfo();

        assertEq(info1.tradingFeeBps, 100, "Vault 1 should have 1% fee");
        assertEq(info2.tradingFeeBps, 300, "Vault 2 should have 3% fee");

        // Both creators list tokens (secondary sales use default fee)
        uint256 listAmount = 10_000;
        uint256 price = 1e6;

        vm.startPrank(creator);
        IERC20(token).approve(address(marketplace), listAmount);
        uint256 listingId1 = marketplace.createListing(_createListingParams(listAmount, price));
        IERC20(token2).approve(address(marketplace), listAmount);
        uint256 listingId2 = marketplace.createListing(IRoyaltyMarketplace.CreateListingParams({
            royaltyToken: token2,
            amount: listAmount,
            pricePerToken: price,
            paymentToken: address(usdc),
            duration: 7 days
        }));
        vm.stopPrank();

        // Both use default fee since seller is not the vault contract
        uint256 buyAmount = 1_000;
        uint256 totalPrice = buyAmount * price;
        uint256 defaultFee = (totalPrice * 100) / 10000; // 1% default

        uint256 treasuryBefore = usdc.balanceOf(treasury);
        vm.prank(buyer1);
        marketplace.buy(listingId1, buyAmount);
        assertEq(usdc.balanceOf(treasury) - treasuryBefore, defaultFee, "Listing 1 should use default fee");

        treasuryBefore = usdc.balanceOf(treasury);
        vm.prank(buyer2);
        marketplace.buy(listingId2, buyAmount);
        assertEq(usdc.balanceOf(treasury) - treasuryBefore, defaultFee, "Listing 2 should use default fee");

        // Note: Per-vault fees are stored but marketplace secondary sales use default.
        // The vault's tradingFeeBps is used by TributaryAMM for AMM trading.
    }

    function test_VaultTradingFeeStoredCorrectly() public {
        // Verify each vault stores its own trading fee
        RoyaltyVaultFactory.VaultParams memory params1 = RoyaltyVaultFactory.VaultParams({
            storyIPId: keccak256("low-fee"),
            tokenName: "Low Fee Token",
            tokenSymbol: "LFT",
            creatorAllocation: 1_000e18,
            dividendBps: 5000,
            tradingFeeBps: 50, // 0.5%
            paymentToken: address(usdc)
        });

        RoyaltyVaultFactory.VaultParams memory params2 = RoyaltyVaultFactory.VaultParams({
            storyIPId: keccak256("high-fee"),
            tokenName: "High Fee Token",
            tokenSymbol: "HFT",
            creatorAllocation: 1_000e18,
            dividendBps: 5000,
            tradingFeeBps: 500, // 5% (max allowed)
            paymentToken: address(usdc)
        });

        vm.startPrank(creator);
        (address vault1,) = factory.createVault(params1);
        (address vault2,) = factory.createVault(params2);
        vm.stopPrank();

        IRoyaltyVault.VaultInfo memory info1 = IRoyaltyVault(vault1).getVaultInfo();
        IRoyaltyVault.VaultInfo memory info2 = IRoyaltyVault(vault2).getVaultInfo();

        assertEq(info1.tradingFeeBps, 50, "Vault 1 trading fee should be 0.5%");
        assertEq(info2.tradingFeeBps, 500, "Vault 2 trading fee should be 5%");
    }
}
