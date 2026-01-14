// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDT
/// @notice A mock USDT token for testing and demo purposes
/// @dev Has 6 decimals like real USDT, with public mint and faucet functions
contract MockUSDT is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 10_000 * 1e6; // 10,000 USDT
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    mapping(address => uint256) public lastFaucetTime;

    constructor() ERC20("Mock USDT", "USDT") Ownable(msg.sender) {}

    /// @notice Returns 6 decimals like real USDT
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Owner can mint unlimited tokens to any address
    /// @param to The address to mint tokens to
    /// @param amount The amount of tokens to mint
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Anyone can claim free tokens with a 24h cooldown
    function faucet() external {
        require(
            block.timestamp >= lastFaucetTime[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown active"
        );
        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
