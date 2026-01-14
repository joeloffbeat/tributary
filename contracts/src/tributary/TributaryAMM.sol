// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IRoyaltyVaultFactory } from "./interfaces/IRoyaltyVaultFactory.sol";
import { IRoyaltyToken } from "./interfaces/IRoyaltyToken.sol";
import { IRoyaltyVault } from "./interfaces/IRoyaltyVault.sol";

/// @title TributaryAMM
/// @notice Simple constant-product AMM for RoyaltyToken/USDT pairs
/// @dev One pool per RoyaltyToken, fees match vault's tradingFeeBps
contract TributaryAMM is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Pool {
        address royaltyToken;
        address quoteToken;      // USDT
        address vault;           // Associated vault for fee lookup
        uint256 reserveToken;
        uint256 reserveQuote;
        bool exists;
    }

    IRoyaltyVaultFactory public immutable factory;
    address public protocolTreasury;

    mapping(uint256 => Pool) public pools;
    mapping(address => uint256) public poolIdByToken;
    uint256 public poolCount;

    // Events for charting
    event PoolCreated(
        uint256 indexed poolId,
        address indexed royaltyToken,
        address indexed quoteToken,
        address vault
    );

    event Swap(
        uint256 indexed poolId,
        address indexed trader,
        bool isBuy,              // true = buy token with USDT, false = sell token for USDT
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee,
        uint256 price,           // Price in USDT (6 decimals) per token
        uint256 reserveToken,    // Post-swap
        uint256 reserveQuote,    // Post-swap
        uint256 timestamp
    );

    event LiquidityAdded(
        uint256 indexed poolId,
        address indexed provider,
        uint256 tokenAmount,
        uint256 quoteAmount
    );

    event LiquidityRemoved(
        uint256 indexed poolId,
        address indexed provider,
        uint256 tokenAmount,
        uint256 quoteAmount
    );

    error PoolAlreadyExists();
    error PoolNotFound();
    error ZeroAmount();
    error InsufficientOutput();
    error InvalidToken();
    error ZeroAddress();

    constructor(address _factory, address _protocolTreasury) Ownable(msg.sender) {
        if (_factory == address(0)) revert ZeroAddress();
        if (_protocolTreasury == address(0)) revert ZeroAddress();
        factory = IRoyaltyVaultFactory(_factory);
        protocolTreasury = _protocolTreasury;
    }

    /// @notice Creates a pool for a royalty token
    function createPool(
        address royaltyToken,
        address quoteToken
    ) external returns (uint256 poolId) {
        if (poolIdByToken[royaltyToken] != 0) revert PoolAlreadyExists();

        // Get vault from the token itself
        address vault = IRoyaltyToken(royaltyToken).vault();
        if (!factory.isValidVault(vault)) revert InvalidToken();

        poolId = ++poolCount;

        pools[poolId] = Pool({
            royaltyToken: royaltyToken,
            quoteToken: quoteToken,
            vault: vault,
            reserveToken: 0,
            reserveQuote: 0,
            exists: true
        });

        poolIdByToken[royaltyToken] = poolId;

        emit PoolCreated(poolId, royaltyToken, quoteToken, vault);
    }

    /// @notice Add liquidity (owner/server only for now)
    function addLiquidity(
        uint256 poolId,
        uint256 tokenAmount,
        uint256 quoteAmount
    ) external onlyOwner {
        Pool storage pool = pools[poolId];
        if (!pool.exists) revert PoolNotFound();

        IERC20(pool.royaltyToken).safeTransferFrom(msg.sender, address(this), tokenAmount);
        IERC20(pool.quoteToken).safeTransferFrom(msg.sender, address(this), quoteAmount);

        pool.reserveToken += tokenAmount;
        pool.reserveQuote += quoteAmount;

        emit LiquidityAdded(poolId, msg.sender, tokenAmount, quoteAmount);
    }

    /// @notice Remove liquidity (owner/server only)
    function removeLiquidity(
        uint256 poolId,
        uint256 tokenAmount,
        uint256 quoteAmount
    ) external onlyOwner {
        Pool storage pool = pools[poolId];
        if (!pool.exists) revert PoolNotFound();

        pool.reserveToken -= tokenAmount;
        pool.reserveQuote -= quoteAmount;

        IERC20(pool.royaltyToken).safeTransfer(msg.sender, tokenAmount);
        IERC20(pool.quoteToken).safeTransfer(msg.sender, quoteAmount);

        emit LiquidityRemoved(poolId, msg.sender, tokenAmount, quoteAmount);
    }

    /// @notice Buy tokens with USDT
    function buyTokens(
        uint256 poolId,
        uint256 quoteIn,
        uint256 minTokenOut
    ) external nonReentrant returns (uint256 tokenOut) {
        Pool storage pool = pools[poolId];
        if (!pool.exists) revert PoolNotFound();
        if (quoteIn == 0) revert ZeroAmount();

        // Get fee from vault
        uint256 feeBps = _getPoolFeeBps(pool.vault);
        uint256 fee = (quoteIn * feeBps) / 10000;
        uint256 quoteInAfterFee = quoteIn - fee;

        // Calculate output: x * y = k
        tokenOut = (pool.reserveToken * quoteInAfterFee) / (pool.reserveQuote + quoteInAfterFee);
        if (tokenOut < minTokenOut) revert InsufficientOutput();

        // Transfer
        IERC20(pool.quoteToken).safeTransferFrom(msg.sender, address(this), quoteIn);
        if (fee > 0) {
            IERC20(pool.quoteToken).safeTransfer(protocolTreasury, fee);
        }
        IERC20(pool.royaltyToken).safeTransfer(msg.sender, tokenOut);

        // Update reserves
        pool.reserveQuote += quoteInAfterFee;
        pool.reserveToken -= tokenOut;

        // Calculate price (USDT per token, 6 decimals)
        uint256 price = (pool.reserveQuote * 1e18) / pool.reserveToken;

        emit Swap(
            poolId,
            msg.sender,
            true,
            quoteIn,
            tokenOut,
            fee,
            price,
            pool.reserveToken,
            pool.reserveQuote,
            block.timestamp
        );
    }

    /// @notice Sell tokens for USDT
    function sellTokens(
        uint256 poolId,
        uint256 tokenIn,
        uint256 minQuoteOut
    ) external nonReentrant returns (uint256 quoteOut) {
        Pool storage pool = pools[poolId];
        if (!pool.exists) revert PoolNotFound();
        if (tokenIn == 0) revert ZeroAmount();

        // Calculate output before fee
        uint256 quoteOutBeforeFee = (pool.reserveQuote * tokenIn) / (pool.reserveToken + tokenIn);

        // Get fee from vault
        uint256 feeBps = _getPoolFeeBps(pool.vault);
        uint256 fee = (quoteOutBeforeFee * feeBps) / 10000;
        quoteOut = quoteOutBeforeFee - fee;

        if (quoteOut < minQuoteOut) revert InsufficientOutput();

        // Transfer
        IERC20(pool.royaltyToken).safeTransferFrom(msg.sender, address(this), tokenIn);
        IERC20(pool.quoteToken).safeTransfer(msg.sender, quoteOut);
        if (fee > 0) {
            IERC20(pool.quoteToken).safeTransfer(protocolTreasury, fee);
        }

        // Update reserves
        pool.reserveToken += tokenIn;
        pool.reserveQuote -= quoteOutBeforeFee;

        // Calculate price
        uint256 price = (pool.reserveQuote * 1e18) / pool.reserveToken;

        emit Swap(
            poolId,
            msg.sender,
            false,
            tokenIn,
            quoteOut,
            fee,
            price,
            pool.reserveToken,
            pool.reserveQuote,
            block.timestamp
        );
    }

    /// @notice Get quote for buying tokens
    function getQuoteBuy(uint256 poolId, uint256 quoteIn) external view returns (uint256 tokenOut, uint256 fee) {
        Pool storage pool = pools[poolId];
        if (!pool.exists) revert PoolNotFound();

        uint256 feeBps = _getPoolFeeBps(pool.vault);
        fee = (quoteIn * feeBps) / 10000;
        uint256 quoteInAfterFee = quoteIn - fee;

        tokenOut = (pool.reserveToken * quoteInAfterFee) / (pool.reserveQuote + quoteInAfterFee);
    }

    /// @notice Get quote for selling tokens
    function getQuoteSell(uint256 poolId, uint256 tokenIn) external view returns (uint256 quoteOut, uint256 fee) {
        Pool storage pool = pools[poolId];
        if (!pool.exists) revert PoolNotFound();

        uint256 quoteOutBeforeFee = (pool.reserveQuote * tokenIn) / (pool.reserveToken + tokenIn);

        uint256 feeBps = _getPoolFeeBps(pool.vault);
        fee = (quoteOutBeforeFee * feeBps) / 10000;
        quoteOut = quoteOutBeforeFee - fee;
    }

    /// @notice Get current price (USDT per token)
    function getPrice(uint256 poolId) external view returns (uint256) {
        Pool storage pool = pools[poolId];
        if (!pool.exists || pool.reserveToken == 0) return 0;
        return (pool.reserveQuote * 1e18) / pool.reserveToken;
    }

    /// @notice Get pool info
    function getPool(uint256 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }

    function _getPoolFeeBps(address vault) internal view returns (uint256) {
        // Get trading fee from vault, default to 1% if not set
        try IRoyaltyVault(vault).getVaultInfo() returns (IRoyaltyVault.VaultInfo memory info) {
            return info.tradingFeeBps;
        } catch {
            return 100; // 1% default
        }
    }

    /// @notice Update protocol treasury address
    function setProtocolTreasury(address _protocolTreasury) external onlyOwner {
        if (_protocolTreasury == address(0)) revert ZeroAddress();
        protocolTreasury = _protocolTreasury;
    }
}
