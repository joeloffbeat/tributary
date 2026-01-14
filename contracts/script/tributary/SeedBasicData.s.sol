// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { MockUSDT } from "../../src/tributary/MockUSDT.sol";
import { RoyaltyVaultFactory } from "../../src/tributary/RoyaltyVaultFactory.sol";
import { TributaryAMM } from "../../src/tributary/TributaryAMM.sol";
import { RoyaltyToken } from "../../src/tributary/RoyaltyToken.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title SeedBasicData
/// @notice Seeds basic test data - vaults, pools, and swaps only
contract SeedBasicData is Script {
    address constant USDT = 0x5a8Ba59Fcc42Cb80f4c655C60F8a2684543FB3A2;
    address constant FACTORY = 0x1D00e9fEC4748e07E178FaF1778c4B95E74CDA30;
    address constant AMM = 0xee4c62bb881cF0364333D5754Ef0551a39BA4426;

    function run() public {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        console2.log("Deployer:", deployer);

        vm.startBroadcast(pk);

        MockUSDT usdt = MockUSDT(USDT);
        RoyaltyVaultFactory factory = RoyaltyVaultFactory(FACTORY);
        TributaryAMM amm = TributaryAMM(AMM);

        // Mint USDT
        usdt.mint(deployer, 100_000 * 1e6);
        console2.log("Minted USDT");

        // Create Vault
        bytes32 ipId = keccak256(abi.encodePacked("test-ip-", block.timestamp));
        (address vault, address token) = factory.createVault(
            RoyaltyVaultFactory.VaultParams({
                storyIPId: ipId,
                tokenName: "Test Royalties",
                tokenSymbol: "TEST",
                creatorAllocation: 5000 * 1e18,
                dividendBps: 6000,
                tradingFeeBps: 150,
                paymentToken: USDT
            })
        );
        console2.log("Vault:", vault);
        console2.log("Token:", token);

        // Create Pool
        uint256 poolId = amm.createPool(token, USDT);
        console2.log("Pool ID:", poolId);

        // Approve
        IERC20(token).approve(address(amm), type(uint256).max);
        usdt.approve(address(amm), type(uint256).max);

        // Add liquidity
        amm.addLiquidity(poolId, 500 * 1e18, 1000 * 1e6);
        console2.log("Added liquidity");

        // Buy swaps
        amm.buyTokens(poolId, 50 * 1e6, 0);
        amm.buyTokens(poolId, 75 * 1e6, 0);
        console2.log("Buy swaps done");

        // Sell swap
        RoyaltyToken(token).approve(address(amm), type(uint256).max);
        amm.sellTokens(poolId, 10 * 1e18, 0);
        console2.log("Sell swap done");

        vm.stopBroadcast();
        console2.log("=== Complete ===");
    }
}
