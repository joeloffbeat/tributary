// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

/**
 * @title TrustedRelayerIsm
 * @notice Simple ISM that trusts a single relayer address
 */
contract TrustedRelayerIsm {
    address public immutable relayer;

    constructor(address _relayer) {
        relayer = _relayer;
    }

    function moduleType() external pure returns (uint8) {
        return 6; // TRUSTED_RELAYER type
    }

    function verify(bytes calldata, bytes calldata) external view returns (bool) {
        return msg.sender == relayer;
    }
}

interface IMailbox {
    function setDefaultIsm(address _ism) external;
    function defaultIsm() external view returns (address);
    function owner() external view returns (address);
}

/**
 * @title DeployTrustedRelayerIsm
 * @notice Deploy TrustedRelayerIsm and set it as default ISM on self-hosted mailbox
 */
contract DeployTrustedRelayerIsm is Script {
    // Self-hosted mailbox on Story
    address constant STORY_MAILBOX = 0x6feB4f3eeD23D6cdDa54ec67d5d649BE015f782d;

    // HYP_KEY - the trusted relayer
    address constant HYP_KEY = 0x32FE11d9900D63350016374BE98ff37c3Af75847;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("=== Deploying TrustedRelayerIsm ===");
        console.log("Deployer:", deployer);
        console.log("Trusted relayer (HYP_KEY):", HYP_KEY);
        console.log("Target mailbox:", STORY_MAILBOX);

        // Check mailbox owner
        IMailbox mailbox = IMailbox(STORY_MAILBOX);
        address mailboxOwner = mailbox.owner();
        console.log("Mailbox owner:", mailboxOwner);
        console.log("Current default ISM:", mailbox.defaultIsm());

        vm.startBroadcast(deployerKey);

        // Deploy TrustedRelayerIsm
        TrustedRelayerIsm ism = new TrustedRelayerIsm(HYP_KEY);
        console.log("Deployed TrustedRelayerIsm at:", address(ism));

        // Set as default ISM (only if we're the owner)
        if (mailboxOwner == deployer) {
            console.log("Setting as default ISM...");
            mailbox.setDefaultIsm(address(ism));
            console.log("New default ISM:", mailbox.defaultIsm());
        } else {
            console.log("WARNING: Cannot set default ISM - not mailbox owner");
            console.log("Mailbox owner needs to call: mailbox.setDefaultIsm(", address(ism), ")");
        }

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
    }
}
