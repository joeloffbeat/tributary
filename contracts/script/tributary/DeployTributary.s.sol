// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { MockUSDT } from "../../src/tributary/MockUSDT.sol";
import { RoyaltyVaultFactory } from "../../src/tributary/RoyaltyVaultFactory.sol";
import { RoyaltyMarketplace } from "../../src/tributary/RoyaltyMarketplace.sol";
import { TributaryAMM } from "../../src/tributary/TributaryAMM.sol";

/// @title DeployTributary
/// @notice Deployment script for Tributary contracts
contract DeployTributary is Script {
    function setUp() public { }

    function run() public returns (address usdt, address factory, address marketplace, address amm) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address protocolTreasury = vm.envAddress("PROTOCOL_TREASURY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("=== Tributary Deployment ===");
        console2.log("Deployer:", deployer);
        console2.log("Protocol Treasury:", protocolTreasury);
        console2.log("Chain ID:", block.chainid);
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockUSDT
        console2.log("Deploying MockUSDT...");
        MockUSDT usdtContract = new MockUSDT();
        usdt = address(usdtContract);
        console2.log("MockUSDT deployed at:", usdt);

        // 2. Deploy RoyaltyVaultFactory
        console2.log("Deploying RoyaltyVaultFactory...");
        RoyaltyVaultFactory factoryContract = new RoyaltyVaultFactory(protocolTreasury);
        factory = address(factoryContract);
        console2.log("RoyaltyVaultFactory deployed at:", factory);

        // 3. Deploy RoyaltyMarketplace with factory address
        console2.log("Deploying RoyaltyMarketplace...");
        RoyaltyMarketplace marketplaceContract = new RoyaltyMarketplace(factory, protocolTreasury);
        marketplace = address(marketplaceContract);
        console2.log("RoyaltyMarketplace deployed at:", marketplace);

        // 4. Deploy TributaryAMM
        console2.log("Deploying TributaryAMM...");
        TributaryAMM ammContract = new TributaryAMM(factory, protocolTreasury);
        amm = address(ammContract);
        console2.log("TributaryAMM deployed at:", amm);

        vm.stopBroadcast();

        // Log deployment summary
        console2.log("");
        console2.log("=== Deployment Complete ===");
        console2.log("MockUSDT:", usdt);
        console2.log("Factory:", factory);
        console2.log("Marketplace:", marketplace);
        console2.log("AMM:", amm);
        console2.log("Treasury:", protocolTreasury);
        console2.log("");
        console2.log("Save these addresses to deployments/mantle-sepolia.json");

        return (usdt, factory, marketplace, amm);
    }
}
