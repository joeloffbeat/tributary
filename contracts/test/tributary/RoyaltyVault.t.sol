// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/tributary/RoyaltyVault.sol";
import "../../src/tributary/RoyaltyToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Mock USDC token for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract RoyaltyVaultTest is Test {
    RoyaltyVault public vault;
    RoyaltyToken public token;
    MockUSDC public usdc;

    address public creator = address(0x1111);
    address public treasury = address(0x2222);
    address public holder1 = address(0x3333);
    address public holder2 = address(0x4444);
    address public holder3 = address(0x5555);

    bytes32 public constant STORY_IP_ID = keccak256("test-ip-id");
    uint256 public constant TOTAL_SUPPLY = 10_000e18; // Fixed supply
    uint256 public constant CREATOR_ALLOCATION = 1_000e18; // 10%
    uint256 public constant DIVIDEND_BPS = 5000; // 50% to token holders
    uint256 public constant TRADING_FEE_BPS = 100; // 1%

    event RoyaltyReceived(
        uint256 amount,
        uint256 protocolFee,
        uint256 dividendAmount,
        uint256 creatorAmount,
        uint256 timestamp
    );
    event RoyaltyDistributed(uint256 indexed distributionId, uint256 amount, uint256 snapshotId);
    event Claimed(address indexed holder, uint256 indexed distributionId, uint256 amount);
    event VaultPaused(address indexed by);
    event VaultUnpaused(address indexed by);

    function setUp() public {
        // Deploy mock USDC
        usdc = new MockUSDC();

        // Deploy RoyaltyToken (vault will be address(this) initially)
        // We compute the vault address first
        address expectedVault = vm.computeCreateAddress(address(this), vm.getNonce(address(this)) + 1);

        token = new RoyaltyToken(
            "Test Royalty Token",
            "TRT",
            expectedVault,
            creator,
            STORY_IP_ID,
            TOTAL_SUPPLY,
            CREATOR_ALLOCATION
        );

        // Deploy RoyaltyVault with new parameters
        vault = new RoyaltyVault(
            STORY_IP_ID,
            creator,
            address(token),
            address(usdc),
            treasury,
            DIVIDEND_BPS,
            TRADING_FEE_BPS
        );

        // Distribute tokens to holders from vault
        uint256 vaultBalance = token.balanceOf(address(vault));
        vm.startPrank(address(vault));
        token.transfer(holder1, vaultBalance * 30 / 100); // 30%
        token.transfer(holder2, vaultBalance * 20 / 100); // 20%
        token.transfer(holder3, vaultBalance * 10 / 100); // 10%
        vm.stopPrank();
        // Remaining 40% stays in vault

        // Mint USDC to test accounts
        usdc.mint(address(this), 1_000_000e6);
        usdc.mint(holder1, 1_000_000e6);
        usdc.approve(address(vault), type(uint256).max);
    }

    // ============ Deposit Tests ============

    function test_DepositRoyalty() public {
        uint256 depositAmount = 100e6; // 100 USDC
        uint256 expectedProtocolFee = (depositAmount * 200) / 10000; // 2%
        uint256 afterProtocolFee = depositAmount - expectedProtocolFee;
        uint256 expectedDividend = (afterProtocolFee * DIVIDEND_BPS) / 10000; // 50% of after-fee
        uint256 expectedCreator = afterProtocolFee - expectedDividend;

        vm.expectEmit(true, true, true, true);
        emit RoyaltyReceived(depositAmount, expectedProtocolFee, expectedDividend, expectedCreator, block.timestamp);

        vault.depositRoyalty(depositAmount);

        RoyaltyVault.VaultInfo memory info = vault.getVaultInfo();
        assertEq(info.totalDeposited, depositAmount);
        assertEq(info.pendingDistribution, expectedDividend);
    }

    function test_DepositSplitsCorrectly() public {
        uint256 depositAmount = 100e6; // 100 USDC
        // Protocol fee: 2% = 2 USDC
        // After fee: 98 USDC
        // Dividend (50%): 49 USDC
        // Creator (50%): 49 USDC
        uint256 expectedProtocolFee = 2e6;
        uint256 expectedDividend = 49e6;
        uint256 expectedCreatorAmount = 49e6;

        uint256 creatorBalanceBefore = usdc.balanceOf(creator);
        uint256 treasuryBalanceBefore = usdc.balanceOf(treasury);

        vault.depositRoyalty(depositAmount);

        RoyaltyVault.VaultInfo memory info = vault.getVaultInfo();
        assertEq(info.pendingDistribution, expectedDividend);
        assertEq(usdc.balanceOf(treasury) - treasuryBalanceBefore, expectedProtocolFee);
        assertEq(usdc.balanceOf(creator) - creatorBalanceBefore, expectedCreatorAmount);
    }

    function test_DepositFailsWithZeroAmount() public {
        vm.expectRevert(RoyaltyVault.ZeroAmount.selector);
        vault.depositRoyalty(0);
    }

    function test_MultipleDepositsAccumulate() public {
        vault.depositRoyalty(100e6);
        vault.depositRoyalty(50e6);
        vault.depositRoyalty(25e6);

        // Total deposited = 175 USDC
        RoyaltyVault.VaultInfo memory info = vault.getVaultInfo();
        assertEq(info.totalDeposited, 175e6);
        // Each deposit: net * 50% goes to pending
        // 100: protocol=2, after=98, dividend=49
        // 50: protocol=1, after=49, dividend=24.5 -> 24 (rounded)
        // 25: protocol=0.5, after=24.5, dividend=12.25 -> 12 (rounded)
        // But Solidity rounds down: 49 + 24 + 12 = 85
        uint256 expectedPending = 49e6 + 245e5 + 1225e4; // account for rounding
        assertApproxEqAbs(info.pendingDistribution, expectedPending, 1e6);
    }

    // ============ Distribution Tests ============

    function test_DistributeCreateSnapshot() public {
        vault.depositRoyalty(100e6);

        uint256 snapshotBefore = token.getCurrentSnapshotId();
        vault.distribute();
        uint256 snapshotAfter = token.getCurrentSnapshotId();

        assertEq(snapshotAfter, snapshotBefore + 1);
    }

    function test_DistributeCreatesDistributionRecord() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        RoyaltyVault.Distribution memory dist = vault.getDistribution(0);
        assertEq(dist.snapshotId, 1);
        assertEq(dist.amount, 49e6); // 50% of 98 USDC
        assertEq(dist.timestamp, block.timestamp);
        assertEq(dist.totalClaimed, 0);
    }

    function test_DistributeResetsPending() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        RoyaltyVault.VaultInfo memory info = vault.getVaultInfo();
        assertEq(info.pendingDistribution, 0);
    }

    function test_DistributeEmitsEvent() public {
        vault.depositRoyalty(100e6);

        vm.expectEmit(true, true, true, true);
        emit RoyaltyDistributed(0, 49e6, 1);

        vault.distribute();
    }

    function test_DistributeFailsWithNoPending() public {
        vm.expectRevert(RoyaltyVault.NothingToDistribute.selector);
        vault.distribute();
    }

    function test_DistributeIncrementCount() public {
        vault.depositRoyalty(100e6);
        assertEq(vault.distributionCount(), 0);

        vault.distribute();
        assertEq(vault.distributionCount(), 1);

        vault.depositRoyalty(50e6);
        vault.distribute();
        assertEq(vault.distributionCount(), 2);
    }

    // ============ Claim Tests ============

    function test_ClaimCalculatesCorrectShare() public {
        // Deposit and distribute
        vault.depositRoyalty(100e6);
        vault.distribute();

        // Trigger snapshot recording for holders
        vm.prank(holder1);
        token.transfer(holder2, 1e18);

        // holder1 has 30% of vault balance (which is 90% of total)
        // So holder1 has ~27% of total supply
        uint256 holder1Balance = token.balanceOfAt(holder1, 1);
        uint256 totalSupply = token.totalSupplyAt(1);
        uint256 expectedShare = (49e6 * holder1Balance) / totalSupply;

        uint256 pending = vault.pendingRewardsForDistribution(holder1, 0);
        assertEq(pending, expectedShare);
    }

    function test_ClaimTransfersTokens() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        // Trigger snapshot recording
        vm.prank(holder1);
        token.transfer(holder2, 1e18);

        uint256 balanceBefore = usdc.balanceOf(holder1);
        uint256 expectedClaim = vault.pendingRewardsForDistribution(holder1, 0);

        vm.prank(holder1);
        vault.claim(0);

        assertEq(usdc.balanceOf(holder1) - balanceBefore, expectedClaim);
    }

    function test_ClaimMarksAsClaimed() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        vm.prank(holder1);
        token.transfer(holder2, 1e18);

        assertFalse(vault.claimed(holder1, 0));

        vm.prank(holder1);
        vault.claim(0);

        assertTrue(vault.claimed(holder1, 0));
    }

    function test_ClaimEmitsEvent() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        vm.prank(holder1);
        token.transfer(holder2, 1e18);

        uint256 expectedAmount = vault.pendingRewardsForDistribution(holder1, 0);

        vm.expectEmit(true, true, true, true);
        emit Claimed(holder1, 0, expectedAmount);

        vm.prank(holder1);
        vault.claim(0);
    }

    function test_ClaimFailsIfAlreadyClaimed() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        vm.prank(holder1);
        token.transfer(holder2, 1e18);

        vm.prank(holder1);
        vault.claim(0);

        vm.prank(holder1);
        vm.expectRevert(RoyaltyVault.NothingToClaim.selector);
        vault.claim(0);
    }

    function test_ClaimFailsForNonHolder() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        // Random address with no tokens
        address noTokens = address(0x9999);

        vm.prank(noTokens);
        vm.expectRevert(RoyaltyVault.NothingToClaim.selector);
        vault.claim(0);
    }

    function test_ClaimMultipleDistributions() public {
        // First distribution
        vault.depositRoyalty(100e6);
        vault.distribute();

        // Second distribution
        vault.depositRoyalty(50e6);
        vault.distribute();

        // Trigger snapshot recording for both
        vm.prank(holder1);
        token.transfer(holder2, 1e18);

        uint256 expected0 = vault.pendingRewardsForDistribution(holder1, 0);
        uint256 expected1 = vault.pendingRewardsForDistribution(holder1, 1);
        uint256 totalExpected = expected0 + expected1;

        uint256 balanceBefore = usdc.balanceOf(holder1);

        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 1;

        vm.prank(holder1);
        uint256 claimed = vault.claimMultiple(ids);

        assertEq(claimed, totalExpected);
        assertEq(usdc.balanceOf(holder1) - balanceBefore, totalExpected);
    }

    // ============ Complex Scenario Tests ============

    function test_FullFlow_DepositDistributeClaim() public {
        // 1. Deposit royalties
        vault.depositRoyalty(1000e6);

        // 2. Distribute
        vault.distribute();

        // 3. Trigger checkpoint for all holders
        vm.prank(holder1);
        token.transfer(holder2, 1e18);
        vm.prank(holder2);
        token.transfer(holder3, 1e18);
        vm.prank(holder3);
        token.transfer(holder1, 1e18);

        // 4. All holders claim
        uint256 h1Pending = vault.pendingRewardsForDistribution(holder1, 0);
        uint256 h2Pending = vault.pendingRewardsForDistribution(holder2, 0);
        uint256 h3Pending = vault.pendingRewardsForDistribution(holder3, 0);

        vm.prank(holder1);
        vault.claim(0);
        vm.prank(holder2);
        vault.claim(0);
        vm.prank(holder3);
        vault.claim(0);

        // Verify all claimed
        assertTrue(vault.claimed(holder1, 0));
        assertTrue(vault.claimed(holder2, 0));
        assertTrue(vault.claimed(holder3, 0));

        // Verify distribution totalClaimed
        RoyaltyVault.Distribution memory dist = vault.getDistribution(0);
        assertEq(dist.totalClaimed, h1Pending + h2Pending + h3Pending);
    }

    function test_MultipleHolders_ProportionalShares() public {
        vault.depositRoyalty(1000e6);
        vault.distribute();

        // Trigger checkpoints
        vm.prank(holder1);
        token.transfer(address(this), 1e18);
        vm.prank(holder2);
        token.transfer(address(this), 1e18);
        vm.prank(holder3);
        token.transfer(address(this), 1e18);

        uint256 h1Share = vault.pendingRewardsForDistribution(holder1, 0);
        uint256 h2Share = vault.pendingRewardsForDistribution(holder2, 0);
        uint256 h3Share = vault.pendingRewardsForDistribution(holder3, 0);

        // holder1 has 30%, holder2 has 20%, holder3 has 10% (of vault balance = 90% of total)
        // Relative ratios should be 3:2:1
        assertApproxEqRel(h1Share * 2, h2Share * 3, 0.01e18); // h1/h2 ≈ 3/2
        assertApproxEqRel(h2Share, h3Share * 2, 0.01e18); // h2/h3 ≈ 2/1
    }

    function test_TokenTransferAfterSnapshot() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        // Record holder1's balance before any transfers
        vm.prank(holder1);
        token.transfer(address(this), 1e18);
        uint256 holder1Pending = vault.pendingRewardsForDistribution(holder1, 0);

        // holder1 transfers ALL tokens to holder2 AFTER snapshot
        uint256 holder1Balance = token.balanceOf(holder1);
        vm.prank(holder1);
        token.transfer(holder2, holder1Balance);

        // holder1 should still be able to claim (snapshot was before transfer)
        vm.prank(holder1);
        vault.claim(0);

        assertEq(vault.totalClaimedBy(holder1), holder1Pending);
    }

    function test_TokenTransferBeforeSnapshot() public {
        // holder1 transfers half their tokens to holder2 BEFORE deposit/distribute
        uint256 transferAmount = token.balanceOf(holder1) / 2;
        vm.prank(holder1);
        token.transfer(holder2, transferAmount);

        // Now deposit and distribute
        vault.depositRoyalty(100e6);
        vault.distribute();

        // Trigger checkpoints
        vm.prank(holder1);
        token.transfer(address(this), 1e18);
        vm.prank(holder2);
        token.transfer(address(this), 1e18);

        uint256 h1Pending = vault.pendingRewardsForDistribution(holder1, 0);
        uint256 h2Pending = vault.pendingRewardsForDistribution(holder2, 0);

        // holder2 should have significantly more due to transfer before snapshot
        assertTrue(h2Pending > h1Pending);
    }

    function test_MultipleDistributions_ClaimAll() public {
        // Create 3 distributions with checkpoint triggers after each
        for (uint256 i = 0; i < 3; i++) {
            vault.depositRoyalty(100e6);
            vault.distribute();

            // Trigger checkpoint recording after each snapshot
            vm.prank(holder1);
            token.transfer(address(this), 1e18);
        }

        // Claim all at once
        uint256[] memory ids = new uint256[](3);
        ids[0] = 0;
        ids[1] = 1;
        ids[2] = 2;

        uint256 totalExpected = vault.pendingRewards(holder1);
        assertTrue(totalExpected > 0, "Should have pending rewards");

        vm.prank(holder1);
        uint256 claimed = vault.claimMultiple(ids);

        assertEq(claimed, totalExpected);
        assertTrue(vault.claimed(holder1, 0));
        assertTrue(vault.claimed(holder1, 1));
        assertTrue(vault.claimed(holder1, 2));
    }

    // ============ Pause Tests ============

    function test_PauseByCreator() public {
        vm.prank(creator);
        vault.pause();

        assertTrue(vault.paused());
    }

    function test_PauseBlocksDeposit() public {
        vm.prank(creator);
        vault.pause();

        vm.expectRevert();
        vault.depositRoyalty(100e6);
    }

    function test_UnpauseByCreator() public {
        vm.prank(creator);
        vault.pause();

        vm.prank(creator);
        vault.unpause();

        assertFalse(vault.paused());
    }

    function test_PauseRevertsForNonCreator() public {
        vm.prank(holder1);
        vm.expectRevert(RoyaltyVault.OnlyCreator.selector);
        vault.pause();
    }

    function test_PauseEmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit VaultPaused(creator);

        vm.prank(creator);
        vault.pause();
    }

    function test_UnpauseEmitsEvent() public {
        vm.prank(creator);
        vault.pause();

        vm.expectEmit(true, true, true, true);
        emit VaultUnpaused(creator);

        vm.prank(creator);
        vault.unpause();
    }

    // ============ View Function Tests ============

    function test_PendingRewardsCalculation() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        vm.prank(holder1);
        token.transfer(address(this), 1e18);

        uint256 pending = vault.pendingRewards(holder1);
        uint256 pendingFor0 = vault.pendingRewardsForDistribution(holder1, 0);

        assertEq(pending, pendingFor0);
        assertTrue(pending > 0);
    }

    function test_GetVaultInfo() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        RoyaltyVault.VaultInfo memory info = vault.getVaultInfo();

        assertEq(info.storyIPId, STORY_IP_ID);
        assertEq(info.creator, creator);
        assertEq(info.royaltyToken, address(token));
        assertEq(info.paymentToken, address(usdc));
        assertEq(info.totalDeposited, 100e6);
        assertEq(info.totalDistributed, 49e6); // 50% of 98 USDC
        assertEq(info.pendingDistribution, 0);
        assertEq(info.dividendBps, DIVIDEND_BPS);
        assertEq(info.tradingFeeBps, TRADING_FEE_BPS);
        assertTrue(info.isActive);
    }

    function test_GetDistribution() public {
        vault.depositRoyalty(100e6);
        vault.distribute();

        RoyaltyVault.Distribution memory dist = vault.getDistribution(0);

        assertEq(dist.snapshotId, 1);
        assertEq(dist.amount, 49e6); // 50% dividend
        assertTrue(dist.timestamp > 0);
        assertEq(dist.totalClaimed, 0);
    }

    function test_GetDistributionRevertsForInvalidId() public {
        vm.expectRevert(RoyaltyVault.InvalidDistributionId.selector);
        vault.getDistribution(0);
    }

    // ============ Fuzz Tests ============

    function testFuzz_DepositAmount(uint256 amount) public {
        amount = bound(amount, 1, 1_000_000e6);

        usdc.mint(address(this), amount);
        usdc.approve(address(vault), amount);

        uint256 expectedProtocolFee = (amount * 200) / 10000;
        uint256 afterFee = amount - expectedProtocolFee;
        uint256 expectedDividend = (afterFee * DIVIDEND_BPS) / 10000;

        vault.depositRoyalty(amount);

        RoyaltyVault.VaultInfo memory info = vault.getVaultInfo();
        assertEq(info.totalDeposited, amount);
        assertEq(info.pendingDistribution, expectedDividend);
    }

    function testFuzz_ClaimWithVaryingBalances(uint256 balance1, uint256 balance2) public {
        // Bound balances to reasonable amounts
        balance1 = bound(balance1, 1e18, 5_000e18); // Max is half of FIXED_SUPPLY
        balance2 = bound(balance2, 1e18, 5_000e18);

        // Create a new setup with controlled balances
        MockUSDC usdc2 = new MockUSDC();
        address expectedVault2 = vm.computeCreateAddress(address(this), vm.getNonce(address(this)) + 1);

        RoyaltyToken token2 = new RoyaltyToken(
            "Test Token 2", "TT2", expectedVault2, creator, STORY_IP_ID, balance1 + balance2, 0
        );

        RoyaltyVault vault2 = new RoyaltyVault(
            STORY_IP_ID, creator, address(token2), address(usdc2), treasury, DIVIDEND_BPS, TRADING_FEE_BPS
        );

        // Distribute tokens
        vm.startPrank(expectedVault2);
        token2.transfer(holder1, balance1);
        token2.transfer(holder2, balance2);
        vm.stopPrank();

        // Deposit and distribute
        usdc2.mint(address(this), 10000e6);
        usdc2.approve(address(vault2), 10000e6);
        vault2.depositRoyalty(10000e6);
        vault2.distribute();

        // Trigger checkpoints
        vm.prank(holder1);
        token2.transfer(address(this), 1);
        vm.prank(holder2);
        token2.transfer(address(this), 1);

        // Calculate expected shares
        // Protocol fee: 200 USDC, afterFee: 9800, dividend: 4900 (50%)
        uint256 dividendAmount = 4900e6;
        uint256 totalSupply = balance1 + balance2;
        uint256 expected1 = (dividendAmount * balance1) / totalSupply;
        uint256 expected2 = (dividendAmount * balance2) / totalSupply;

        uint256 pending1 = vault2.pendingRewardsForDistribution(holder1, 0);
        uint256 pending2 = vault2.pendingRewardsForDistribution(holder2, 0);

        assertApproxEqAbs(pending1, expected1, 1); // Allow 1 wei rounding
        assertApproxEqAbs(pending2, expected2, 1);
    }

    // ============ New Tests for Economics ============

    function test_DifferentDividendRates() public {
        // Create vault with 100% dividend rate (all to holders)
        MockUSDC usdc3 = new MockUSDC();
        address expectedVault3 = vm.computeCreateAddress(address(this), vm.getNonce(address(this)) + 1);

        RoyaltyToken token3 = new RoyaltyToken(
            "Test Token 3", "TT3", expectedVault3, creator, keccak256("ip-3"), TOTAL_SUPPLY, 0
        );

        RoyaltyVault vault3 = new RoyaltyVault(
            keccak256("ip-3"), creator, address(token3), address(usdc3), treasury, 10000, 100 // 100% dividend
        );

        usdc3.mint(address(this), 100e6);
        usdc3.approve(address(vault3), 100e6);

        uint256 creatorBefore = usdc3.balanceOf(creator);
        vault3.depositRoyalty(100e6);
        uint256 creatorAfter = usdc3.balanceOf(creator);

        // With 100% dividend, creator gets nothing (0%)
        assertEq(creatorAfter - creatorBefore, 0);

        RoyaltyVault.VaultInfo memory info = vault3.getVaultInfo();
        // 98 USDC after protocol fee, all goes to dividend
        assertEq(info.pendingDistribution, 98e6);
    }

    function test_ZeroDividendRate() public {
        // Create vault with 0% dividend rate (all to creator)
        MockUSDC usdc4 = new MockUSDC();
        address expectedVault4 = vm.computeCreateAddress(address(this), vm.getNonce(address(this)) + 1);

        RoyaltyToken token4 = new RoyaltyToken(
            "Test Token 4", "TT4", expectedVault4, creator, keccak256("ip-4"), TOTAL_SUPPLY, 0
        );

        RoyaltyVault vault4 = new RoyaltyVault(
            keccak256("ip-4"), creator, address(token4), address(usdc4), treasury, 0, 100 // 0% dividend
        );

        usdc4.mint(address(this), 100e6);
        usdc4.approve(address(vault4), 100e6);

        uint256 creatorBefore = usdc4.balanceOf(creator);
        vault4.depositRoyalty(100e6);
        uint256 creatorAfter = usdc4.balanceOf(creator);

        // With 0% dividend, creator gets all (98 USDC after protocol fee)
        assertEq(creatorAfter - creatorBefore, 98e6);

        RoyaltyVault.VaultInfo memory info = vault4.getVaultInfo();
        // No dividend
        assertEq(info.pendingDistribution, 0);
    }

    function test_FivePercentDividendRate() public {
        // Create vault with 5% dividend rate
        MockUSDC usdc5 = new MockUSDC();
        address expectedVault5 = vm.computeCreateAddress(address(this), vm.getNonce(address(this)) + 1);

        RoyaltyToken token5 = new RoyaltyToken(
            "Test Token 5", "TT5", expectedVault5, creator, keccak256("ip-5"), TOTAL_SUPPLY, 0
        );

        RoyaltyVault vault5 = new RoyaltyVault(
            keccak256("ip-5"), creator, address(token5), address(usdc5), treasury, 500, 100 // 5% dividend
        );

        usdc5.mint(address(this), 100e6);
        usdc5.approve(address(vault5), 100e6);

        uint256 creatorBefore = usdc5.balanceOf(creator);
        vault5.depositRoyalty(100e6);
        uint256 creatorAfter = usdc5.balanceOf(creator);

        // 100 USDC deposit:
        // Protocol fee: 2% = 2 USDC
        // After fee: 98 USDC
        // Dividend (5%): 4.9 USDC -> 4900000
        // Creator (95%): 93.1 USDC -> 93100000

        uint256 expectedCreator = 931e5; // 93.1 USDC
        uint256 expectedDividend = 49e5; // 4.9 USDC

        assertEq(creatorAfter - creatorBefore, expectedCreator, "Creator should get 95% of after-fee");

        RoyaltyVault.VaultInfo memory info = vault5.getVaultInfo();
        assertEq(info.pendingDistribution, expectedDividend, "Dividend should be 5% of after-fee");
    }
}
