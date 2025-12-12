// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Deployment Script Template
 *
 * Usage: Copy this template when creating a deployment script
 * Replace: __CONTRACT_NAME__
 */

import "forge-std/Script.sol";
import "../src/__CONTRACT_NAME__.sol";

contract Deploy__CONTRACT_NAME__Script is Script {
    function run() public returns (__CONTRACT_NAME__ instance) {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Deployment Info ===");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);
        console.log("Chain ID:", block.chainid);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy contract
        instance = new __CONTRACT_NAME__();
        console.log("__CONTRACT_NAME__ deployed at:", address(instance));

        // Post-deployment setup (if needed)
        // instance.initialize(...);
        // instance.grantRole(...);

        vm.stopBroadcast();

        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("Update deployment.config.json with:");
        console.log('  "__CONTRACT_NAME__": {');
        console.log('    "address": "', address(instance), '",');
        console.log('    "verified": false');
        console.log("  }");

        return instance;
    }
}

/**
 * Usage:
 *
 * 1. Set environment variables:
 *    export PRIVATE_KEY=0x...
 *    export SEPOLIA_RPC_URL=https://...
 *
 * 2. Run deployment:
 *    forge script script/Deploy__CONTRACT_NAME__.s.sol:Deploy__CONTRACT_NAME__Script \
 *      --rpc-url "$SEPOLIA_RPC_URL" \
 *      --broadcast -vvv
 *
 * 3. Verify contract:
 *    forge verify-contract <ADDRESS> src/__CONTRACT_NAME__.sol:__CONTRACT_NAME__ \
 *      --chain-id 11155111 \
 *      --verifier blockscout \
 *      --verifier-url "https://eth-sepolia.blockscout.com/api/" \
 *      --watch
 *
 * 4. Update deployment.config.json with the deployed address
 *
 * 5. Sync ABI to frontend:
 *    cp contracts/out/__CONTRACT_NAME__.sol/__CONTRACT_NAME__.json \
 *       frontend/constants/contracts/{chainId}/abis/
 */
