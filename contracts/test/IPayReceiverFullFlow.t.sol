// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { IPayReceiver } from "../src/IPayReceiver.sol";
import {
    MockMailbox, MockERC20, MockRoyaltyModule, MockLicensingModule,
    MockIPAssetRegistry, MockDisputeModule, MockLicenseToken,
    MockRegistrationWorkflows, MockDerivativeWorkflows, MockLicenseAttachmentWorkflows
} from "./mocks/MockContracts.sol";
import { WorkflowStructs } from "../src/interfaces/IStoryProtocol.sol";

/// @title IPayReceiver Full Flow Tests
/// @notice Tests complete cross-chain flows for all Story Protocol operations
contract IPayReceiverFullFlowTest is Test {
    IPayReceiver public receiver;
    MockMailbox public mailbox;
    MockERC20 public usdc;
    MockERC20 public wip;
    MockRoyaltyModule public royaltyModule;
    MockLicensingModule public licensingModule;
    MockIPAssetRegistry public ipAssetRegistry;
    MockDisputeModule public disputeModule;
    MockLicenseToken public licenseToken;
    MockRegistrationWorkflows public registrationWorkflows;
    MockDerivativeWorkflows public derivativeWorkflows;
    MockLicenseAttachmentWorkflows public licenseAttachmentWorkflows;

    address public owner = makeAddr("owner");
    address public creator = makeAddr("creator");
    address public buyer = makeAddr("buyer");

    bytes32 public trustedSenderFuji;
    bytes32 public trustedSenderSepolia;
    bytes32 public trustedSenderAmoy;

    uint256 public constant INITIAL_RATE = 10e18;
    uint256 public constant INITIAL_LIQUIDITY = 10000e18;
    address public constant PIL_TEMPLATE = address(0x123);

    uint32 public constant DOMAIN_FUJI = 43113;
    uint32 public constant DOMAIN_SEPOLIA = 11155111;
    uint32 public constant DOMAIN_AMOY = 80002;

    function setUp() public {
        _deployMocks();
        _deployReceiver();
        _setupTrustedDomains();
        _seedLiquidity();
    }

    function _deployMocks() internal {
        mailbox = new MockMailbox();
        usdc = new MockERC20("USDC", "USDC", 6);
        wip = new MockERC20("WIP", "WIP", 18);
        royaltyModule = new MockRoyaltyModule();
        licensingModule = new MockLicensingModule();
        ipAssetRegistry = new MockIPAssetRegistry();
        disputeModule = new MockDisputeModule();
        licenseToken = new MockLicenseToken();
        registrationWorkflows = new MockRegistrationWorkflows();
        derivativeWorkflows = new MockDerivativeWorkflows();
        licenseAttachmentWorkflows = new MockLicenseAttachmentWorkflows();
    }

    function _deployReceiver() internal {
        vm.prank(owner);
        receiver = new IPayReceiver(
            address(mailbox), address(usdc), address(wip),
            address(royaltyModule), address(licensingModule), PIL_TEMPLATE,
            address(ipAssetRegistry), address(disputeModule), address(licenseToken),
            address(registrationWorkflows), address(derivativeWorkflows),
            address(licenseAttachmentWorkflows), INITIAL_RATE
        );
    }

    function _setupTrustedDomains() internal {
        trustedSenderFuji = bytes32(uint256(uint160(makeAddr("serverFuji"))));
        trustedSenderSepolia = bytes32(uint256(uint160(makeAddr("serverSepolia"))));
        trustedSenderAmoy = bytes32(uint256(uint160(makeAddr("serverAmoy"))));

        vm.startPrank(owner);
        receiver.setTrustedDomain(DOMAIN_FUJI, trustedSenderFuji, true);
        receiver.setTrustedDomain(DOMAIN_SEPOLIA, trustedSenderSepolia, true);
        receiver.setTrustedDomain(DOMAIN_AMOY, trustedSenderAmoy, true);
        receiver.setSpgNftContract(address(new MockSPGNFTSimple()));
        vm.stopPrank();
    }

    function _seedLiquidity() internal {
        wip.mint(owner, INITIAL_LIQUIDITY);
        vm.startPrank(owner);
        wip.approve(address(receiver), INITIAL_LIQUIDITY);
        receiver.depositWIP(INITIAL_LIQUIDITY);
        vm.stopPrank();
    }

    // ============ Full Flow: Mint NFT + Register IP (using existing collection) ============

    function test_Flow_MintAndRegisterIP_FromFuji() public {
        bytes32 messageId = keccak256("mint-register-fuji");
        WorkflowStructs.PILTerms memory terms = _createDefaultTerms();
        bytes memory encodedTerms = abi.encode(terms);
        bytes memory emptyCollectionParams = ""; // Use existing/default collection

        bytes memory payload = abi.encode(messageId, creator, "ipfs://ip", "ipfs://nft", encodedTerms, emptyCollectionParams);
        bytes memory message = abi.encodePacked(uint8(9), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);
    }

    function test_Flow_MintAndRegisterIP_FromSepolia() public {
        bytes32 messageId = keccak256("mint-register-sepolia");
        WorkflowStructs.PILTerms memory terms = _createDefaultTerms();
        bytes memory encodedTerms = abi.encode(terms);
        bytes memory emptyCollectionParams = "";

        bytes memory payload = abi.encode(messageId, creator, "ipfs://ip", "ipfs://nft", encodedTerms, emptyCollectionParams);
        bytes memory message = abi.encodePacked(uint8(9), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_SEPOLIA, trustedSenderSepolia, message);
    }

    function test_Flow_MintAndRegisterIP_FromAmoy() public {
        bytes32 messageId = keccak256("mint-register-amoy");
        WorkflowStructs.PILTerms memory terms = _createDefaultTerms();
        bytes memory encodedTerms = abi.encode(terms);
        bytes memory emptyCollectionParams = "";

        bytes memory payload = abi.encode(messageId, creator, "ipfs://ip", "ipfs://nft", encodedTerms, emptyCollectionParams);
        bytes memory message = abi.encodePacked(uint8(9), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_AMOY, trustedSenderAmoy, message);
    }

    // ============ Full Flow: Mint NFT + Register IP (with new collection) ============

    function test_Flow_MintAndRegisterIP_WithNewCollection() public {
        bytes32 messageId = keccak256("mint-register-new-collection");
        WorkflowStructs.PILTerms memory terms = _createDefaultTerms();
        bytes memory encodedTerms = abi.encode(terms);

        // Collection params: name, symbol, baseURI, contractURI, maxSupply
        bytes memory collectionParams = abi.encode(
            "My New Collection",
            "MYNFT",
            "https://base.uri/",
            "https://contract.uri/",
            uint32(10000)
        );

        bytes memory payload = abi.encode(messageId, creator, "ipfs://ip", "ipfs://nft", encodedTerms, collectionParams);
        bytes memory message = abi.encodePacked(uint8(9), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);

        // Verify collection was created
        assertNotEq(receiver.getCreatorCollection(creator), address(0));
    }

    // ============ Full Flow: Create Collection (standalone) ============

    function test_Flow_CreateCollection_ForCreator() public {
        bytes32 messageId = keccak256("create-collection");
        bytes memory payload = abi.encode(
            messageId, creator, "My IP Collection", "MYIP", "https://base.uri/", "https://contract.uri/", uint32(10000)
        );
        bytes memory message = abi.encodePacked(uint8(10), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);

        assertNotEq(receiver.getCreatorCollection(creator), address(0));
    }

    // ============ Full Flow: List IP (CREATE_LISTING) ============

    function test_Flow_ListIP_FromAllChains() public {
        address ipId = makeAddr("ipId");
        string memory title = "My Art";

        // From Fuji
        _createListing(DOMAIN_FUJI, trustedSenderFuji, ipId, creator, title, 100e6);
        assertEq(receiver.getListing(1).sourceChain, DOMAIN_FUJI);

        // From Sepolia
        _createListing(DOMAIN_SEPOLIA, trustedSenderSepolia, ipId, creator, "Art 2", 200e6);
        assertEq(receiver.getListing(2).sourceChain, DOMAIN_SEPOLIA);

        // From Amoy
        _createListing(DOMAIN_AMOY, trustedSenderAmoy, ipId, creator, "Art 3", 300e6);
        assertEq(receiver.getListing(3).sourceChain, DOMAIN_AMOY);
    }

    // ============ Full Flow: Mint License Tokens ============

    function test_Flow_MintLicense_Success() public {
        bytes32 messageId = keccak256("mint-license");
        address ipId = makeAddr("ipId");

        bytes memory payload = abi.encode(messageId, ipId, uint256(1), uint256(1e6), buyer, uint256(0));
        bytes memory message = abi.encodePacked(uint8(1), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);

        IPayReceiver.PaymentRecord memory record = receiver.getPayment(messageId);
        assertTrue(record.processed);
    }

    // ============ Full Flow: Mint License With Fee ============

    function test_Flow_MintLicenseWithFee_Success() public {
        bytes32 messageId = keccak256("mint-with-fee");
        address ipId = makeAddr("ipId");

        bytes memory payload = abi.encode(
            messageId, ipId, uint256(1), uint256(5e6), buyer, uint256(1e18), uint32(100)
        );
        bytes memory message = abi.encodePacked(uint8(13), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_SEPOLIA, trustedSenderSepolia, message);

        IPayReceiver.PaymentRecord memory record = receiver.getPayment(messageId);
        assertTrue(record.processed);
    }

    // ============ Full Flow: List License Token ============

    function test_Flow_ListLicenseToken() public {
        // First deposit a license token to escrow
        uint256 tokenId = licenseToken.mint(address(receiver));

        bytes memory payload = abi.encode(tokenId, creator, uint256(50e6));
        bytes memory message = abi.encodePacked(uint8(11), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);

        IPayReceiver.LicenseTokenListing memory listing = receiver.getLicenseListing(1);
        assertEq(listing.seller, creator);
        assertEq(listing.priceUSDC, 50e6);
        assertTrue(listing.isActive);
    }

    // ============ Full Flow: Purchase License Listing ============

    function test_Flow_PurchaseLicenseListing() public {
        // Setup: deposit and list
        uint256 tokenId = licenseToken.mint(address(receiver));
        bytes memory listPayload = abi.encode(tokenId, creator, uint256(50e6));
        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, abi.encodePacked(uint8(11), listPayload));

        // Purchase
        bytes32 messageId = keccak256("purchase");
        bytes memory purchasePayload = abi.encode(messageId, uint256(1), buyer, uint256(50e6));
        bytes memory message = abi.encodePacked(uint8(12), purchasePayload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_AMOY, trustedSenderAmoy, message);

        assertFalse(receiver.getLicenseListing(1).isActive);
        assertEq(licenseToken.ownerOf(tokenId), buyer);
    }

    // ============ Full Flow: Raise Dispute ============

    function test_Flow_RaiseDispute() public {
        bytes32 messageId = keccak256("dispute");
        address targetIpId = makeAddr("targetIp");
        bytes32 evidenceHash = keccak256("evidence");
        bytes32 disputeTag = keccak256("INFRINGEMENT");
        uint256 bondAmount = 100e18;
        address disputant = makeAddr("disputant");

        bytes memory payload = abi.encode(messageId, targetIpId, evidenceHash, disputeTag, bondAmount, disputant);
        bytes memory message = abi.encodePacked(uint8(5), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);
    }

    // ============ Full Flow: Create Derivative With License ============

    function test_Flow_CreateDerivativeWithLicense() public {
        bytes32 messageId = keccak256("derivative");
        uint256[] memory licenseTokenIds = new uint256[](1);
        licenseTokenIds[0] = 1;

        bytes memory payload = abi.encode(
            messageId, creator, licenseTokenIds, "ipfs://deriv-ip", "ipfs://deriv-nft", address(0)
        );
        bytes memory message = abi.encodePacked(uint8(14), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_SEPOLIA, trustedSenderSepolia, message);
    }

    // ============ Helper Functions ============

    function _createListing(uint32 domain, bytes32 sender, address ipId, address _creator, string memory title, uint256 price) internal {
        bytes memory payload = abi.encode(ipId, _creator, title, "Description", "art", price, "hash", "uri");
        bytes memory message = abi.encodePacked(uint8(6), payload);
        vm.prank(address(mailbox));
        receiver.handle(domain, sender, message);
    }

    function _createDefaultTerms() internal pure returns (WorkflowStructs.PILTerms memory) {
        return WorkflowStructs.PILTerms({
            transferable: true,
            royaltyPolicy: address(0),
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
            derivativesReciprocal: true,
            derivativeRevCeiling: 0,
            currency: address(0),
            uri: ""
        });
    }
}

contract MockSPGNFTSimple {
    function grantRole(bytes32, address) external pure {}
    function hasRole(bytes32, address) external pure returns (bool) { return true; }
    function totalSupply() external pure returns (uint256) { return 0; }
}
