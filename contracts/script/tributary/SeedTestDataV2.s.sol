// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { MockUSDT } from "../../src/tributary/MockUSDT.sol";
import { RoyaltyVaultFactory } from "../../src/tributary/RoyaltyVaultFactory.sol";
import { RoyaltyMarketplace } from "../../src/tributary/RoyaltyMarketplace.sol";
import { IRoyaltyMarketplace } from "../../src/tributary/interfaces/IRoyaltyMarketplace.sol";
import { TributaryAMM } from "../../src/tributary/TributaryAMM.sol";
import { RoyaltyToken } from "../../src/tributary/RoyaltyToken.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title SeedTestDataV2
/// @notice Seeds test data for Tributary contracts - simplified version
contract SeedTestDataV2 is Script {
    // Deployed contract addresses (Mantle Sepolia)
    address constant USDT = 0x5a8Ba59Fcc42Cb80f4c655C60F8a2684543FB3A2;
    address constant FACTORY = 0x1D00e9fEC4748e07E178FaF1778c4B95E74CDA30;
    address constant MARKETPLACE = 0x8e25b6a75907F8DDf28e15558759802d7922A898;
    address constant AMM = 0xee4c62bb881cF0364333D5754Ef0551a39BA4426;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("=== Seeding Test Data V2 ===");
        console2.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        MockUSDT usdt = MockUSDT(USDT);
        RoyaltyVaultFactory factory = RoyaltyVaultFactory(FACTORY);
        TributaryAMM amm = TributaryAMM(AMM);
        RoyaltyMarketplace marketplace = RoyaltyMarketplace(MARKETPLACE);

        // 1. Mint USDT
        console2.log("Minting USDT...");
        usdt.mint(deployer, 500_000 * 1e6);

        // 2. Create Vault 1 - Music IP
        console2.log("Creating Vault 1...");
        (address vault1, address token1) = factory.createVault(
            RoyaltyVaultFactory.VaultParams({
                storyIPId: keccak256("music-echoes-v2"),
                tokenName: "Echoes Album Royalties",
                tokenSymbol: "ECHO",
                creatorAllocation: 5000 * 1e18, // 50% to creator
                dividendBps: 7000,
                tradingFeeBps: 100,
                paymentToken: USDT
            })
        );
        console2.log("Vault 1:", vault1);
        console2.log("Token 1:", token1);

        // 3. Create Pool 1 and add liquidity
        console2.log("Creating Pool 1...");
        uint256 poolId1 = amm.createPool(token1, USDT);
        console2.log("Pool ID:", poolId1);

        // Approve and add liquidity (use 1000 tokens, 2000 USDT - lower amounts)
        IERC20(token1).approve(address(amm), type(uint256).max);
        usdt.approve(address(amm), type(uint256).max);
        usdt.approve(address(marketplace), type(uint256).max);

        console2.log("Adding liquidity...");
        amm.addLiquidity(poolId1, 1000 * 1e18, 2000 * 1e6);

        // 4. Execute 3 buy swaps
        console2.log("Executing buy swaps...");
        amm.buyTokens(poolId1, 100 * 1e6, 0);
        amm.buyTokens(poolId1, 150 * 1e6, 0);
        amm.buyTokens(poolId1, 200 * 1e6, 0);

        // 5. Execute 2 sell swaps (using bought tokens)
        console2.log("Executing sell swaps...");
        RoyaltyToken rt = RoyaltyToken(token1);
        uint256 sellAmount = 20 * 1e18;
        rt.approve(address(amm), type(uint256).max);
        amm.sellTokens(poolId1, sellAmount, 0);
        amm.sellTokens(poolId1, sellAmount, 0);

        // 6. Create marketplace listing
        console2.log("Creating marketplace listing...");
        rt.approve(address(marketplace), type(uint256).max);
        uint256 listingId = marketplace.createListing(
            IRoyaltyMarketplace.CreateListingParams({
                royaltyToken: token1,
                amount: 100 * 1e18,
                pricePerToken: 3 * 1e6, // 3 USDT per token
                paymentToken: USDT,
                duration: 30 days
            })
        );
        console2.log("Listing ID:", listingId);

        // 7. Buy from listing
        console2.log("Buying from listing...");
        marketplace.buy(listingId, 10 * 1e18);

        vm.stopBroadcast();

        console2.log("=== Seeding Complete ===");
    }
}
