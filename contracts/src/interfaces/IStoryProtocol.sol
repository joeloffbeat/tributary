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
