// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IRoyaltyModule, ILicensingModule, IIPAssetRegistry, IDisputeModule, ILicenseToken, IRegistrationWorkflows, IDerivativeWorkflows, ILicenseAttachmentWorkflows, WorkflowStructs, ISPGNFT } from "../interfaces/IStoryProtocol.sol";

/// @title IPayLib
/// @notice Library containing handler logic for IPayReceiver to reduce contract size
library IPayLib {
    using SafeERC20 for IERC20;

    // ============ Structs ============

    struct StoryAddresses {
        address royaltyModule;
        address licensingModule;
        address pilTemplate;
        address ipAssetRegistry;
        address disputeModule;
        address licenseToken;
        address registrationWorkflows;
        address derivativeWorkflows;
    }

    struct MintLicenseParams {
        bytes32 messageId;
        address ipId;
        uint256 licenseTermsId;
        uint256 wipAmount;
        address recipient;
        uint256 listingId;
    }

    struct MintAndRegisterParams {
        bytes32 messageId;
        address creator;
        string ipMetadataUri;
        string nftMetadataUri;
        bytes encodedLicenseTerms;
        address targetCollection;
    }

    struct DerivativeWithLicenseParams {
        bytes32 messageId;
        address creator;
        uint256[] licenseTokenIds;
        string ipMetadataUri;
        string nftMetadataUri;
        address targetCollection;
    }

    // ============ Events ============

    event LicenseMinted(bytes32 indexed messageId, address indexed ipId, address indexed recipient, uint256 licenseTokenId, uint256 wipAmount);
    event IPMintedAndRegistered(bytes32 indexed messageId, address indexed ipId, address indexed creator, uint256 tokenId, uint256[] licenseTermsIds);
    event CollectionCreated(bytes32 indexed messageId, address indexed creator, address indexed collection);
    event DerivativeCreatedWithLicense(bytes32 indexed messageId, address indexed derivativeIpId, address indexed creator, uint256 tokenId);
    event LicenseMintedWithFee(bytes32 indexed messageId, address indexed ipId, address indexed recipient, uint256 licenseTokenId, uint256 mintingFee);

    // ============ Library Functions ============

    /// @notice Execute mint license operation
    function executeMintLicense(
        MintLicenseParams memory params,
        StoryAddresses memory addrs,
        IERC20 wip
    ) external returns (bool success, uint256 tokenId) {
        wip.approve(addrs.royaltyModule, params.wipAmount);

        IRoyaltyModule(addrs.royaltyModule).payRoyaltyOnBehalf(
            params.ipId, address(0), address(wip), params.wipAmount
        );

        tokenId = ILicensingModule(addrs.licensingModule).mintLicenseTokens(
            params.ipId, addrs.pilTemplate, params.licenseTermsId, 1, params.recipient, ""
        );

        success = true;
    }

    /// @notice Execute mint and register IP operation
    function executeMintAndRegister(
        MintAndRegisterParams memory params,
        address licenseAttachmentWorkflows
    ) external returns (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds) {
        WorkflowStructs.PILTerms memory terms = abi.decode(params.encodedLicenseTerms, (WorkflowStructs.PILTerms));

        WorkflowStructs.IPMetadata memory ipMetadata = WorkflowStructs.IPMetadata({
            ipMetadataURI: params.ipMetadataUri,
            ipMetadataHash: keccak256(bytes(params.ipMetadataUri)),
            nftMetadataURI: params.nftMetadataUri,
            nftMetadataHash: keccak256(bytes(params.nftMetadataUri))
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

        (ipId, tokenId, licenseTermsIds) = ILicenseAttachmentWorkflows(licenseAttachmentWorkflows).mintAndRegisterIpAndAttachPILTerms(
            params.targetCollection,
            params.creator,
            ipMetadata,
            licenseTermsData,
            true
        );
    }

    /// @notice Create collection for creator
    function createCollection(
        address registrationWorkflows,
        address creator,
        bytes memory collectionParams
    ) external returns (address collection) {
        (
            string memory name,
            string memory symbol,
            string memory baseURI,
            string memory contractURI,
            uint32 maxSupply
        ) = abi.decode(collectionParams, (string, string, string, string, uint32));

        collection = IRegistrationWorkflows(registrationWorkflows).createCollection(
            ISPGNFT.InitParams({
                name: name,
                symbol: symbol,
                baseURI: baseURI,
                contractURI: contractURI,
                maxSupply: maxSupply,
                mintFee: 0,
                mintFeeToken: address(0),
                mintFeeRecipient: creator,
                owner: creator,
                mintOpen: true,
                isPublicMinting: false
            })
        );
    }

    /// @notice Execute derivative creation with license tokens
    function executeDerivativeWithLicense(
        DerivativeWithLicenseParams memory params,
        address derivativeWorkflows
    ) external returns (address ipId, uint256 tokenId) {
        WorkflowStructs.IPMetadata memory ipMetadata = WorkflowStructs.IPMetadata({
            ipMetadataURI: params.ipMetadataUri,
            ipMetadataHash: keccak256(bytes(params.ipMetadataUri)),
            nftMetadataURI: params.nftMetadataUri,
            nftMetadataHash: keccak256(bytes(params.nftMetadataUri))
        });

        (ipId, tokenId) = IDerivativeWorkflows(derivativeWorkflows).mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
            params.targetCollection,
            params.licenseTokenIds,
            "",
            0,
            ipMetadata,
            params.creator,
            true
        );
    }

    /// @notice Execute mint license with fee
    function executeMintLicenseWithFee(
        address licensingModule,
        address pilTemplate,
        address ipId,
        uint256 licenseTermsId,
        address recipient,
        uint256 maxMintingFee,
        uint32 maxRevenueShare
    ) external returns (uint256 tokenId) {
        tokenId = ILicensingModule(licensingModule).mintLicenseTokens(
            ipId, pilTemplate, licenseTermsId, 1, recipient, "", maxMintingFee, maxRevenueShare
        );
    }
}
