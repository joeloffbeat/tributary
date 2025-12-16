// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";

interface IPayReceiver {
    function setTrustedDomain(uint32 domain, bytes32 sender, bool enabled) external;
    function setTrustedDomainsBatch(uint32[] calldata domains, bytes32[] calldata senders, bool[] calldata flags) external;
    function isDomainTrusted(uint32 domain) external view returns (bool);
    function getDomainConfig(uint32 domain) external view returns (bool enabled, bytes32 sender);
}

/// @title Configure Trusted Domains
/// @notice Sets trusted domains on IPayReceiver for cross-chain messaging
contract ConfigureTrustedDomains is Script {
    // Story Aeneid IPayReceiver
    address public constant IPAY_RECEIVER = 0xA5Cf9339908C3970c2e9Ac4aC0105367f53B80cB;

    // Domain IDs (Hyperlane chain identifiers)
    uint32 public constant DOMAIN_AVALANCHE_FUJI = 43113;
    uint32 public constant DOMAIN_SEPOLIA = 11155111;
    uint32 public constant DOMAIN_AMOY = 80002;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address serverWallet = vm.envAddress("SERVER_WALLET_ADDRESS");

        console2.log("=== Configuring Trusted Domains ===");
        console2.log("Deployer:", deployer);
        console2.log("Server Wallet (trusted sender):", serverWallet);
        console2.log("IPayReceiver:", IPAY_RECEIVER);
        console2.log("");

        IPayReceiver receiver = IPayReceiver(IPAY_RECEIVER);

        // Check current state
        console2.log("Current domain trust status:");
        console2.log("  Fuji (43113):", receiver.isDomainTrusted(DOMAIN_AVALANCHE_FUJI));
        console2.log("  Sepolia (11155111):", receiver.isDomainTrusted(DOMAIN_SEPOLIA));
        console2.log("  Amoy (80002):", receiver.isDomainTrusted(DOMAIN_AMOY));
        console2.log("");

        // Convert server wallet address to bytes32
        bytes32 senderBytes = bytes32(uint256(uint160(serverWallet)));
        console2.log("Trusted sender (bytes32):");
        console2.logBytes32(senderBytes);
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Configure all three domains in batch
        uint32[] memory domains = new uint32[](3);
        bytes32[] memory senders = new bytes32[](3);
        bool[] memory flags = new bool[](3);

        domains[0] = DOMAIN_AVALANCHE_FUJI;
        domains[1] = DOMAIN_SEPOLIA;
        domains[2] = DOMAIN_AMOY;

        senders[0] = senderBytes;
        senders[1] = senderBytes;
        senders[2] = senderBytes;

        flags[0] = true;
        flags[1] = true;
        flags[2] = true;

        console2.log("Setting trusted domains in batch...");
        receiver.setTrustedDomainsBatch(domains, senders, flags);

        vm.stopBroadcast();

        // Verify configuration
        console2.log("");
        console2.log("=== Configuration Complete ===");
        console2.log("Updated domain trust status:");
        console2.log("  Fuji (43113):", receiver.isDomainTrusted(DOMAIN_AVALANCHE_FUJI));
        console2.log("  Sepolia (11155111):", receiver.isDomainTrusted(DOMAIN_SEPOLIA));
        console2.log("  Amoy (80002):", receiver.isDomainTrusted(DOMAIN_AMOY));
    }
}
