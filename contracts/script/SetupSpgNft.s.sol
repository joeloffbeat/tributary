// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { IPayReceiver } from "../src/IPayReceiver.sol";
import { IRegistrationWorkflows, ISPGNFT } from "../src/interfaces/IStoryProtocol.sol";

/// @title Setup SPG NFT Collection for IPayReceiver
/// @notice Creates an SPG NFT collection and sets it on IPayReceiver
contract SetupSpgNft is Script {
    // Story Protocol Registration Workflows (SPG) - Aeneid Testnet
    address public constant REGISTRATION_WORKFLOWS = 0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424;

    // IPayReceiver deployed address (Story Aeneid)
    address public constant IPAY_RECEIVER = 0x84cfED6aD4B772eB5293409639cFEb0364d0c347;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("=== Setting up SPG NFT Collection for IPayReceiver ===");
        console2.log("Deployer:", deployer);
        console2.log("IPayReceiver:", IPAY_RECEIVER);
        console2.log("Registration Workflows:", REGISTRATION_WORKFLOWS);
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Create SPG NFT collection with IPayReceiver as the owner
        ISPGNFT.InitParams memory params = ISPGNFT.InitParams({
            name: "iPay IP Assets",
            symbol: "IPAY-IP",
            baseURI: "",
            contractURI: "",
            maxSupply: 10000,
            mintFee: 0, // No mint fee
            mintFeeToken: address(0),
            mintFeeRecipient: address(0),
            owner: IPAY_RECEIVER, // IPayReceiver is the owner so it can mint
            mintOpen: true, // Allow minting
            isPublicMinting: true // Allow public minting via Registration Workflows
        });

        address spgNftContract = IRegistrationWorkflows(REGISTRATION_WORKFLOWS).createCollection(params);
        console2.log("SPG NFT Collection created at:", spgNftContract);

        // Set the SPG NFT contract on IPayReceiver
        IPayReceiver(IPAY_RECEIVER).setSpgNftContract(spgNftContract);
        console2.log("SPG NFT contract set on IPayReceiver");

        // Grant MINTER_ROLE to RegistrationWorkflows
        IPayReceiver(IPAY_RECEIVER).grantMinterRoleToWorkflows();
        console2.log("MINTER_ROLE granted to RegistrationWorkflows");

        vm.stopBroadcast();

        // Verify
        address setContract = IPayReceiver(IPAY_RECEIVER).spgNftContract();
        console2.log("");
        console2.log("=== Setup Complete ===");
        console2.log("SPG NFT Contract on IPayReceiver:", setContract);
        require(setContract == spgNftContract, "SPG NFT contract not set correctly");
    }

    /// @notice Just set an existing SPG NFT contract on IPayReceiver
    function setExisting(address spgNftContract) public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console2.log("=== Setting existing SPG NFT on IPayReceiver ===");
        console2.log("SPG NFT Contract:", spgNftContract);
        console2.log("IPayReceiver:", IPAY_RECEIVER);

        vm.startBroadcast(deployerPrivateKey);
        IPayReceiver(IPAY_RECEIVER).setSpgNftContract(spgNftContract);
        vm.stopBroadcast();

        console2.log("SPG NFT contract set successfully");
    }

    /// @notice Grant MINTER_ROLE to RegistrationWorkflows on existing SPG NFT
    function grantMinterRole() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console2.log("=== Granting MINTER_ROLE to RegistrationWorkflows ===");
        console2.log("IPayReceiver:", IPAY_RECEIVER);
        console2.log("RegistrationWorkflows:", REGISTRATION_WORKFLOWS);

        vm.startBroadcast(deployerPrivateKey);
        IPayReceiver(IPAY_RECEIVER).grantMinterRoleToWorkflows();
        vm.stopBroadcast();

        console2.log("MINTER_ROLE granted successfully");
    }
}
