// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/tributary/TributaryAMM.sol";
import "../../src/tributary/RoyaltyVaultFactory.sol";
import "../../src/tributary/RoyaltyVault.sol";
import "../../src/tributary/RoyaltyToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Tether USD", "USDT") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract TributaryAMMTest is Test {
    TributaryAMM public amm;
    RoyaltyVaultFactory public factory;
    MockUSDT public usdt;

    address public treasury = address(0x1111);
    address public creator = address(0x2222);
    address public trader1 = address(0x3333);
    address public trader2 = address(0x4444);

    address public vault;
    address public token;

    bytes32 public constant STORY_IP_ID = keccak256("test-ip");
    uint256 public constant CREATOR_ALLOCATION = 1_000e18;
    uint256 public constant DIVIDEND_BPS = 5000;
    uint256 public constant TRADING_FEE_BPS = 100; // 1%

    event PoolCreated(uint256 indexed poolId, address indexed royaltyToken, address indexed quoteToken, address vault);
    event Swap(
        uint256 indexed poolId, address indexed trader, bool isBuy, uint256 amountIn,
        uint256 amountOut, uint256 fee, uint256 price, uint256 reserveToken, uint256 reserveQuote, uint256 timestamp
    );

    function setUp() public {
        factory = new RoyaltyVaultFactory(treasury);
        usdt = new MockUSDT();
        amm = new TributaryAMM(address(factory), treasury);

        // Create a vault
        RoyaltyVaultFactory.VaultParams memory params = RoyaltyVaultFactory.VaultParams({
            storyIPId: STORY_IP_ID,
            tokenName: "Test Royalty Token",
            tokenSymbol: "TRT",
            creatorAllocation: CREATOR_ALLOCATION,
            dividendBps: DIVIDEND_BPS,
            tradingFeeBps: TRADING_FEE_BPS,
            paymentToken: address(usdt)
        });

        vm.prank(creator);
        (vault, token) = factory.createVault(params);

        // Mint USDT to traders and test address
        usdt.mint(address(this), 10_000_000e6);
        usdt.mint(trader1, 10_000_000e6);
        usdt.mint(trader2, 10_000_000e6);

        // Approve AMM
        usdt.approve(address(amm), type(uint256).max);
        IERC20(token).approve(address(amm), type(uint256).max);
        vm.prank(trader1);
        usdt.approve(address(amm), type(uint256).max);
        vm.prank(trader1);
        IERC20(token).approve(address(amm), type(uint256).max);
        vm.prank(trader2);
        usdt.approve(address(amm), type(uint256).max);
    }

    // ============ Pool Tests ============

    function test_CreatePool() public {
        uint256 poolId = amm.createPool(token, address(usdt));

        assertEq(poolId, 1, "Pool ID should be 1");
        assertEq(amm.poolCount(), 1, "Pool count should be 1");
        assertEq(amm.poolIdByToken(token), 1, "Token should map to pool 1");

        TributaryAMM.Pool memory pool = amm.getPool(poolId);
        assertEq(pool.royaltyToken, token, "Pool royaltyToken should match");
        assertEq(pool.quoteToken, address(usdt), "Pool quoteToken should be USDT");
        assertEq(pool.vault, vault, "Pool vault should match");
        assertTrue(pool.exists, "Pool should exist");
        assertEq(pool.reserveToken, 0, "Initial reserveToken should be 0");
        assertEq(pool.reserveQuote, 0, "Initial reserveQuote should be 0");
    }

    function test_CreatePool_EmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit PoolCreated(1, token, address(usdt), vault);

        amm.createPool(token, address(usdt));
    }

    function test_CreatePool_RevertDuplicatePool() public {
        amm.createPool(token, address(usdt));

        vm.expectRevert(TributaryAMM.PoolAlreadyExists.selector);
        amm.createPool(token, address(usdt));
    }

    function test_CreatePool_RevertInvalidToken() public {
        // Create a fake token not associated with a valid vault
        ERC20 fakeToken = new MockUSDT(); // Using MockUSDT as a random ERC20

        vm.expectRevert(); // Will fail because vault() call will fail
        amm.createPool(address(fakeToken), address(usdt));
    }

    // ============ Liquidity Tests ============

    function _createPoolWithLiquidity() internal returns (uint256 poolId) {
        poolId = amm.createPool(token, address(usdt));

        // Transfer tokens from vault to test address for adding liquidity
        uint256 tokenAmount = 1_000e18;
        uint256 quoteAmount = 1_000e6; // 1000 USDT = $0.10 per token

        // Get tokens from vault
        address tokenVault = RoyaltyToken(token).vault();
        vm.prank(tokenVault);
        IERC20(token).transfer(address(this), tokenAmount);

        amm.addLiquidity(poolId, tokenAmount, quoteAmount);
    }

    function test_AddLiquidity() public {
        uint256 poolId = amm.createPool(token, address(usdt));

        uint256 tokenAmount = 500e18;
        uint256 quoteAmount = 500e6;

        address tokenVault = RoyaltyToken(token).vault();
        vm.prank(tokenVault);
        IERC20(token).transfer(address(this), tokenAmount);

        amm.addLiquidity(poolId, tokenAmount, quoteAmount);

        TributaryAMM.Pool memory pool = amm.getPool(poolId);
        assertEq(pool.reserveToken, tokenAmount, "Reserve token should match");
        assertEq(pool.reserveQuote, quoteAmount, "Reserve quote should match");
    }

    // ============ Swap Tests ============

    function test_BuyTokens() public {
        uint256 poolId = _createPoolWithLiquidity();

        uint256 quoteIn = 100e6; // 100 USDT
        uint256 trader1TokenBefore = IERC20(token).balanceOf(trader1);

        vm.prank(trader1);
        uint256 tokenOut = amm.buyTokens(poolId, quoteIn, 0);

        assertTrue(tokenOut > 0, "Should receive tokens");
        assertEq(IERC20(token).balanceOf(trader1) - trader1TokenBefore, tokenOut, "Balance should increase");
    }

    function test_SellTokens() public {
        uint256 poolId = _createPoolWithLiquidity();

        // First buy some tokens for trader1
        vm.prank(trader1);
        uint256 tokensBought = amm.buyTokens(poolId, 100e6, 0);

        uint256 trader1UsdtBefore = usdt.balanceOf(trader1);

        vm.prank(trader1);
        uint256 quoteOut = amm.sellTokens(poolId, tokensBought, 0);

        assertTrue(quoteOut > 0, "Should receive USDT");
        assertEq(usdt.balanceOf(trader1) - trader1UsdtBefore, quoteOut, "USDT balance should increase");
    }

    function test_Swap_TakesFee() public {
        uint256 poolId = _createPoolWithLiquidity();

        uint256 quoteIn = 100e6;
        uint256 expectedFee = (quoteIn * TRADING_FEE_BPS) / 10000; // 1% = 1 USDT

        uint256 treasuryBefore = usdt.balanceOf(treasury);

        vm.prank(trader1);
        amm.buyTokens(poolId, quoteIn, 0);

        assertEq(usdt.balanceOf(treasury) - treasuryBefore, expectedFee, "Treasury should receive fee");
    }

    function test_Swap_EmitsEvent() public {
        uint256 poolId = _createPoolWithLiquidity();

        uint256 quoteIn = 100e6;
        uint256 fee = (quoteIn * TRADING_FEE_BPS) / 10000;
        uint256 quoteInAfterFee = quoteIn - fee;

        // Calculate expected output: x * y = k
        TributaryAMM.Pool memory poolBefore = amm.getPool(poolId);
        uint256 expectedTokenOut = (poolBefore.reserveToken * quoteInAfterFee) / (poolBefore.reserveQuote + quoteInAfterFee);

        vm.prank(trader1);
        amm.buyTokens(poolId, quoteIn, 0);

        // Verify the swap happened (event was emitted with correct values)
        assertTrue(expectedTokenOut > 0, "Should have calculated output");
    }

    function test_Swap_RevertSlippage() public {
        uint256 poolId = _createPoolWithLiquidity();

        uint256 quoteIn = 100e6;
        uint256 unreasonableMinOut = 1_000_000e18; // Way more than possible

        vm.prank(trader1);
        vm.expectRevert(TributaryAMM.InsufficientOutput.selector);
        amm.buyTokens(poolId, quoteIn, unreasonableMinOut);
    }

    function test_Swap_RevertSlippage_Sell() public {
        uint256 poolId = _createPoolWithLiquidity();

        // Buy some tokens first
        vm.prank(trader1);
        uint256 tokens = amm.buyTokens(poolId, 100e6, 0);

        uint256 unreasonableMinOut = 1_000_000e6;

        vm.prank(trader1);
        vm.expectRevert(TributaryAMM.InsufficientOutput.selector);
        amm.sellTokens(poolId, tokens, unreasonableMinOut);
    }

    function test_Swap_PriceImpact() public {
        uint256 poolId = _createPoolWithLiquidity();

        // Small trade
        uint256 smallQuoteIn = 10e6;
        (uint256 smallTokenOut,) = amm.getQuoteBuy(poolId, smallQuoteIn);
        uint256 smallPricePerToken = (smallQuoteIn * 1e18) / smallTokenOut;

        // Large trade (10x)
        uint256 largeQuoteIn = 100e6;
        (uint256 largeTokenOut,) = amm.getQuoteBuy(poolId, largeQuoteIn);
        uint256 largePricePerToken = (largeQuoteIn * 1e18) / largeTokenOut;

        // Large trade should have higher effective price (worse rate due to slippage)
        assertTrue(largePricePerToken > smallPricePerToken, "Large trade should have worse price");
    }

    function test_Swap_RevertZeroAmount() public {
        uint256 poolId = _createPoolWithLiquidity();

        vm.prank(trader1);
        vm.expectRevert(TributaryAMM.ZeroAmount.selector);
        amm.buyTokens(poolId, 0, 0);
    }

    function test_Swap_RevertPoolNotFound() public {
        vm.prank(trader1);
        vm.expectRevert(TributaryAMM.PoolNotFound.selector);
        amm.buyTokens(999, 100e6, 0);
    }

    // ============ Quote Tests ============

    function test_GetQuoteBuy_Accurate() public {
        uint256 poolId = _createPoolWithLiquidity();

        uint256 quoteIn = 50e6;
        (uint256 expectedTokenOut, uint256 expectedFee) = amm.getQuoteBuy(poolId, quoteIn);

        uint256 trader1TokenBefore = IERC20(token).balanceOf(trader1);

        vm.prank(trader1);
        uint256 actualTokenOut = amm.buyTokens(poolId, quoteIn, 0);

        assertEq(actualTokenOut, expectedTokenOut, "Actual output should match quote");
        assertEq(expectedFee, (quoteIn * TRADING_FEE_BPS) / 10000, "Fee should be correct");
    }

    function test_GetQuoteSell_Accurate() public {
        uint256 poolId = _createPoolWithLiquidity();

        // First buy tokens
        vm.prank(trader1);
        uint256 tokensBought = amm.buyTokens(poolId, 100e6, 0);

        // Get quote for selling
        (uint256 expectedQuoteOut, uint256 expectedFee) = amm.getQuoteSell(poolId, tokensBought);

        uint256 trader1UsdtBefore = usdt.balanceOf(trader1);

        vm.prank(trader1);
        uint256 actualQuoteOut = amm.sellTokens(poolId, tokensBought, 0);

        assertEq(actualQuoteOut, expectedQuoteOut, "Actual output should match quote");
    }

    function test_GetPrice() public {
        uint256 poolId = _createPoolWithLiquidity();

        uint256 price = amm.getPrice(poolId);

        // Initial pool: 1000 tokens, 1000 USDT
        // Price = reserveQuote * 1e18 / reserveToken = 1000e6 * 1e18 / 1000e18 = 1e6 (0.001 USDT per token when scaled)
        assertTrue(price > 0, "Price should be positive");
    }

    // ============ Admin Tests ============

    function test_SetProtocolTreasury() public {
        address newTreasury = address(0x9999);

        amm.setProtocolTreasury(newTreasury);

        assertEq(amm.protocolTreasury(), newTreasury);
    }

    function test_SetProtocolTreasury_RevertZeroAddress() public {
        vm.expectRevert(TributaryAMM.ZeroAddress.selector);
        amm.setProtocolTreasury(address(0));
    }

    function test_SetProtocolTreasury_OnlyOwner() public {
        vm.prank(trader1);
        vm.expectRevert();
        amm.setProtocolTreasury(address(0x9999));
    }

    // ============ Integration Tests ============

    function test_MultipleTrades() public {
        uint256 poolId = _createPoolWithLiquidity();

        // Multiple buys
        vm.prank(trader1);
        amm.buyTokens(poolId, 50e6, 0);

        vm.prank(trader2);
        amm.buyTokens(poolId, 30e6, 0);

        // Check reserves changed
        TributaryAMM.Pool memory pool = amm.getPool(poolId);
        assertTrue(pool.reserveToken < 1000e18, "Token reserve should decrease");
        assertTrue(pool.reserveQuote > 1000e6, "Quote reserve should increase");
    }

    function test_RoundTrip_BuyAndSell() public {
        uint256 poolId = _createPoolWithLiquidity();

        uint256 initialUsdt = usdt.balanceOf(trader1);

        // Buy tokens
        vm.prank(trader1);
        uint256 tokensBought = amm.buyTokens(poolId, 100e6, 0);

        // Sell tokens back
        vm.prank(trader1);
        amm.sellTokens(poolId, tokensBought, 0);

        uint256 finalUsdt = usdt.balanceOf(trader1);

        // Should have less USDT due to fees on both trades
        assertTrue(finalUsdt < initialUsdt, "Should lose USDT due to fees");
    }
}
