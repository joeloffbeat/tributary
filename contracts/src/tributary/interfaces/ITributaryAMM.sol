// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITributaryAMM {
    struct Pool {
        address royaltyToken;
        address quoteToken;      // USDT
        address vault;           // Associated vault for fee lookup
        uint256 reserveToken;
        uint256 reserveQuote;
        bool exists;
    }

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

    function createPool(address royaltyToken, address quoteToken) external returns (uint256 poolId);
    function addLiquidity(uint256 poolId, uint256 tokenAmount, uint256 quoteAmount) external;
    function removeLiquidity(uint256 poolId, uint256 tokenAmount, uint256 quoteAmount) external;
    function buyTokens(uint256 poolId, uint256 quoteIn, uint256 minTokenOut) external returns (uint256 tokenOut);
    function sellTokens(uint256 poolId, uint256 tokenIn, uint256 minQuoteOut) external returns (uint256 quoteOut);
    function getQuoteBuy(uint256 poolId, uint256 quoteIn) external view returns (uint256 tokenOut, uint256 fee);
    function getQuoteSell(uint256 poolId, uint256 tokenIn) external view returns (uint256 quoteOut, uint256 fee);
    function getPrice(uint256 poolId) external view returns (uint256);
    function getPool(uint256 poolId) external view returns (Pool memory);
    function poolIdByToken(address token) external view returns (uint256);
    function poolCount() external view returns (uint256);
}
