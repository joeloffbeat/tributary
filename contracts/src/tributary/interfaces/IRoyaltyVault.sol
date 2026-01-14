// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRoyaltyVault {
    struct VaultInfo {
        bytes32 storyIPId;
        address creator;
        address royaltyToken;
        address paymentToken;
        uint256 totalDeposited;
        uint256 totalDistributed;
        uint256 pendingDistribution;
        uint256 lastDistributionTime;
        uint256 dividendBps;      // Dividend rate in basis points
        uint256 tradingFeeBps;    // Trading fee in basis points
        bool isActive;
    }

    struct Distribution {
        uint256 snapshotId;
        uint256 amount;
        uint256 timestamp;
        uint256 totalClaimed;
    }

    function depositRoyalty(uint256 amount) external;
    function distribute() external;
    function claim(uint256 distributionId) external returns (uint256);
    function claimMultiple(uint256[] calldata distributionIds) external returns (uint256);
    function pendingRewards(address holder) external view returns (uint256);
    function getVaultInfo() external view returns (VaultInfo memory);
    function getDistribution(uint256 distributionId) external view returns (Distribution memory);
    function pause() external;
    function unpause() external;
}
