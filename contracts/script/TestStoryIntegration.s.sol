// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { IRegistrationWorkflows, WorkflowStructs, ISPGNFT } from "../src/interfaces/IStoryProtocol.sol";

/// @title Test Story Protocol Integration
/// @notice Debug script to test mintAndRegisterIpAndAttachPILTerms directly
contract TestStoryIntegration is Script {
    // Story Protocol addresses (Aeneid)
    address public constant REGISTRATION_WORKFLOWS = 0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424;
    address public constant ROYALTY_POLICY_LAP = 0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E;
    address public constant WIP_TOKEN = 0x1514000000000000000000000000000000000000;
    address public constant SPG_NFT = 0xDE91dE35B09fEAFcC1f2f56cA67472203B361529;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("=== Testing Story Protocol Integration ===");
        console2.log("Deployer:", deployer);
        console2.log("SPG NFT:", SPG_NFT);
        console2.log("RegistrationWorkflows:", REGISTRATION_WORKFLOWS);
        console2.log("");

        // Check SPG NFT state
        console2.log("SPG NFT total supply:", ISPGNFT(SPG_NFT).totalSupply());

        // Check if RegistrationWorkflows has MINTER_ROLE
        bytes32 MINTER_ROLE = keccak256("MINTER_ROLE");
        bool hasMinterRole = ISPGNFT(SPG_NFT).hasRole(MINTER_ROLE, REGISTRATION_WORKFLOWS);
        console2.log("RegistrationWorkflows has MINTER_ROLE:", hasMinterRole);

        // Create PILTerms (simple non-commercial)
        WorkflowStructs.PILTerms memory terms = WorkflowStructs.PILTerms({
            transferable: true,
            royaltyPolicy: ROYALTY_POLICY_LAP,
            defaultMintingFee: 0,
            expiration: 0,
            commercialUse: false,
            commercialAttribution: false,
            commercializerChecker: address(0),
            commercializerCheckerData: "",
            commercialRevShare: 0,
            commercialRevCeiling: 0,
            derivativesAllowed: true,
            derivativesAttribution: true,
            derivativesApproval: false,
            derivativesReciprocal: false,
            derivativeRevCeiling: 0,
            currency: WIP_TOKEN,
            uri: ""
        });

        // Create IP metadata
        WorkflowStructs.IPMetadata memory ipMetadata = WorkflowStructs.IPMetadata({
            ipMetadataURI: "ipfs://test-metadata",
            ipMetadataHash: keccak256("test-metadata"),
            nftMetadataURI: "ipfs://test-nft-metadata",
            nftMetadataHash: keccak256("test-nft-metadata")
        });

        // Create license terms data array
        WorkflowStructs.LicenseTermsData[] memory licenseTermsData = new WorkflowStructs.LicenseTermsData[](1);
        licenseTermsData[0] = WorkflowStructs.LicenseTermsData({
            terms: terms,
            licensingConfig: WorkflowStructs.LicensingConfig({
                isSet: false,
                mintingFee: 0,
                licensingHook: address(0),
                hookData: "",
                commercialRevShare: 0,
                disabled: false,
                expectMinimumGroupRewardShare: 0,
                expectGroupRewardPool: address(0)
            })
        });

        console2.log("");
        console2.log("Attempting mintAndRegisterIpAndAttachPILTerms...");

        vm.startBroadcast(deployerPrivateKey);

        try IRegistrationWorkflows(REGISTRATION_WORKFLOWS).mintAndRegisterIpAndAttachPILTerms(
            SPG_NFT,
            deployer,
            ipMetadata,
            licenseTermsData,
            true
        ) returns (address ipId, uint256 tokenId, uint256[] memory termIds) {
            console2.log("SUCCESS!");
            console2.log("IP ID:", ipId);
            console2.log("Token ID:", tokenId);
            console2.log("License Terms IDs count:", termIds.length);
        } catch Error(string memory reason) {
            console2.log("FAILED with reason:", reason);
        } catch (bytes memory lowLevelData) {
            console2.log("FAILED with low-level error");
            console2.logBytes(lowLevelData);
        }

        vm.stopBroadcast();
    }
}
