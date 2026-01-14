// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

/**
 * @title TrustedRelayerIsmV2
 * @notice ISM that trusts messages relayed by a specific address
 * @dev Uses tx.origin because the mailbox is the direct caller of verify()
 */
contract TrustedRelayerIsmV2 {
    address public immutable relayer;

    constructor(address _relayer) {
        relayer = _relayer;
    }

    function moduleType() external pure returns (uint8) {
        return 6; // TRUSTED_RELAYER type
    }

    function verify(bytes calldata, bytes calldata) external view returns (bool) {
        // When mailbox.process() is called by the relayer:
        // - tx.origin = relayer (the EOA that initiated the transaction)
        // - msg.sender = mailbox (which calls ism.verify())
        // So we check tx.origin, not msg.sender
        return tx.origin == relayer;
    }
}

interface IMailbox {
    function setDefaultIsm(address _ism) external;
    function defaultIsm() external view returns (address);
}

contract DeployTrustedRelayerIsmV2 is Script {
    address constant STORY_MAILBOX = 0x6feB4f3eeD23D6cdDa54ec67d5d649BE015f782d;
    address constant HYP_KEY = 0x32FE11d9900D63350016374BE98ff37c3Af75847;

    function run() external {
        uint256 hypKey = vm.envUint("HYP_KEY");

        console.log("=== Deploying TrustedRelayerIsmV2 ===");
        console.log("Trusted relayer (HYP_KEY):", HYP_KEY);

        IMailbox mailbox = IMailbox(STORY_MAILBOX);
        console.log("Current default ISM:", mailbox.defaultIsm());

        vm.startBroadcast(hypKey);

        // Deploy new ISM that checks tx.origin
        TrustedRelayerIsmV2 ism = new TrustedRelayerIsmV2(HYP_KEY);
        console.log("Deployed TrustedRelayerIsmV2 at:", address(ism));

        // Set as default ISM (HYP_KEY is mailbox owner)
        mailbox.setDefaultIsm(address(ism));
        console.log("New default ISM:", mailbox.defaultIsm());

        vm.stopBroadcast();

        console.log("=== SUCCESS ===");
    }
}
