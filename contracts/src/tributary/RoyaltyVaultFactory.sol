// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { RoyaltyVault } from "./RoyaltyVault.sol";
import { RoyaltyToken } from "./RoyaltyToken.sol";

/// @title RoyaltyVaultFactory
/// @notice Factory contract that deploys RoyaltyVaults and RoyaltyTokens
/// @dev Uses CREATE2 for deterministic addresses
contract RoyaltyVaultFactory is Ownable {
    /// @notice Fixed supply for all vaults (10,000 tokens)
    uint256 public constant FIXED_SUPPLY = 10_000 * 1e18;

    /// @notice Parameters for creating a new vault
    struct VaultParams {
        bytes32 storyIPId;
        string tokenName;
        string tokenSymbol;
        uint256 creatorAllocation;  // Amount creator keeps (out of FIXED_SUPPLY)
        uint256 dividendBps;        // Dividend % in basis points (e.g., 500 = 5%)
        uint256 tradingFeeBps;      // Trading fee % in basis points (e.g., 100 = 1%)
        address paymentToken;
    }

    /// @notice Record of a deployed vault
    struct VaultRecord {
        address vault;
        address token;
        address creator;
        bytes32 storyIPId;
        uint256 createdAt;
        uint256 dividendBps;
        uint256 tradingFeeBps;
        bool isActive;
    }

    /// @notice Story IP ID → Vault address
    mapping(bytes32 => address) public vaultByIPId;
    /// @notice Creator → Array of vault addresses
    mapping(address => address[]) public vaultsByCreator;
    /// @notice All vault records
    VaultRecord[] public allVaults;
    /// @notice Vault address → VaultRecord
    mapping(address => VaultRecord) public vaultRecords;
    /// @notice Protocol treasury address
    address public protocolTreasury;
    /// @notice Total vaults created
    uint256 public vaultCount;
    /// @notice Quick lookup for valid vaults
    mapping(address => bool) public isVault;

    event VaultCreated(
        address indexed vault,
        address indexed token,
        address indexed creator,
        bytes32 storyIPId,
        string tokenName,
        uint256 totalSupply,
        uint256 dividendBps,
        uint256 tradingFeeBps
    );
    event ProtocolTreasuryUpdated(address oldTreasury, address newTreasury);

    error ZeroAddress();
    error VaultAlreadyExists();
    error InvalidAllocation();
    error InvalidDividendRate();
    error InvalidTradingFee();

    constructor(address _protocolTreasury) Ownable(msg.sender) {
        if (_protocolTreasury == address(0)) revert ZeroAddress();
        protocolTreasury = _protocolTreasury;
    }

    /// @notice Creates a new vault and token pair
    /// @param params The vault creation parameters
    /// @return vault The deployed vault address
    /// @return token The deployed token address
    function createVault(VaultParams calldata params) external returns (address vault, address token) {
        if (vaultByIPId[params.storyIPId] != address(0)) revert VaultAlreadyExists();
        if (params.creatorAllocation > FIXED_SUPPLY) revert InvalidAllocation();
        if (params.dividendBps > 10000) revert InvalidDividendRate(); // Max 100%
        if (params.tradingFeeBps > 500) revert InvalidTradingFee();   // Max 5%

        address creator = msg.sender;
        bytes32 salt = keccak256(abi.encodePacked(params.storyIPId, creator, block.timestamp));

        // Predict token address using CREATE (nonce-based)
        // For contracts, nonce starts at 1 and increments per contract created
        uint256 nonce = _getContractNonce();
        token = _computeCreateAddress(address(this), nonce);

        // Compute vault address using CREATE2 with predicted token address
        bytes memory vaultBytecode = abi.encodePacked(
            type(RoyaltyVault).creationCode,
            abi.encode(
                params.storyIPId,
                creator,
                token,
                params.paymentToken,
                protocolTreasury,
                params.dividendBps,
                params.tradingFeeBps
            )
        );
        vault = _computeCreate2Address(salt, keccak256(vaultBytecode));

        // Deploy token (mints to vault and creator)
        token = address(
            new RoyaltyToken(
                params.tokenName,
                params.tokenSymbol,
                vault,
                creator,
                params.storyIPId,
                FIXED_SUPPLY,
                params.creatorAllocation
            )
        );

        // Deploy vault at computed address using CREATE2
        vault = address(
            new RoyaltyVault{ salt: salt }(
                params.storyIPId,
                creator,
                token,
                params.paymentToken,
                protocolTreasury,
                params.dividendBps,
                params.tradingFeeBps
            )
        );

        // Register vault
        _registerVault(
            vault,
            token,
            creator,
            params.storyIPId,
            params.tokenName,
            params.dividendBps,
            params.tradingFeeBps
        );

        return (vault, token);
    }

    /// @notice Gets the current contract nonce for CREATE address prediction
    function _getContractNonce() internal view returns (uint256) {
        // Contract nonce is the number of contracts created + 1
        // We track this via vaultCount (each vault creation = 2 contracts: token + vault)
        // Token is created first, so nonce = vaultCount * 2 + 1
        return vaultCount * 2 + 1;
    }

    /// @notice Computes CREATE address (nonce-based)
    function _computeCreateAddress(address deployer, uint256 nonce) internal pure returns (address) {
        bytes memory data;
        if (nonce == 0x00) {
            data = abi.encodePacked(bytes1(0xd6), bytes1(0x94), deployer, bytes1(0x80));
        } else if (nonce <= 0x7f) {
            data = abi.encodePacked(bytes1(0xd6), bytes1(0x94), deployer, uint8(nonce));
        } else if (nonce <= 0xff) {
            data = abi.encodePacked(bytes1(0xd7), bytes1(0x94), deployer, bytes1(0x81), uint8(nonce));
        } else if (nonce <= 0xffff) {
            data = abi.encodePacked(bytes1(0xd8), bytes1(0x94), deployer, bytes1(0x82), uint16(nonce));
        } else if (nonce <= 0xffffff) {
            data = abi.encodePacked(bytes1(0xd9), bytes1(0x94), deployer, bytes1(0x83), uint24(nonce));
        } else {
            data = abi.encodePacked(bytes1(0xda), bytes1(0x94), deployer, bytes1(0x84), uint32(nonce));
        }
        return address(uint160(uint256(keccak256(data))));
    }

    /// @notice Registers a vault in all mappings
    function _registerVault(
        address vault,
        address token,
        address creator,
        bytes32 storyIPId,
        string memory tokenName,
        uint256 dividendBps,
        uint256 tradingFeeBps
    ) internal {
        VaultRecord memory record = VaultRecord({
            vault: vault,
            token: token,
            creator: creator,
            storyIPId: storyIPId,
            createdAt: block.timestamp,
            dividendBps: dividendBps,
            tradingFeeBps: tradingFeeBps,
            isActive: true
        });

        vaultByIPId[storyIPId] = vault;
        vaultsByCreator[creator].push(vault);
        allVaults.push(record);
        vaultRecords[vault] = record;
        isVault[vault] = true;
        vaultCount++;

        emit VaultCreated(
            vault,
            token,
            creator,
            storyIPId,
            tokenName,
            FIXED_SUPPLY,
            dividendBps,
            tradingFeeBps
        );
    }

    /// @notice Computes CREATE2 address
    function _computeCreate2Address(bytes32 salt, bytes32 bytecodeHash) internal view returns (address) {
        return address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(bytes1(0xff), address(this), salt, bytecodeHash)
                    )
                )
            )
        );
    }

    /// @notice Returns all vaults created by a specific creator
    function getVaultsByCreator(address creator) external view returns (address[] memory) {
        return vaultsByCreator[creator];
    }

    /// @notice Returns vault address for a Story IP ID
    function getVaultByIPId(bytes32 storyIPId) external view returns (address) {
        return vaultByIPId[storyIPId];
    }

    /// @notice Returns all vault records
    function getAllVaults() external view returns (VaultRecord[] memory) {
        return allVaults;
    }

    /// @notice Returns vault record for a specific vault
    function getVaultRecord(address vault) external view returns (VaultRecord memory) {
        return vaultRecords[vault];
    }

    /// @notice Returns total vault count
    function getVaultCount() external view returns (uint256) {
        return vaultCount;
    }

    /// @notice Updates protocol treasury address
    /// @param newTreasury New treasury address
    function setProtocolTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address oldTreasury = protocolTreasury;
        protocolTreasury = newTreasury;
        emit ProtocolTreasuryUpdated(oldTreasury, newTreasury);
    }

    /// @notice Checks if an address is a valid vault
    function isValidVault(address vault) external view returns (bool) {
        return isVault[vault];
    }
}
