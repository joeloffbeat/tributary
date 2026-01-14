// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/tributary/RoyaltyToken.sol";

contract RoyaltyTokenTest is Test {
    RoyaltyToken public token;

    address public vault = address(0x1111);
    address public creator = address(0x2222);
    address public user1 = address(0x3333);
    address public user2 = address(0x4444);

    bytes32 public constant STORY_IP_ID = keccak256("test-ip-id");
    string public constant TOKEN_NAME = "Test Royalty Token";
    string public constant TOKEN_SYMBOL = "TRT";
    uint256 public constant TOTAL_SUPPLY = 1_000_000e18;
    uint256 public constant CREATOR_ALLOCATION = 100_000e18;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event SnapshotCreated(uint256 indexed snapshotId, uint256 timestamp);

    function setUp() public {
        token = new RoyaltyToken(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            vault,
            creator,
            STORY_IP_ID,
            TOTAL_SUPPLY,
            CREATOR_ALLOCATION
        );
    }

    // ============ Constructor Tests ============

    function test_ConstructorSetsVault() public view {
        assertEq(token.vault(), vault);
    }

    function test_ConstructorSetsCreator() public view {
        assertEq(token.creator(), creator);
    }

    function test_ConstructorSetsStoryIPId() public view {
        assertEq(token.storyIPId(), STORY_IP_ID);
    }

    function test_ConstructorMintsToVault() public view {
        uint256 vaultBalance = TOTAL_SUPPLY - CREATOR_ALLOCATION;
        assertEq(token.balanceOf(vault), vaultBalance);
    }

    function test_ConstructorMintsCreatorAllocation() public view {
        assertEq(token.balanceOf(creator), CREATOR_ALLOCATION);
    }

    function test_ConstructorSetsTotalSupply() public view {
        assertEq(token.totalSupply(), TOTAL_SUPPLY);
    }

    function test_ConstructorSetsNameAndSymbol() public view {
        assertEq(token.name(), TOKEN_NAME);
        assertEq(token.symbol(), TOKEN_SYMBOL);
    }

    function test_ConstructorRevertsOnZeroVault() public {
        // OpenZeppelin's Ownable throws OwnableInvalidOwner before our ZeroAddress check
        // when vault is address(0), since vault is passed to Ownable(vault) first
        vm.expectRevert();
        new RoyaltyToken(
            TOKEN_NAME, TOKEN_SYMBOL, address(0), creator, STORY_IP_ID, TOTAL_SUPPLY, CREATOR_ALLOCATION
        );
    }

    function test_ConstructorRevertsOnZeroCreator() public {
        vm.expectRevert(RoyaltyToken.ZeroAddress.selector);
        new RoyaltyToken(
            TOKEN_NAME, TOKEN_SYMBOL, vault, address(0), STORY_IP_ID, TOTAL_SUPPLY, CREATOR_ALLOCATION
        );
    }

    function test_ConstructorWithZeroCreatorAllocation() public {
        RoyaltyToken tokenNoCreatorAlloc = new RoyaltyToken(
            TOKEN_NAME, TOKEN_SYMBOL, vault, creator, STORY_IP_ID, TOTAL_SUPPLY, 0
        );
        assertEq(tokenNoCreatorAlloc.balanceOf(vault), TOTAL_SUPPLY);
        assertEq(tokenNoCreatorAlloc.balanceOf(creator), 0);
    }

    // ============ Transfer Tests ============

    function test_TransferBetweenUsers() public {
        uint256 transferAmount = 1000e18;

        // Vault transfers to user1
        vm.prank(vault);
        token.transfer(user1, transferAmount);
        assertEq(token.balanceOf(user1), transferAmount);

        // User1 transfers to user2
        vm.prank(user1);
        token.transfer(user2, transferAmount / 2);
        assertEq(token.balanceOf(user2), transferAmount / 2);
        assertEq(token.balanceOf(user1), transferAmount / 2);
    }

    function test_TransferEmitsEvent() public {
        uint256 transferAmount = 1000e18;

        vm.expectEmit(true, true, true, true);
        emit Transfer(vault, user1, transferAmount);

        vm.prank(vault);
        token.transfer(user1, transferAmount);
    }

    function test_TransferFromWithApproval() public {
        uint256 transferAmount = 1000e18;

        // Vault approves user1
        vm.prank(vault);
        token.approve(user1, transferAmount);

        // User1 transfers from vault to user2
        vm.prank(user1);
        token.transferFrom(vault, user2, transferAmount);

        assertEq(token.balanceOf(user2), transferAmount);
    }

    function test_TransferFailsWithoutBalance() public {
        uint256 transferAmount = 1000e18;

        vm.prank(user1); // user1 has no balance
        vm.expectRevert();
        token.transfer(user2, transferAmount);
    }

    function test_TransferFromFailsWithoutApproval() public {
        uint256 transferAmount = 1000e18;

        vm.prank(user1);
        vm.expectRevert();
        token.transferFrom(vault, user2, transferAmount);
    }

    // ============ Snapshot Tests ============

    function test_SnapshotOnlyByVault() public {
        vm.prank(vault);
        uint256 snapshotId = token.snapshot();
        assertEq(snapshotId, 1);
    }

    function test_SnapshotReturnsIncrementingId() public {
        vm.startPrank(vault);

        uint256 snapshot1 = token.snapshot();
        uint256 snapshot2 = token.snapshot();
        uint256 snapshot3 = token.snapshot();

        vm.stopPrank();

        assertEq(snapshot1, 1);
        assertEq(snapshot2, 2);
        assertEq(snapshot3, 3);
    }

    function test_SnapshotEmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit SnapshotCreated(1, block.timestamp);

        vm.prank(vault);
        token.snapshot();
    }

    function test_GetCurrentSnapshotId() public {
        assertEq(token.getCurrentSnapshotId(), 0);

        vm.prank(vault);
        token.snapshot();
        assertEq(token.getCurrentSnapshotId(), 1);

        vm.prank(vault);
        token.snapshot();
        assertEq(token.getCurrentSnapshotId(), 2);
    }

    function test_BalanceOfAtReturnsCorrectBalance() public {
        uint256 vaultBalanceBefore = token.balanceOf(vault);

        // Take snapshot
        vm.prank(vault);
        uint256 snapshotId = token.snapshot();

        // Transfer tokens after snapshot
        vm.prank(vault);
        token.transfer(user1, 100_000e18);

        // Query balance at snapshot - should return balance before transfer
        uint256 balanceAtSnapshot = token.balanceOfAt(vault, snapshotId);
        assertEq(balanceAtSnapshot, vaultBalanceBefore);
    }

    function test_TotalSupplyAtReturnsCorrectSupply() public {
        // Take snapshot
        vm.prank(vault);
        uint256 snapshotId = token.snapshot();

        // Burn tokens after snapshot
        vm.prank(vault);
        token.transfer(user1, 100_000e18);

        vm.prank(user1);
        RoyaltyToken(address(token)).burn(50_000e18);

        // Total supply at snapshot should be original
        uint256 supplyAtSnapshot = token.totalSupplyAt(snapshotId);
        assertEq(supplyAtSnapshot, TOTAL_SUPPLY);
    }

    function test_SnapshotBeforeTransferCapturesBalance() public {
        uint256 transferAmount = 50_000e18;

        // Give user1 some tokens
        vm.prank(vault);
        token.transfer(user1, transferAmount);

        uint256 user1BalanceBefore = token.balanceOf(user1);

        // Take snapshot
        vm.prank(vault);
        uint256 snapshotId = token.snapshot();

        // Transfer away all tokens
        vm.prank(user1);
        token.transfer(user2, transferAmount);

        // Balance at snapshot should be the balance before transfer
        assertEq(token.balanceOfAt(user1, snapshotId), user1BalanceBefore);
        assertEq(token.balanceOf(user1), 0); // Current balance is 0
    }

    function test_MultipleSnapshotsTrackChanges() public {
        uint256 transferAmount = 100_000e18;
        uint256 vaultInitial = TOTAL_SUPPLY - CREATOR_ALLOCATION;

        // Snapshot 1 - initial state
        vm.prank(vault);
        uint256 snapshot1 = token.snapshot();

        // Transfer after snapshot1 - this records vault's balance (vaultInitial) for snapshot1
        vm.prank(vault);
        token.transfer(user1, transferAmount);

        // Snapshot 2 - after first transfer
        vm.prank(vault);
        uint256 snapshot2 = token.snapshot();

        // Transfer after snapshot2 - this records vault's balance (vaultInitial - transferAmount) for snapshot2
        vm.prank(vault);
        token.transfer(user1, transferAmount);

        // Snapshot 3 - after second transfer
        vm.prank(vault);
        uint256 snapshot3 = token.snapshot();

        // Transfer after snapshot3 - this records vault's balance for snapshot3
        vm.prank(vault);
        token.transfer(user1, transferAmount);

        // Verify balances at each snapshot
        // The snapshot captures the balance at the time of the NEXT transfer after the snapshot
        assertEq(token.balanceOfAt(vault, snapshot1), vaultInitial);
        assertEq(token.balanceOfAt(vault, snapshot2), vaultInitial - transferAmount);
        assertEq(token.balanceOfAt(vault, snapshot3), vaultInitial - 2 * transferAmount);

        assertEq(token.balanceOfAt(user1, snapshot1), 0);
        assertEq(token.balanceOfAt(user1, snapshot2), transferAmount);
        assertEq(token.balanceOfAt(user1, snapshot3), 2 * transferAmount);
    }

    function test_BalanceOfAtWithInvalidSnapshotId() public view {
        // Snapshot 0 or future snapshot returns current balance
        uint256 currentBalance = token.balanceOf(vault);
        assertEq(token.balanceOfAt(vault, 0), currentBalance);
        assertEq(token.balanceOfAt(vault, 999), currentBalance);
    }

    // ============ Burn Tests ============

    function test_BurnReducesBalance() public {
        uint256 burnAmount = 10_000e18;
        uint256 balanceBefore = token.balanceOf(vault);

        vm.prank(vault);
        token.burn(burnAmount);

        assertEq(token.balanceOf(vault), balanceBefore - burnAmount);
    }

    function test_BurnReducesTotalSupply() public {
        uint256 burnAmount = 10_000e18;

        vm.prank(vault);
        token.burn(burnAmount);

        assertEq(token.totalSupply(), TOTAL_SUPPLY - burnAmount);
    }

    function test_BurnEmitsTransferToZero() public {
        uint256 burnAmount = 10_000e18;

        vm.expectEmit(true, true, true, true);
        emit Transfer(vault, address(0), burnAmount);

        vm.prank(vault);
        token.burn(burnAmount);
    }

    function test_BurnFailsWithoutBalance() public {
        uint256 burnAmount = 10_000e18;

        vm.prank(user1); // user1 has no balance
        vm.expectRevert();
        token.burn(burnAmount);
    }

    function test_BurnExceedingBalance() public {
        uint256 balance = token.balanceOf(vault);

        vm.prank(vault);
        vm.expectRevert();
        token.burn(balance + 1);
    }

    // ============ Access Control Tests ============

    function test_SnapshotRevertsForNonVault() public {
        vm.prank(user1);
        vm.expectRevert();
        token.snapshot();
    }

    function test_SnapshotRevertsForCreator() public {
        vm.prank(creator);
        vm.expectRevert();
        token.snapshot();
    }

    function test_OwnerIsVault() public view {
        assertEq(token.owner(), vault);
    }

    // ============ Fuzz Tests ============

    function testFuzz_TransferAmount(uint256 amount) public {
        uint256 vaultBalance = token.balanceOf(vault);
        amount = bound(amount, 0, vaultBalance);

        vm.prank(vault);
        token.transfer(user1, amount);

        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(vault), vaultBalance - amount);
    }

    function testFuzz_SnapshotAfterTransfers(uint8 numTransfers) public {
        numTransfers = uint8(bound(numTransfers, 1, 10));

        uint256 transferAmount = 1000e18;
        uint256 vaultBalanceStart = token.balanceOf(vault);

        // Perform transfers from vault to user1
        for (uint8 i = 0; i < numTransfers; i++) {
            vm.prank(vault);
            token.transfer(user1, transferAmount);
        }

        // Take snapshot after transfers
        vm.prank(vault);
        uint256 snapshotId = token.snapshot();

        // Trigger transfers to record balances at this snapshot
        // (checkpoints are written on the next transfer involving each account)
        // Record vault's balance
        vm.prank(vault);
        token.transfer(user2, 1e18);

        // Record user1's balance by having user1 do a transfer
        vm.prank(user1);
        token.transfer(user2, 1e18);

        // Verify snapshot captured correct state
        uint256 expectedVaultBalance = vaultBalanceStart - (uint256(numTransfers) * transferAmount);
        uint256 expectedUser1Balance = uint256(numTransfers) * transferAmount;

        assertEq(token.balanceOfAt(vault, snapshotId), expectedVaultBalance);
        assertEq(token.balanceOfAt(user1, snapshotId), expectedUser1Balance);
    }

    function testFuzz_BurnAmount(uint256 amount) public {
        uint256 vaultBalance = token.balanceOf(vault);
        amount = bound(amount, 0, vaultBalance);

        vm.prank(vault);
        token.burn(amount);

        assertEq(token.balanceOf(vault), vaultBalance - amount);
        assertEq(token.totalSupply(), TOTAL_SUPPLY - amount);
    }

    function testFuzz_ApprovalAmount(uint256 amount) public {
        vm.prank(vault);
        token.approve(user1, amount);

        assertEq(token.allowance(vault, user1), amount);
    }
}
