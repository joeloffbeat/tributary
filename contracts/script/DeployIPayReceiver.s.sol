// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { IPayReceiver } from "../src/IPayReceiver.sol";

/// @title Deploy IPayReceiver
/// @notice Deployment script for IPayReceiver on Story Aeneid
contract DeployIPayReceiver is Script {
    // ============ Story Aeneid Addresses ============

    // Hyperlane Mailbox on Story Aeneid
    address public constant MAILBOX = 0x6feB4f3eeD23D6cdDa54ec67d5d649BE015f782d;

    // Bridged USDC on Story Aeneid (from Hyperlane warp route)
    address public constant USDC = 0x33641e15d8f590161a47Fe696cF3C819d5636e71;

    // WIP Token on Story Aeneid
    address public constant WIP = 0x1514000000000000000000000000000000000000;

    // Story Protocol Royalty Module
    address public constant ROYALTY_MODULE = 0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086;

    // Story Protocol Licensing Module
    address public constant LICENSING_MODULE = 0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f;

    // PIL Template (Programmable IP License)
    address public constant PIL_TEMPLATE = 0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316;

    // Story Protocol IP Asset Registry
    address public constant IP_ASSET_REGISTRY = 0x77319B4031e6eF1250907aa00018B8B1c67a244b;

    // Story Protocol Dispute Module
    address public constant DISPUTE_MODULE = 0x3F03e6aD8B8B82017cAb15f7d9e4d52b7aA25e63;

    // Story Protocol License Token (ERC721)
    address public constant LICENSE_TOKEN = 0xfE3838BFb30b34170F00030b52efa71999C4ec3B;

    // Initial exchange rate: 1 USDC = 10 WIP (10e18)
    uint256 public constant INITIAL_RATE = 10e18;

    function setUp() public { }

    function run() public returns (IPayReceiver receiver) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("=== Deploying IPayReceiver to Story Aeneid ===");
        console2.log("Deployer:", deployer);
        console2.log("");
        console2.log("Constructor Parameters:");
        console2.log("  Mailbox:", MAILBOX);
        console2.log("  USDC:", USDC);
        console2.log("  WIP:", WIP);
        console2.log("  Royalty Module:", ROYALTY_MODULE);
        console2.log("  Licensing Module:", LICENSING_MODULE);
        console2.log("  PIL Template:", PIL_TEMPLATE);
        console2.log("  IP Asset Registry:", IP_ASSET_REGISTRY);
        console2.log("  Dispute Module:", DISPUTE_MODULE);
        console2.log("  License Token:", LICENSE_TOKEN);
        console2.log("  Initial Rate:", INITIAL_RATE);
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        receiver = new IPayReceiver(
            MAILBOX,
            USDC,
            WIP,
            ROYALTY_MODULE,
            LICENSING_MODULE,
            PIL_TEMPLATE,
            IP_ASSET_REGISTRY,
            DISPUTE_MODULE,
            LICENSE_TOKEN,
            INITIAL_RATE
        );

        vm.stopBroadcast();

        console2.log("=== Deployment Complete ===");
        console2.log("IPayReceiver deployed at:", address(receiver));
        console2.log("Owner:", receiver.owner());
        console2.log("");
        console2.log("=== Next Steps ===");
        console2.log("1. Set trusted domains using ConfigureIPayReceiver script");
        console2.log("2. Deposit WIP liquidity:");
        console2.log("   wip.approve(receiver, amount)");
        console2.log("   receiver.depositWIP(amount)");

        return receiver;
    }
}

/// @title Configure IPayReceiver
/// @notice Script to configure IPayReceiver trusted domains after deployment
contract ConfigureIPayReceiver is Script {
    // Domain IDs
    uint32 public constant DOMAIN_AVALANCHE_FUJI = 43113;
    uint32 public constant DOMAIN_SEPOLIA = 11155111;
    uint32 public constant DOMAIN_AMOY = 80002;

    function run(
        address receiverAddress,
        address serverWalletFuji,
        address serverWalletSepolia,
        address serverWalletAmoy
    ) public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console2.log("=== Configuring IPayReceiver Trusted Domains ===");
        console2.log("Receiver:", receiverAddress);
        console2.log("");
        console2.log("Trusted Senders:");
        console2.log("  Fuji (43113):", serverWalletFuji);
        console2.log("  Sepolia (11155111):", serverWalletSepolia);
        console2.log("  Amoy (80002):", serverWalletAmoy);

        IPayReceiver receiver = IPayReceiver(receiverAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Set trusted domains
        if (serverWalletFuji != address(0)) {
            bytes32 sender = bytes32(uint256(uint160(serverWalletFuji)));
            receiver.setTrustedDomain(DOMAIN_AVALANCHE_FUJI, sender, true);
            console2.log("Set Fuji domain");
        }

        if (serverWalletSepolia != address(0)) {
            bytes32 sender = bytes32(uint256(uint160(serverWalletSepolia)));
            receiver.setTrustedDomain(DOMAIN_SEPOLIA, sender, true);
            console2.log("Set Sepolia domain");
        }

        if (serverWalletAmoy != address(0)) {
            bytes32 sender = bytes32(uint256(uint160(serverWalletAmoy)));
            receiver.setTrustedDomain(DOMAIN_AMOY, sender, true);
            console2.log("Set Amoy domain");
        }

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== Configuration Complete ===");
    }

    /// @notice Configure a single domain
    function runSingle(address receiverAddress, uint32 domain, address serverWallet) public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console2.log("=== Configuring Single Domain ===");
        console2.log("Receiver:", receiverAddress);
        console2.log("Domain:", domain);
        console2.log("Server Wallet:", serverWallet);

        IPayReceiver receiver = IPayReceiver(receiverAddress);

        vm.startBroadcast(deployerPrivateKey);

        bytes32 trustedSender = bytes32(uint256(uint160(serverWallet)));
        receiver.setTrustedDomain(domain, trustedSender, true);

        vm.stopBroadcast();

        console2.log("Trusted domain set successfully");
    }
}
