// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {StoryBridge} from "../src/crosschain/StoryBridge.sol";

contract TestPayRoyalty is Script {
    // StoryBridge on Mantle Sepolia
    address constant STORY_BRIDGE = 0x75076759a923c36C97675dD11A93d04DE3Bb5bf4;

    // Test IP ID (any address works for testing message dispatch)
    address constant TEST_IP_ID = 0x1234567890123456789012345678901234567890;

    // WIP Token on Story
    address constant WIP_TOKEN = 0x1514000000000000000000000000000000000000;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        StoryBridge bridge = StoryBridge(payable(STORY_BRIDGE));

        // Get quote
        uint256 fee = bridge.quotePayRoyalty(TEST_IP_ID, WIP_TOKEN, 1 ether);
        console.log("Quote fee:", fee);

        // Send payRoyalty with some extra gas for safety
        bytes32 messageId = bridge.payRoyalty{value: fee + 0.01 ether}(
            TEST_IP_ID,
            WIP_TOKEN,
            1 ether
        );

        console.log("Message dispatched!");
        console.logBytes32(messageId);

        vm.stopBroadcast();
    }
}

contract TestClaimRevenue is Script {
    address constant STORY_BRIDGE = 0x75076759a923c36C97675dD11A93d04DE3Bb5bf4;
    address constant TEST_IP_ID = 0x1234567890123456789012345678901234567890;
    address constant WIP_TOKEN = 0x1514000000000000000000000000000000000000;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        StoryBridge bridge = StoryBridge(payable(STORY_BRIDGE));

        address[] memory tokens = new address[](1);
        tokens[0] = WIP_TOKEN;

        address[] memory childIpIds = new address[](0);

        uint256 fee = bridge.quoteClaimRevenue(TEST_IP_ID, tokens, childIpIds);
        console.log("Quote fee:", fee);

        bytes32 messageId = bridge.claimRevenue{value: fee + 0.01 ether}(
            TEST_IP_ID,
            tokens,
            childIpIds
        );

        console.log("ClaimRevenue message dispatched!");
        console.logBytes32(messageId);

        vm.stopBroadcast();
    }
}

contract TestRaiseDispute is Script {
    address constant STORY_BRIDGE = 0x75076759a923c36C97675dD11A93d04DE3Bb5bf4;
    address constant TEST_IP_ID = 0x1234567890123456789012345678901234567890;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        StoryBridge bridge = StoryBridge(payable(STORY_BRIDGE));

        // Test evidence hash and tag
        bytes32 evidenceHash = keccak256("test-evidence-cid");
        bytes32 targetTag = keccak256("PLAGIARISM");

        uint256 fee = bridge.quoteRaiseDispute(TEST_IP_ID, evidenceHash, targetTag);
        console.log("Quote fee:", fee);

        bytes32 messageId = bridge.raiseDispute{value: fee + 0.01 ether}(
            TEST_IP_ID,
            evidenceHash,
            targetTag
        );

        console.log("RaiseDispute message dispatched!");
        console.logBytes32(messageId);

        vm.stopBroadcast();
    }
}
