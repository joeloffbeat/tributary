// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TestISM
/// @notice A test ISM that always returns true for verification
/// @dev Only use for testing! This provides no security.
contract TestISM {
    // Use type 3 (LEGACY_MULTISIG) which has simpler requirements
    uint8 public constant moduleType = 3;

    function verify(
        bytes calldata, // _metadata
        bytes calldata // _message
    ) external pure returns (bool) {
        return true;
    }

    // Required for LEGACY_MULTISIG type
    function validatorsAndThreshold(bytes calldata)
        external
        pure
        returns (address[] memory validators, uint8 threshold)
    {
        validators = new address[](1);
        validators[0] = address(0);
        threshold = 0;
    }
}
