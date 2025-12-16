// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { ILicenseAttachmentWorkflows, WorkflowStructs } from "../src/interfaces/IStoryProtocol.sol";

contract SimulateMint is Script {
    // IMPORTANT: mintAndRegisterIpAndAttachPILTerms is in LicenseAttachmentWorkflows, NOT RegistrationWorkflows
    address constant LICENSE_ATTACHMENT_WORKFLOWS = 0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8;
    address constant SPG_NFT = 0x15B95de4d7096d002A3505016cc13c9bbd4747Ab;
    address constant RECIPIENT = 0x32FE11d9900D63350016374BE98ff37c3Af75847;
    
    function run() public {
        // Create metadata
        WorkflowStructs.IPMetadata memory ipMetadata = WorkflowStructs.IPMetadata({
            ipMetadataURI: "https://ipfs.io/ipfs/bafkreif7ovkb5kerfbqjlzzozhjpdbrd7i2g3dh36uxs2qkfpbogfsohu",
            ipMetadataHash: keccak256("https://ipfs.io/ipfs/bafkreif7ovkb5kerfbqjlzzozhjpdbrd7i2g3dh36uxs2qkfpbogfsohu"),
            nftMetadataURI: "https://ipfs.io/ipfs/bafkreigpf7cjjan5vknhhu6kttv244rnmqg2nhaaln2l22633ylg5rnjp4",
            nftMetadataHash: keccak256("https://ipfs.io/ipfs/bafkreigpf7cjjan5vknhhu6kttv244rnmqg2nhaaln2l22633ylg5rnjp4")
        });
        
        // Create license terms
        WorkflowStructs.PILTerms memory terms = WorkflowStructs.PILTerms({
            transferable: true,
            royaltyPolicy: 0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E,
            defaultMintingFee: 0.01 ether,
            expiration: 0,
            commercialUse: true,
            commercialAttribution: true,
            commercializerChecker: address(0),
            commercializerCheckerData: "",
            commercialRevShare: 1000, // 10% in basis points (10000 = 100%)
            commercialRevCeiling: 0,
            derivativesAllowed: true,
            derivativesAttribution: true,
            derivativesApproval: false,
            derivativesReciprocal: false,
            derivativeRevCeiling: 0,
            currency: 0x1514000000000000000000000000000000000000,
            uri: ""
        });
        
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
        
        console2.log("Calling mintAndRegisterIpAndAttachPILTerms on LicenseAttachmentWorkflows...");
        console2.log("SPG NFT:", SPG_NFT);
        console2.log("Recipient:", RECIPIENT);
        console2.log("LicenseAttachmentWorkflows:", LICENSE_ATTACHMENT_WORKFLOWS);

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Call mintAndRegisterIpAndAttachPILTerms on LicenseAttachmentWorkflows (NOT RegistrationWorkflows)
        (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds) =
            ILicenseAttachmentWorkflows(LICENSE_ATTACHMENT_WORKFLOWS).mintAndRegisterIpAndAttachPILTerms(
                SPG_NFT,
                RECIPIENT,
                ipMetadata,
                licenseTermsData,
                true
            );

        vm.stopBroadcast();

        console2.log("SUCCESS!");
        console2.log("IP ID:", ipId);
        console2.log("Token ID:", tokenId);
        if (licenseTermsIds.length > 0) {
            console2.log("License Terms ID:", licenseTermsIds[0]);
        }
    }
}
