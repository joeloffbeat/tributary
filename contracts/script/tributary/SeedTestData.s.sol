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

/// @title SeedTestData
/// @notice Seeds test data for Tributary contracts to test subgraph indexing
contract SeedTestData is Script {
    // Deployed contract addresses (Mantle Sepolia)
    address constant USDT = 0x5a8Ba59Fcc42Cb80f4c655C60F8a2684543FB3A2;
    address constant FACTORY = 0x1D00e9fEC4748e07E178FaF1778c4B95E74CDA30;
    address constant MARKETPLACE = 0x8e25b6a75907F8DDf28e15558759802d7922A898;
    address constant AMM = 0xee4c62bb881cF0364333D5754Ef0551a39BA4426;

    MockUSDT usdt;
    RoyaltyVaultFactory factory;
    RoyaltyMarketplace marketplace;
    TributaryAMM amm;

    // Created vaults and tokens
    address[] vaults;
    address[] tokens;
    uint256[] poolIds;

    function setUp() public {
        usdt = MockUSDT(USDT);
        factory = RoyaltyVaultFactory(FACTORY);
        marketplace = RoyaltyMarketplace(MARKETPLACE);
        amm = TributaryAMM(AMM);
    }

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("=== Seeding Test Data ===");
        console2.log("Deployer:", deployer);
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Mint USDT for testing
        console2.log("Step 1: Minting USDT...");
        usdt.mint(deployer, 1_000_000 * 1e6); // 1M USDT
        console2.log("Minted 1,000,000 USDT to deployer");

        // 2. Create 3 vaults with different configurations
        console2.log("\nStep 2: Creating Vaults...");
        createVaults(deployer);

        // 3. Create AMM pools and add liquidity
        console2.log("\nStep 3: Creating AMM Pools...");
        createPoolsAndAddLiquidity(deployer);

        // 4. Execute multiple swaps to generate trading volume
        console2.log("\nStep 4: Executing Swaps...");
        executeSwaps(deployer);

        // 5. Create marketplace listings
        console2.log("\nStep 5: Creating Marketplace Listings...");
        createListings(deployer);

        // 6. Execute marketplace trades
        console2.log("\nStep 6: Executing Marketplace Trades...");
        executeTrades(deployer);

        vm.stopBroadcast();

        // Summary
        console2.log("\n=== Seeding Complete ===");
        console2.log("Vaults created:", vaults.length);
        console2.log("Pools created:", poolIds.length);
        console2.log("Check subgraph for indexed data");
    }

    function createVaults(address deployer) internal {
        // Vault 1: Music IP - 70% dividend, 1% trading fee
        (address vault1, address token1) = factory.createVault(
            RoyaltyVaultFactory.VaultParams({
                storyIPId: keccak256("music-ip-1"),
                tokenName: "Echoes Album Royalties",
                tokenSymbol: "ECHO",
                creatorAllocation: 2000 * 1e18, // 20%
                dividendBps: 7000,
                tradingFeeBps: 100,
                paymentToken: USDT
            })
        );
        vaults.push(vault1);
        tokens.push(token1);
        console2.log("Vault 1 (ECHO):", vault1, "Token:", token1);

        // Vault 2: Art IP - 50% dividend, 2% trading fee
        (address vault2, address token2) = factory.createVault(
            RoyaltyVaultFactory.VaultParams({
                storyIPId: keccak256("art-ip-2"),
                tokenName: "Digital Art Collection",
                tokenSymbol: "DART",
                creatorAllocation: 3000 * 1e18, // 30%
                dividendBps: 5000,
                tradingFeeBps: 200,
                paymentToken: USDT
            })
        );
        vaults.push(vault2);
        tokens.push(token2);
        console2.log("Vault 2 (DART):", vault2, "Token:", token2);

        // Vault 3: Film IP - 80% dividend, 0.5% trading fee
        (address vault3, address token3) = factory.createVault(
            RoyaltyVaultFactory.VaultParams({
                storyIPId: keccak256("film-ip-3"),
                tokenName: "Indie Film Revenue",
                tokenSymbol: "FILM",
                creatorAllocation: 1500 * 1e18, // 15%
                dividendBps: 8000,
                tradingFeeBps: 50,
                paymentToken: USDT
            })
        );
        vaults.push(vault3);
        tokens.push(token3);
        console2.log("Vault 3 (FILM):", vault3, "Token:", token3);
    }

    function createPoolsAndAddLiquidity(address deployer) internal {
        for (uint256 i = 0; i < tokens.length; i++) {
            // Create pool
            uint256 poolId = amm.createPool(tokens[i], USDT);
            poolIds.push(poolId);
            console2.log("Pool", poolId, "created for token", i);

            // Approve tokens for AMM
            IERC20(tokens[i]).approve(address(amm), type(uint256).max);
            usdt.approve(address(amm), type(uint256).max);

            // Add initial liquidity (varying amounts)
            uint256 tokenAmount = (1000 + i * 500) * 1e18; // 1000, 1500, 2000 tokens
            uint256 quoteAmount = (5000 + i * 2500) * 1e6; // 5000, 7500, 10000 USDT

            amm.addLiquidity(poolId, tokenAmount, quoteAmount);
            console2.log("Added liquidity to pool", poolId);
        }
    }

    function executeSwaps(address deployer) internal {
        // Execute multiple buys and sells to generate volume and candle data
        for (uint256 i = 0; i < poolIds.length; i++) {
            uint256 poolId = poolIds[i];

            // 5 buy transactions with varying amounts
            for (uint256 j = 0; j < 5; j++) {
                uint256 buyAmount = (100 + j * 50) * 1e6; // 100-300 USDT
                try amm.buyTokens(poolId, buyAmount, 0) returns (uint256 tokensOut) {
                    console2.log("Buy executed on pool", poolId);
                } catch {
                    console2.log("Buy failed on pool", poolId);
                }
            }

            // 3 sell transactions
            RoyaltyToken token = RoyaltyToken(tokens[i]);
            uint256 balance = token.balanceOf(deployer);

            for (uint256 j = 0; j < 3; j++) {
                uint256 sellAmount = (balance / 20); // Sell 5% each time
                if (sellAmount > 0) {
                    token.approve(address(amm), sellAmount);
                    try amm.sellTokens(poolId, sellAmount, 0) returns (uint256 quoteOut) {
                        console2.log("Sell executed on pool", poolId);
                    } catch {
                        console2.log("Sell failed on pool", poolId);
                    }
                }
            }
        }
    }

    function createListings(address deployer) internal {
        for (uint256 i = 0; i < tokens.length; i++) {
            RoyaltyToken token = RoyaltyToken(tokens[i]);
            uint256 balance = token.balanceOf(deployer);

            if (balance > 100 * 1e18) {
                // Approve marketplace
                token.approve(address(marketplace), type(uint256).max);

                // Create listing for 100 tokens
                uint256 listingAmount = 100 * 1e18;
                uint256 pricePerToken = (1 + i) * 1e6; // 1, 2, 3 USDT per token

                uint256 listingId = marketplace.createListing(
                    IRoyaltyMarketplace.CreateListingParams({
                        royaltyToken: tokens[i],
                        amount: listingAmount,
                        pricePerToken: pricePerToken,
                        paymentToken: USDT,
                        duration: 30 days
                    })
                );
                console2.log("Created listing", listingId);
            }
        }
    }

    function executeTrades(address deployer) internal {
        // Buy from the first listing (if exists)
        uint256 listingCount = marketplace.listingCount();

        if (listingCount > 0) {
            // Approve USDT for marketplace
            usdt.approve(address(marketplace), type(uint256).max);

            // Buy 10 tokens from listing 1
            try marketplace.buy(1, 10 * 1e18) {
                console2.log("Bought 10 tokens from listing 1");
            } catch {
                console2.log("Buy from listing 1 failed");
            }

            // Buy 25 tokens from listing 2 if it exists
            if (listingCount > 1) {
                try marketplace.buy(2, 25 * 1e18) {
                    console2.log("Bought 25 tokens from listing 2");
                } catch {
                    console2.log("Buy from listing 2 failed");
                }
            }
        }
    }
}
