// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Story Protocol Interfaces
/// @notice Interfaces for interacting with Story Protocol contracts

/// @notice Story Protocol Royalty Module interface
interface IRoyaltyModule {
    function payRoyaltyOnBehalf(address receiverIpId, address payerIpId, address token, uint256 amount) external;
}

/// @notice Story Protocol Licensing Module interface
interface ILicensingModule {
    function mintLicenseTokens(
        address licensorIpId,
        address licenseTemplate,
        uint256 licenseTermsId,
        uint256 amount,
        address receiver,
        bytes calldata royaltyContext
    ) external returns (uint256 startLicenseTokenId);

    /// @notice Mint license tokens with fee parameters
    function mintLicenseTokens(
        address licensorIpId,
        address licenseTemplate,
        uint256 licenseTermsId,
        uint256 amount,
        address receiver,
        bytes calldata royaltyContext,
        uint256 maxMintingFee,
        uint32 maxRevenueShare
    ) external returns (uint256 startLicenseTokenId);

    /// @notice Register derivative with license tokens
    function registerDerivativeWithLicenseTokens(
        address childIpId,
        uint256[] calldata licenseTokenIds,
        bytes calldata royaltyContext,
        uint32 maxRts
    ) external;

    /// @notice Predict minting license fee
    function predictMintingLicenseFee(
        address licensorIpId,
        address licenseTemplate,
        uint256 licenseTermsId,
        uint256 amount,
        address receiver,
        bytes calldata royaltyContext
    ) external view returns (address currencyToken, uint256 tokenAmount);
}

/// @notice Story Protocol IP Asset Registry interface
interface IIPAssetRegistry {
    /// @notice Register an NFT as an IP Asset
    /// @param chainId Chain ID where the NFT exists
    /// @param tokenContract NFT contract address
    /// @param tokenId Token ID to register
    /// @return ipId The registered IP Asset ID
    function register(uint256 chainId, address tokenContract, uint256 tokenId) external returns (address ipId);

    /// @notice Get the IP ID for an NFT
    /// @param chainId Chain ID
    /// @param tokenContract NFT contract address
    /// @param tokenId Token ID
    /// @return ipId The IP Asset ID (or zero if not registered)
    function ipId(uint256 chainId, address tokenContract, uint256 tokenId) external view returns (address);

    /// @notice Register an IP as a derivative of parent IPs
    function registerDerivative(
        address childIpId,
        address[] calldata parentIpIds,
        uint256[] calldata licenseTermsIds,
        address licenseTemplate,
        bytes calldata royaltyContext
    ) external;
}

/// @notice Story Protocol Dispute Module interface
interface IDisputeModule {
    /// @notice Raise a dispute against an IP Asset
    /// @param targetIpId The IP Asset being disputed
    /// @param disputeEvidenceHash IPFS CID hash of evidence
    /// @param targetTag Dispute category tag
    /// @param data Additional data
    /// @return disputeId The created dispute ID
    function raiseDispute(
        address targetIpId,
        bytes32 disputeEvidenceHash,
        bytes32 targetTag,
        bytes calldata data
    ) external returns (uint256 disputeId);

    /// @notice Resolve a dispute
    /// @param disputeId The dispute to resolve
    /// @param decision True if dispute is valid, false otherwise
    function resolveDispute(uint256 disputeId, bool decision) external;
}

/// @notice Story Protocol License Token (ERC721) interface
interface ILicenseToken {
    function balanceOf(address owner) external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
    function getLicenseTermsId(uint256 tokenId) external view returns (uint256);
    function getLicensorIpId(uint256 tokenId) external view returns (address);
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function getApproved(uint256 tokenId) external view returns (address);
}

/// @notice Workflow structs for SPG operations
library WorkflowStructs {
    /// @notice Struct for IP metadata
    struct IPMetadata {
        string ipMetadataURI;
        bytes32 ipMetadataHash;
        string nftMetadataURI;
        bytes32 nftMetadataHash;
    }

    /// @notice Struct for PIL license terms
    struct PILTerms {
        bool transferable;
        address royaltyPolicy;
        uint256 defaultMintingFee;
        uint256 expiration;
        bool commercialUse;
        bool commercialAttribution;
        address commercializerChecker;
        bytes commercializerCheckerData;
        uint32 commercialRevShare;
        uint256 commercialRevCeiling;
        bool derivativesAllowed;
        bool derivativesAttribution;
        bool derivativesApproval;
        bool derivativesReciprocal;
        uint256 derivativeRevCeiling;
        address currency;
        string uri;
    }

    /// @notice Struct for licensing configuration
    struct LicensingConfig {
        bool isSet;
        uint256 mintingFee;
        address licensingHook;
        bytes hookData;
        uint32 commercialRevShare;
        bool disabled;
        uint32 expectMinimumGroupRewardShare;
        address expectGroupRewardPool;
    }

    /// @notice Struct for license terms data
    struct LicenseTermsData {
        PILTerms terms;
        LicensingConfig licensingConfig;
    }
}

/// @notice Story Protocol Registration Workflows interface (SPG)
interface IRegistrationWorkflows {
    /// @notice Mint an NFT, register it as an IP, and attach PIL terms
    /// @param spgNftContract The SPG NFT collection contract
    /// @param recipient The recipient of the minted NFT and IP
    /// @param ipMetadata The metadata for the IP
    /// @param licenseTermsData The license terms to attach
    /// @param allowDuplicates Whether to allow duplicate IPs with same metadata
    /// @return ipId The registered IP Asset ID
    /// @return tokenId The minted NFT token ID
    /// @return licenseTermsIds The IDs of the attached license terms
    function mintAndRegisterIpAndAttachPILTerms(
        address spgNftContract,
        address recipient,
        WorkflowStructs.IPMetadata calldata ipMetadata,
        WorkflowStructs.LicenseTermsData[] calldata licenseTermsData,
        bool allowDuplicates
    ) external returns (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds);

    /// @notice Create a new SPG NFT collection
    /// @param initParams The initialization parameters for the collection
    /// @return spgNftContract The address of the new SPG NFT collection
    function createCollection(ISPGNFT.InitParams calldata initParams) external returns (address spgNftContract);
}

/// @notice SPG NFT interface for creating collections
interface ISPGNFT {
    struct InitParams {
        string name;
        string symbol;
        string baseURI;
        string contractURI;
        uint32 maxSupply;
        uint256 mintFee;
        address mintFeeToken;
        address mintFeeRecipient;
        address owner;
        bool mintOpen;
        bool isPublicMinting;
    }

    function totalSupply() external view returns (uint256);

    /// @notice Grant a role to an account (AccessControl)
    function grantRole(bytes32 role, address account) external;

    /// @notice Check if an account has a role
    function hasRole(bytes32 role, address account) external view returns (bool);
}

/// @notice Story Protocol Derivative Workflows interface
interface IDerivativeWorkflows {
    /// @notice Mint an NFT, register it as a derivative IP using license tokens
    /// @param spgNftContract The SPG NFT collection contract
    /// @param licenseTokenIds License token IDs to use for derivative registration
    /// @param royaltyContext Royalty context bytes
    /// @param maxRts Maximum royalty tokens
    /// @param ipMetadata Metadata for the IP
    /// @param recipient Recipient of the minted NFT
    /// @param allowDuplicates Whether to allow duplicate metadata
    /// @return ipId The registered derivative IP ID
    /// @return tokenId The minted NFT token ID
    function mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
        address spgNftContract,
        uint256[] calldata licenseTokenIds,
        bytes calldata royaltyContext,
        uint32 maxRts,
        WorkflowStructs.IPMetadata calldata ipMetadata,
        address recipient,
        bool allowDuplicates
    ) external returns (address ipId, uint256 tokenId);
}

/// @notice Story Protocol License Attachment Workflows interface
interface ILicenseAttachmentWorkflows {
    /// @notice Mint an NFT, register it as an IP, and attach PIL terms
    /// @param spgNftContract The SPG NFT collection contract
    /// @param recipient The recipient of the minted NFT and IP
    /// @param ipMetadata The metadata for the IP
    /// @param licenseTermsData The license terms to attach
    /// @param allowDuplicates Whether to allow duplicate IPs with same metadata
    /// @return ipId The registered IP Asset ID
    /// @return tokenId The minted NFT token ID
    /// @return licenseTermsIds The IDs of the attached license terms
    function mintAndRegisterIpAndAttachPILTerms(
        address spgNftContract,
        address recipient,
        WorkflowStructs.IPMetadata calldata ipMetadata,
        WorkflowStructs.LicenseTermsData[] calldata licenseTermsData,
        bool allowDuplicates
    ) external returns (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds);
}
