// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Test Template
 *
 * Usage: Copy this template when creating tests for a new contract
 * Replace: __CONTRACT_NAME__
 */

import "forge-std/Test.sol";
import "../src/__CONTRACT_NAME__.sol";

contract __CONTRACT_NAME__Test is Test {
    // ============ State Variables ============

    __CONTRACT_NAME__ public instance;

    address public owner;
    address public user1;
    address public user2;

    // ============ Events (copy from contract) ============

    event ValueUpdated(uint256 indexed oldValue, uint256 indexed newValue, address indexed updatedBy);

    // ============ Setup ============

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Fund accounts
        vm.deal(owner, 100 ether);
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);

        // Deploy contract as owner
        vm.prank(owner);
        instance = new __CONTRACT_NAME__();
    }

    // ============ Constructor Tests ============

    function test_Constructor_ShouldSetOwner() public view {
        assertEq(instance.owner(), owner);
    }

    function test_Constructor_ShouldInitializeState() public view {
        assertEq(instance.value(), 0);
    }

    // ============ Happy Path Tests ============

    function test_SetValue_AsOwner_ShouldUpdateValue() public {
        uint256 newValue = 100;

        vm.prank(owner);
        instance.setValue(newValue);

        assertEq(instance.getValue(), newValue);
    }

    function test_SetValue_ShouldEmitEvent() public {
        uint256 newValue = 100;

        vm.expectEmit(true, true, true, true);
        emit ValueUpdated(0, newValue, owner);

        vm.prank(owner);
        instance.setValue(newValue);
    }

    // ============ Revert Tests ============

    function testRevert_SetValue_AsNonOwner_ShouldRevert() public {
        vm.prank(user1);
        vm.expectRevert();
        instance.setValue(100);
    }

    function testRevert_SetValue_WithZeroValue_ShouldRevert() public {
        vm.prank(owner);
        vm.expectRevert(__CONTRACT_NAME__.InvalidValue.selector);
        instance.setValue(0);
    }

    function testRevert_SetValue_WhenPaused_ShouldRevert() public {
        vm.startPrank(owner);
        instance.pause();

        vm.expectRevert();
        instance.setValue(100);
        vm.stopPrank();
    }

    // ============ Fuzz Tests ============

    function testFuzz_SetValue_WithValidValue_ShouldUpdateValue(uint256 newValue) public {
        // Bound to valid range (non-zero)
        vm.assume(newValue > 0);

        vm.prank(owner);
        instance.setValue(newValue);

        assertEq(instance.getValue(), newValue);
    }

    // ============ Pause Tests ============

    function test_Pause_AsOwner_ShouldPause() public {
        vm.prank(owner);
        instance.pause();

        assertTrue(instance.paused());
    }

    function test_Unpause_AsOwner_ShouldUnpause() public {
        vm.startPrank(owner);
        instance.pause();
        instance.unpause();
        vm.stopPrank();

        assertFalse(instance.paused());
    }

    // ============ Helper Functions ============

    function _setupWithValue(uint256 value) internal {
        vm.prank(owner);
        instance.setValue(value);
    }
}
