// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IRoyaltyToken } from "./interfaces/IRoyaltyToken.sol";

/// @title RoyaltyVault
/// @notice Holds royalty income and distributes to RoyaltyToken holders
/// @dev Uses snapshot mechanism for fair proportional distribution
contract RoyaltyVault is ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    /// @notice Information about the vault
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
        uint256 tradingFeeBps;    // Trading fee in basis points (stored for reference)
        bool isActive;
    }

    /// @notice A distribution record
    struct Distribution {
        uint256 snapshotId;
        uint256 amount;
        uint256 timestamp;
        uint256 totalClaimed;
    }

    /// @notice Vault configuration and state
    VaultInfo public vaultInfo;
    /// @notice Distribution ID → Distribution record
    mapping(uint256 => Distribution) public distributions;
    /// @notice User → Distribution ID → Has claimed
    mapping(address => mapping(uint256 => bool)) public claimed;
    /// @notice Total claimed by each address
    mapping(address => uint256) public totalClaimedBy;
    /// @notice Number of distributions created
    uint256 public distributionCount;
    /// @notice Protocol fee in basis points (2%)
    uint256 public constant PROTOCOL_FEE = 200;
    /// @notice Basis points denominator
    uint256 public constant BASIS_POINTS = 10000;
    /// @notice Protocol treasury address
    address public protocolTreasury;

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

    error ZeroAddress();
    error ZeroAmount();
    error NothingToDistribute();
    error AlreadyClaimed();
    error NothingToClaim();
    error InvalidDistributionId();
    error OnlyCreator();

    modifier onlyCreator() {
        if (msg.sender != vaultInfo.creator) revert OnlyCreator();
        _;
    }

    /// @notice Creates a new RoyaltyVault
    /// @param _storyIPId Story Protocol IP ID
    /// @param _creator Original creator address
    /// @param _royaltyToken Address of the RoyaltyToken
    /// @param _paymentToken Address of the payment token (USDC)
    /// @param _protocolTreasury Protocol treasury for fee collection
    /// @param _dividendBps Dividend rate in basis points
    /// @param _tradingFeeBps Trading fee in basis points
    constructor(
        bytes32 _storyIPId,
        address _creator,
        address _royaltyToken,
        address _paymentToken,
        address _protocolTreasury,
        uint256 _dividendBps,
        uint256 _tradingFeeBps
    ) {
        if (_creator == address(0)) revert ZeroAddress();
        if (_royaltyToken == address(0)) revert ZeroAddress();
        if (_paymentToken == address(0)) revert ZeroAddress();
        if (_protocolTreasury == address(0)) revert ZeroAddress();

        vaultInfo = VaultInfo({
            storyIPId: _storyIPId,
            creator: _creator,
            royaltyToken: _royaltyToken,
            paymentToken: _paymentToken,
            totalDeposited: 0,
            totalDistributed: 0,
            pendingDistribution: 0,
            lastDistributionTime: 0,
            dividendBps: _dividendBps,
            tradingFeeBps: _tradingFeeBps,
            isActive: true
        });
        protocolTreasury = _protocolTreasury;
    }

    /// @notice Deposits royalty payment into the vault
    /// @dev Splits payment: protocol fee → treasury, dividend portion → pending, creator portion → creator
    /// @param amount Amount of payment tokens to deposit
    function depositRoyalty(uint256 amount) external whenNotPaused {
        if (amount == 0) revert ZeroAmount();

        // Protocol fee (2%)
        uint256 protocolFee = (amount * PROTOCOL_FEE) / BASIS_POINTS;

        // Calculate dividend portion based on creator's setting
        uint256 afterProtocolFee = amount - protocolFee;
        uint256 dividendAmount = (afterProtocolFee * vaultInfo.dividendBps) / BASIS_POINTS;
        uint256 creatorAmount = afterProtocolFee - dividendAmount;

        IERC20(vaultInfo.paymentToken).safeTransferFrom(msg.sender, address(this), amount);

        // Protocol fee to treasury
        if (protocolFee > 0) {
            IERC20(vaultInfo.paymentToken).safeTransfer(protocolTreasury, protocolFee);
        }

        // Creator's portion sent directly to creator
        if (creatorAmount > 0) {
            IERC20(vaultInfo.paymentToken).safeTransfer(vaultInfo.creator, creatorAmount);
        }

        vaultInfo.totalDeposited += amount;
        vaultInfo.pendingDistribution += dividendAmount;

        emit RoyaltyReceived(amount, protocolFee, dividendAmount, creatorAmount, block.timestamp);
    }

    /// @notice Creates a new distribution from pending royalties
    /// @dev Creates a snapshot on the RoyaltyToken for fair distribution
    function distribute() external nonReentrant whenNotPaused {
        if (vaultInfo.pendingDistribution == 0) revert NothingToDistribute();

        uint256 amount = vaultInfo.pendingDistribution;
        uint256 snapshotId = IRoyaltyToken(vaultInfo.royaltyToken).snapshot();
        uint256 distId = distributionCount++;

        distributions[distId] = Distribution({
            snapshotId: snapshotId,
            amount: amount,
            timestamp: block.timestamp,
            totalClaimed: 0
        });

        vaultInfo.pendingDistribution = 0;
        vaultInfo.totalDistributed += amount;
        vaultInfo.lastDistributionTime = block.timestamp;

        emit RoyaltyDistributed(distId, amount, snapshotId);
    }

    /// @notice Claims rewards for a specific distribution
    /// @param distributionId ID of the distribution to claim
    /// @return amount Amount of tokens claimed
    function claim(uint256 distributionId) external nonReentrant whenNotPaused returns (uint256 amount) {
        amount = _claim(msg.sender, distributionId);
        if (amount == 0) revert NothingToClaim();
    }

    /// @notice Claims rewards from multiple distributions
    /// @param distributionIds Array of distribution IDs to claim
    /// @return totalAmount Total amount claimed
    function claimMultiple(uint256[] calldata distributionIds) external nonReentrant whenNotPaused returns (uint256 totalAmount) {
        for (uint256 i = 0; i < distributionIds.length; i++) {
            totalAmount += _claim(msg.sender, distributionIds[i]);
        }
        if (totalAmount == 0) revert NothingToClaim();
    }

    /// @notice Internal claim logic
    function _claim(address holder, uint256 distributionId) internal returns (uint256 amount) {
        if (distributionId >= distributionCount) revert InvalidDistributionId();
        if (claimed[holder][distributionId]) return 0;

        Distribution storage dist = distributions[distributionId];
        amount = _calculateShare(holder, dist.snapshotId, dist.amount);

        if (amount == 0) return 0;

        claimed[holder][distributionId] = true;
        dist.totalClaimed += amount;
        totalClaimedBy[holder] += amount;

        IERC20(vaultInfo.paymentToken).safeTransfer(holder, amount);
        emit Claimed(holder, distributionId, amount);
    }

    /// @notice Calculates share based on snapshot balance
    function _calculateShare(address holder, uint256 snapshotId, uint256 totalAmount) internal view returns (uint256) {
        IRoyaltyToken token = IRoyaltyToken(vaultInfo.royaltyToken);
        uint256 holderBalance = token.balanceOfAt(holder, snapshotId);
        uint256 totalSupply = token.totalSupplyAt(snapshotId);

        if (totalSupply == 0 || holderBalance == 0) return 0;
        return (totalAmount * holderBalance) / totalSupply;
    }

    /// @notice Returns total unclaimed rewards for a holder
    /// @param holder Address to check
    /// @return total Total unclaimed amount
    function pendingRewards(address holder) external view returns (uint256 total) {
        for (uint256 i = 0; i < distributionCount; i++) {
            total += pendingRewardsForDistribution(holder, i);
        }
    }

    /// @notice Returns unclaimed rewards for specific distribution
    /// @param holder Address to check
    /// @param distributionId Distribution ID to check
    /// @return Unclaimed amount
    function pendingRewardsForDistribution(address holder, uint256 distributionId) public view returns (uint256) {
        if (distributionId >= distributionCount) return 0;
        if (claimed[holder][distributionId]) return 0;

        Distribution storage dist = distributions[distributionId];
        return _calculateShare(holder, dist.snapshotId, dist.amount);
    }

    /// @notice Returns full vault info
    function getVaultInfo() external view returns (VaultInfo memory) {
        return vaultInfo;
    }

    /// @notice Returns distribution info
    /// @param distributionId Distribution ID to query
    function getDistribution(uint256 distributionId) external view returns (Distribution memory) {
        if (distributionId >= distributionCount) revert InvalidDistributionId();
        return distributions[distributionId];
    }

    /// @notice Pauses the vault
    function pause() external onlyCreator {
        _pause();
        emit VaultPaused(msg.sender);
    }

    /// @notice Unpauses the vault
    function unpause() external onlyCreator {
        _unpause();
        emit VaultUnpaused(msg.sender);
    }
}
