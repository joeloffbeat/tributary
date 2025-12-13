// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { LicenseMarketplace } from "../src/LicenseMarketplace.sol";

/// @title Deploy LicenseMarketplace
/// @notice Deployment script for LicenseMarketplace on Avalanche Fuji
contract DeployLicenseMarketplace is Script {
    // ============ Avalanche Fuji Addresses ============

    // USDC on Avalanche Fuji
    address public constant USDC = 0x5425890298aed601595a70AB815c96711a31Bc65;

    // Platform fee: 2.5% (250 basis points)
    uint256 public constant PLATFORM_FEE = 250;

    function setUp() public {}

    function run() public returns (LicenseMarketplace marketplace) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("=== Deploying LicenseMarketplace to Avalanche Fuji ===");
        console2.log("Deployer:", deployer);
        console2.log("");
        console2.log("Constructor Parameters:");
        console2.log("  USDC:", USDC);
        console2.log("  Fee Recipient:", deployer);
        console2.log("  Platform Fee:", PLATFORM_FEE, "basis points (2.5%)");
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        marketplace = new LicenseMarketplace(USDC, deployer, PLATFORM_FEE);

        vm.stopBroadcast();

        console2.log("=== Deployment Complete ===");
        console2.log("LicenseMarketplace deployed at:", address(marketplace));
        console2.log("Owner:", marketplace.owner());
        console2.log("Fee Recipient:", marketplace.feeRecipient());
        console2.log("Platform Fee:", marketplace.platformFee());

        return marketplace;
    }
}
