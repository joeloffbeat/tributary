// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title IMockUSDT
/// @notice Interface for the MockUSDT token contract
interface IMockUSDT is IERC20 {
    /// @notice Owner can mint tokens to any address
    /// @param to The address to mint tokens to
    /// @param amount The amount of tokens to mint
    function mint(address to, uint256 amount) external;

    /// @notice Anyone can claim free tokens with a cooldown
    function faucet() external;

    /// @notice Returns the last time an address used the faucet
    /// @param user The address to check
    /// @return The timestamp of last faucet use
    function lastFaucetTime(address user) external view returns (uint256);
}
