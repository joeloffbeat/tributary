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
        return tx.origin == relayer;
    }
}

interface IMailbox {
    function setDefaultIsm(address _ism) external;
    function defaultIsm() external view returns (address);
    function owner() external view returns (address);
}

/**
 * @title DeployTrustedRelayerIsmAllChains
 * @notice Deploy TrustedRelayerIsmV2 and set as default ISM on self-hosted mailboxes
 *
 * Usage for each chain:
 *   forge script script/DeployTrustedRelayerIsmAllChains.s.sol:DeployTrustedRelayerIsmAllChains \
 *     --rpc-url $RPC_URL --broadcast --private-key $HYP_KEY
 *
 * Chains to run on:
 *   - Sepolia: RPC_URL=$RPC_SEPOLIA
 *   - Fuji: RPC_URL=$RPC_AVALANCHE_FUJI
 *   - Story Aenid: RPC_URL=$RPC_STORY_AENID
 *   - Polygon Amoy: RPC_URL=$RPC_POLYGON_AMOY
 */
contract DeployTrustedRelayerIsmAllChains is Script {
    // Trusted relayer address (HYP_KEY)
    address constant HYP_KEY = 0x32FE11d9900D63350016374BE98ff37c3Af75847;

    // Mailbox addresses per chain
    function getMailbox() internal view returns (address) {
        if (block.chainid == 11155111) return 0x60c3ca08D3df3F5fA583c535D9E44F3629F52452; // Sepolia
        if (block.chainid == 43113) return 0x60c3ca08D3df3F5fA583c535D9E44F3629F52452;    // Fuji
        if (block.chainid == 1315) return 0x6feB4f3eeD23D6cdDa54ec67d5d649BE015f782d;     // Story Aenid
        if (block.chainid == 80002) return 0xD8f50a509EFe389574dD378b0EF03e33558222eA;    // Polygon Amoy
        revert("Unknown chain");
    }

    function run() external {
        address MAILBOX = getMailbox();
        // Use HYP_KEY which is the mailbox owner
        uint256 deployerKey = vm.envUint("HYP_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("=== Deploying TrustedRelayerIsmV2 ===");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Trusted relayer (HYP_KEY):", HYP_KEY);
        console.log("Target mailbox:", MAILBOX);

        // Check mailbox
        IMailbox mailbox = IMailbox(MAILBOX);
        address mailboxOwner = mailbox.owner();
        address currentIsm = mailbox.defaultIsm();

        console.log("Mailbox owner:", mailboxOwner);
        console.log("Current default ISM:", currentIsm);

        require(mailboxOwner == deployer, "Deployer is not mailbox owner");

        vm.startBroadcast(deployerKey);

        // Deploy TrustedRelayerIsmV2
        TrustedRelayerIsmV2 ism = new TrustedRelayerIsmV2(HYP_KEY);
        console.log("Deployed TrustedRelayerIsmV2 at:", address(ism));

        // Set as default ISM
        mailbox.setDefaultIsm(address(ism));
        console.log("New default ISM:", mailbox.defaultIsm());

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("Add this to your deployment records:");
        console.log("trustedRelayerIsm:", address(ism));
    }
}
