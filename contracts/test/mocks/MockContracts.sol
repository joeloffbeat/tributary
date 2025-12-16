// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { WorkflowStructs, ISPGNFT } from "../../src/interfaces/IStoryProtocol.sol";

/// @title Mock Contracts for IPayReceiver Testing
/// @notice Shared mock implementations for all test files

contract MockMailbox {}

contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
}

contract MockRoyaltyModule {
    function payRoyaltyOnBehalf(address, address, address, uint256) external pure {}
}

contract MockLicensingModule {
    uint256 private _nextTokenId = 1;
    bool public shouldFail;

    function setFail(bool _fail) external {
        shouldFail = _fail;
    }

    function mintLicenseTokens(address, address, uint256, uint256, address, bytes calldata)
        external
        returns (uint256 startLicenseTokenId)
    {
        require(!shouldFail, "Mock: minting failed");
        startLicenseTokenId = _nextTokenId++;
    }

    function mintLicenseTokens(
        address, address, uint256, uint256, address, bytes calldata, uint256, uint32
    ) external returns (uint256 startLicenseTokenId) {
        require(!shouldFail, "Mock: minting failed");
        startLicenseTokenId = _nextTokenId++;
    }

    function registerDerivativeWithLicenseTokens(address, uint256[] calldata, bytes calldata, uint32) external pure {}

    function predictMintingLicenseFee(address, address, uint256, uint256, address, bytes calldata)
        external pure returns (address currencyToken, uint256 tokenAmount)
    {
        return (address(0x123), 1e18);
    }
}

contract MockIPAssetRegistry {
    address private constant MOCK_IP = address(0x456);

    function register(uint256, address, uint256) external pure returns (address) {
        return MOCK_IP;
    }

    function ipId(uint256, address, uint256) external pure returns (address) {
        return MOCK_IP;
    }

    function registerDerivative(address, address[] calldata, uint256[] calldata, address, bytes calldata) external pure {}
}

contract MockDisputeModule {
    uint256 private _nextDisputeId = 1;
    bool public shouldFail;

    function setFail(bool _fail) external {
        shouldFail = _fail;
    }

    function raiseDispute(address, bytes32, bytes32, bytes calldata) external returns (uint256 disputeId) {
        require(!shouldFail, "Mock: dispute failed");
        disputeId = _nextDisputeId++;
    }

    function resolveDispute(uint256, bool) external pure {}
}

contract MockLicenseToken {
    mapping(uint256 => address) private _owners;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    uint256 private _nextTokenId = 1;

    function mint(address to) external returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _owners[tokenId] = to;
    }

    function mintTo(address to, uint256 tokenId) external {
        _owners[tokenId] = to;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return _owners[tokenId];
    }

    function balanceOf(address) external pure returns (uint256) {
        return 1;
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(_owners[tokenId] == from, "Not owner");
        _owners[tokenId] = to;
    }

    function approve(address, uint256) external pure {}
    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
    }

    function isApprovedForAll(address owner, address operator) external view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function getApproved(uint256) external pure returns (address) {
        return address(0);
    }

    function getLicenseTermsId(uint256) external pure returns (uint256) {
        return 1;
    }

    function getLicensorIpId(uint256) external pure returns (address) {
        return address(0x123);
    }

    function tokenOfOwnerByIndex(address, uint256) external pure returns (uint256) {
        return 1;
    }
}

contract MockRegistrationWorkflows {
    address private constant MOCK_IP_ID = address(0x789);
    uint256 private _nextTokenId = 1;
    address private _lastCollection;

    function mintAndRegisterIpAndAttachPILTerms(
        address, address, WorkflowStructs.IPMetadata calldata, WorkflowStructs.LicenseTermsData[] calldata, bool
    ) external returns (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds) {
        ipId = MOCK_IP_ID;
        tokenId = _nextTokenId++;
        licenseTermsIds = new uint256[](1);
        licenseTermsIds[0] = 1;
    }

    function createCollection(ISPGNFT.InitParams calldata) external returns (address spgNftContract) {
        spgNftContract = address(new MockSPGNFT());
        _lastCollection = spgNftContract;
    }

    function getLastCollection() external view returns (address) {
        return _lastCollection;
    }
}

contract MockDerivativeWorkflows {
    address private constant MOCK_IP_ID = address(0xABC);
    uint256 private _nextTokenId = 1;

    function mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
        address, uint256[] calldata, bytes calldata, uint32, WorkflowStructs.IPMetadata calldata, address, bool
    ) external returns (address ipId, uint256 tokenId) {
        ipId = MOCK_IP_ID;
        tokenId = _nextTokenId++;
    }
}

contract MockLicenseAttachmentWorkflows {
    address private constant MOCK_IP_ID = address(0xDEF);
    uint256 private _nextTokenId = 1;

    function mintAndRegisterIpAndAttachPILTerms(
        address, address, WorkflowStructs.IPMetadata calldata, WorkflowStructs.LicenseTermsData[] calldata, bool
    ) external returns (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds) {
        ipId = MOCK_IP_ID;
        tokenId = _nextTokenId++;
        licenseTermsIds = new uint256[](1);
        licenseTermsIds[0] = 1;
    }
}

contract MockSPGNFT {
    mapping(bytes32 => mapping(address => bool)) private _roles;

    function totalSupply() external pure returns (uint256) {
        return 0;
    }

    function grantRole(bytes32 role, address account) external {
        _roles[role][account] = true;
    }

    function hasRole(bytes32 role, address account) external view returns (bool) {
        return _roles[role][account];
    }
}
