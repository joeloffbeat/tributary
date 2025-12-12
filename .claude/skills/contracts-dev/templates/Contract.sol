// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Contract Template
 *
 * Usage: Copy this template when creating a new contract
 * Replace: __CONTRACT_NAME__, __DESCRIPTION__
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title __CONTRACT_NAME__
 * @notice __DESCRIPTION__
 * @dev Implementation details here
 */
contract __CONTRACT_NAME__ is Ownable, ReentrancyGuard, Pausable {
    // ============ Constants ============

    uint256 public constant VERSION = 1;

    // ============ State Variables ============

    // Example state variable
    uint256 public value;

    // ============ Events ============

    event ValueUpdated(uint256 indexed oldValue, uint256 indexed newValue, address indexed updatedBy);

    // ============ Errors ============

    error InvalidValue();
    error Unauthorized();

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {
        // Initialize state
    }

    // ============ External Functions ============

    /**
     * @notice Set a new value
     * @param newValue The new value to set
     */
    function setValue(uint256 newValue) external onlyOwner whenNotPaused {
        if (newValue == 0) revert InvalidValue();

        uint256 oldValue = value;
        value = newValue;

        emit ValueUpdated(oldValue, newValue, msg.sender);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ View Functions ============

    /**
     * @notice Get current value
     * @return Current value
     */
    function getValue() external view returns (uint256) {
        return value;
    }

    // ============ Internal Functions ============

    /**
     * @dev Internal helper function
     */
    function _validateInput(uint256 input) internal pure returns (bool) {
        return input > 0;
    }
}
