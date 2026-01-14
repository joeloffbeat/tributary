// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRoyaltyVaultFactory {
    struct VaultParams {
        bytes32 storyIPId;
        string tokenName;
        string tokenSymbol;
        uint256 creatorAllocation;  // Amount creator keeps (out of FIXED_SUPPLY)
        uint256 dividendBps;        // Dividend % in basis points (e.g., 500 = 5%)
        uint256 tradingFeeBps;      // Trading fee % in basis points (e.g., 100 = 1%)
        address paymentToken;
    }

    struct VaultRecord {
        address vault;
        address token;
        address creator;
        bytes32 storyIPId;
        uint256 createdAt;
        uint256 dividendBps;
        uint256 tradingFeeBps;
        bool isActive;
    }

    function FIXED_SUPPLY() external view returns (uint256);
    function createVault(VaultParams calldata params) external returns (address vault, address token);
    function getVaultsByCreator(address creator) external view returns (address[] memory);
    function getVaultByIPId(bytes32 storyIPId) external view returns (address);
    function getAllVaults() external view returns (VaultRecord[] memory);
    function getVaultRecord(address vault) external view returns (VaultRecord memory);
    function isValidVault(address vault) external view returns (bool);
    function protocolTreasury() external view returns (address);
}
