// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {StoryBridge} from "../src/crosschain/StoryBridge.sol";
import {StoryReceiver} from "../src/crosschain/StoryReceiver.sol";

contract DeployStoryBridge is Script {
    // Mantle Sepolia Hyperlane Mailbox (from official registry)
    address constant MANTLE_MAILBOX = 0xE495652b291B836334465680156Ce50a100aF52f;
    uint32 constant STORY_DOMAIN_ID = 1315;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        bytes32 storyReceiver = vm.envBytes32("STORY_RECEIVER");

        vm.startBroadcast(deployerPrivateKey);

        StoryBridge bridge = new StoryBridge(
            MANTLE_MAILBOX,
            STORY_DOMAIN_ID,
            storyReceiver
        );

        console.log("StoryBridge deployed to:", address(bridge));

        vm.stopBroadcast();
    }
}

contract DeployStoryReceiver is Script {
    // Story Aeneid Hyperlane Mailbox (from self-hosted deployment)
    address constant STORY_MAILBOX = 0x6358751e78EfE5970D04C5c310A40924772D1df5;
    uint32 constant MANTLE_DOMAIN_ID = 5003;

    // Story Protocol Contracts on Aeneid
    address constant ROYALTY_MODULE = 0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086;
    address constant ROYALTY_WORKFLOWS = 0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890;
    address constant DISPUTE_MODULE = 0x3F03e6aD8B8B82017cAb15f7d9e4d52b7aA25e63;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        bytes32 mantleBridge = vm.envBytes32("MANTLE_BRIDGE");

        vm.startBroadcast(deployerPrivateKey);

        StoryReceiver receiver = new StoryReceiver(
            STORY_MAILBOX,
            MANTLE_DOMAIN_ID,
            mantleBridge,
            ROYALTY_MODULE,
            ROYALTY_WORKFLOWS,
            DISPUTE_MODULE
        );

        console.log("StoryReceiver deployed to:", address(receiver));

        vm.stopBroadcast();
    }
}
