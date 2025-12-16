// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { IPayReceiver } from "../src/IPayReceiver.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { WorkflowStructs, ISPGNFT } from "../src/interfaces/IStoryProtocol.sol";

/// @title IPayReceiver Multi-Chain Tests
/// @notice Comprehensive tests for multi-chain support and listing functionality
contract IPayReceiverMultiChainTest is Test {
    // ============ Contracts ============
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

    // ============ Addresses ============
    address public owner = makeAddr("owner");
    address public user = makeAddr("user");
    address public serverWalletFuji = makeAddr("serverWalletFuji");
    address public serverWalletSepolia = makeAddr("serverWalletSepolia");
    address public serverWalletAmoy = makeAddr("serverWalletAmoy");

    bytes32 public trustedSenderFuji;
    bytes32 public trustedSenderSepolia;
    bytes32 public trustedSenderAmoy;

    // ============ Constants ============
    uint256 public constant INITIAL_RATE = 10e18;
    uint256 public constant INITIAL_LIQUIDITY = 1000e18;
    address public constant PIL_TEMPLATE = address(0x123);

    uint32 public constant DOMAIN_FUJI = 43113;
    uint32 public constant DOMAIN_SEPOLIA = 11155111;
    uint32 public constant DOMAIN_AMOY = 80002;
    uint32 public constant DOMAIN_UNKNOWN = 99999;

    // ============ Setup ============

    function setUp() public {
        mailbox = new MockMailbox();
        usdc = new MockERC20("USD Coin", "USDC", 6);
        wip = new MockERC20("Wrapped IP", "WIP", 18);
        royaltyModule = new MockRoyaltyModule();
        licensingModule = new MockLicensingModule();
        ipAssetRegistry = new MockIPAssetRegistry();
        disputeModule = new MockDisputeModule();
        licenseToken = new MockLicenseToken();
        registrationWorkflows = new MockRegistrationWorkflows();
        derivativeWorkflows = new MockDerivativeWorkflows();
        licenseAttachmentWorkflows = new MockLicenseAttachmentWorkflows();

        vm.prank(owner);
        receiver = new IPayReceiver(
            address(mailbox),
            address(usdc),
            address(wip),
            address(royaltyModule),
            address(licensingModule),
            PIL_TEMPLATE,
            address(ipAssetRegistry),
            address(disputeModule),
            address(licenseToken),
            address(registrationWorkflows),
            address(derivativeWorkflows),
            address(licenseAttachmentWorkflows),
            INITIAL_RATE
        );

        // Set up trusted senders
        trustedSenderFuji = bytes32(uint256(uint160(serverWalletFuji)));
        trustedSenderSepolia = bytes32(uint256(uint160(serverWalletSepolia)));
        trustedSenderAmoy = bytes32(uint256(uint160(serverWalletAmoy)));

        // Configure all three domains
        vm.startPrank(owner);
        receiver.setTrustedDomain(DOMAIN_FUJI, trustedSenderFuji, true);
        receiver.setTrustedDomain(DOMAIN_SEPOLIA, trustedSenderSepolia, true);
        receiver.setTrustedDomain(DOMAIN_AMOY, trustedSenderAmoy, true);
        vm.stopPrank();

        // Seed WIP liquidity
        wip.mint(owner, INITIAL_LIQUIDITY);
        vm.startPrank(owner);
        wip.approve(address(receiver), INITIAL_LIQUIDITY);
        receiver.depositWIP(INITIAL_LIQUIDITY);
        vm.stopPrank();
    }

    // ============ Multi-Domain Validation Tests ============

    function test_Handle_AcceptsMessageFromFuji() public {
        bytes32 messageId = keccak256("fuji-message");
        address ipId = makeAddr("ipId");
        bytes memory payload = abi.encode(messageId, ipId, uint256(1), uint256(1e6), user, uint256(0));
        bytes memory message = abi.encodePacked(uint8(1), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);

        IPayReceiver.PaymentRecord memory record = receiver.getPayment(messageId);
        assertEq(record.payer, user);
        assertTrue(record.processed);
    }

    function test_Handle_AcceptsMessageFromSepolia() public {
        bytes32 messageId = keccak256("sepolia-message");
        address ipId = makeAddr("ipId");
        bytes memory payload = abi.encode(messageId, ipId, uint256(1), uint256(1e6), user, uint256(0));
        bytes memory message = abi.encodePacked(uint8(1), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_SEPOLIA, trustedSenderSepolia, message);

        IPayReceiver.PaymentRecord memory record = receiver.getPayment(messageId);
        assertEq(record.payer, user);
        assertTrue(record.processed);
    }

    function test_Handle_AcceptsMessageFromAmoy() public {
        bytes32 messageId = keccak256("amoy-message");
        address ipId = makeAddr("ipId");
        bytes memory payload = abi.encode(messageId, ipId, uint256(1), uint256(1e6), user, uint256(0));
        bytes memory message = abi.encodePacked(uint8(1), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_AMOY, trustedSenderAmoy, message);

        IPayReceiver.PaymentRecord memory record = receiver.getPayment(messageId);
        assertEq(record.payer, user);
        assertTrue(record.processed);
    }

    function testRevert_Handle_RejectsUnknownDomain() public {
        bytes memory message = abi.encodePacked(uint8(1), bytes("test"));
        bytes32 fakeSender = bytes32(uint256(uint160(makeAddr("fake"))));

        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.InvalidOrigin.selector);
        receiver.handle(DOMAIN_UNKNOWN, fakeSender, message);
    }

    function testRevert_Handle_RejectsWrongSenderOnValidDomain() public {
        bytes memory message = abi.encodePacked(uint8(1), bytes("test"));
        bytes32 wrongSender = bytes32(uint256(uint160(makeAddr("wrongSender"))));

        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.UntrustedSender.selector);
        receiver.handle(DOMAIN_FUJI, wrongSender, message);
    }

    function testRevert_Handle_RejectsDisabledDomain() public {
        // Disable Fuji domain
        vm.prank(owner);
        receiver.setTrustedDomain(DOMAIN_FUJI, trustedSenderFuji, false);

        bytes memory message = abi.encodePacked(uint8(1), bytes("test"));

        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.InvalidOrigin.selector);
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);
    }

    // ============ Domain Admin Functions Tests ============

    function test_SetTrustedDomain_OnlyOwner() public {
        bytes32 newSender = bytes32(uint256(uint160(makeAddr("newSender"))));

        vm.prank(owner);
        receiver.setTrustedDomain(12345, newSender, true);

        (bool enabled, bytes32 sender) = receiver.getDomainConfig(12345);
        assertTrue(enabled);
        assertEq(sender, newSender);
    }

    function testRevert_SetTrustedDomain_NotOwner() public {
        bytes32 newSender = bytes32(uint256(uint160(makeAddr("newSender"))));

        vm.prank(user);
        vm.expectRevert(IPayReceiver.OnlyOwner.selector);
        receiver.setTrustedDomain(12345, newSender, true);
    }

    function test_SetTrustedDomainsBatch_Success() public {
        uint32[] memory domains = new uint32[](3);
        domains[0] = 1;
        domains[1] = 2;
        domains[2] = 3;

        bytes32[] memory senders = new bytes32[](3);
        senders[0] = bytes32(uint256(1));
        senders[1] = bytes32(uint256(2));
        senders[2] = bytes32(uint256(3));

        bool[] memory flags = new bool[](3);
        flags[0] = true;
        flags[1] = true;
        flags[2] = false;

        vm.prank(owner);
        receiver.setTrustedDomainsBatch(domains, senders, flags);

        assertTrue(receiver.isDomainTrusted(1));
        assertTrue(receiver.isDomainTrusted(2));
        assertFalse(receiver.isDomainTrusted(3));
    }

    function testRevert_SetTrustedDomainsBatch_ArrayLengthMismatch() public {
        uint32[] memory domains = new uint32[](2);
        bytes32[] memory senders = new bytes32[](3);
        bool[] memory flags = new bool[](2);

        vm.prank(owner);
        vm.expectRevert(IPayReceiver.ArrayLengthMismatch.selector);
        receiver.setTrustedDomainsBatch(domains, senders, flags);
    }

    function testRevert_SetTrustedDomainsBatch_NotOwner() public {
        uint32[] memory domains = new uint32[](1);
        bytes32[] memory senders = new bytes32[](1);
        bool[] memory flags = new bool[](1);

        vm.prank(user);
        vm.expectRevert(IPayReceiver.OnlyOwner.selector);
        receiver.setTrustedDomainsBatch(domains, senders, flags);
    }

    // ============ Listing Creation Tests ============

    function test_CreateListing_FromFuji() public {
        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);

        IPayReceiver.Listing memory listing = receiver.getListing(1);
        assertEq(listing.sourceChain, DOMAIN_FUJI);
        assertTrue(listing.isActive);
    }

    function test_CreateListing_FromSepolia() public {
        _createListingFromDomain(DOMAIN_SEPOLIA, trustedSenderSepolia);

        IPayReceiver.Listing memory listing = receiver.getListing(1);
        assertEq(listing.sourceChain, DOMAIN_SEPOLIA);
    }

    function test_CreateListing_FromAmoy() public {
        _createListingFromDomain(DOMAIN_AMOY, trustedSenderAmoy);

        IPayReceiver.Listing memory listing = receiver.getListing(1);
        assertEq(listing.sourceChain, DOMAIN_AMOY);
    }

    function test_CreateListing_StoresAllFields() public {
        address storyIPId = makeAddr("storyIP");
        address creator = makeAddr("creator");
        string memory title = "Test Asset";
        string memory description = "Test Description";
        string memory category = "art";
        uint256 priceUSDC = 100e6;
        string memory assetIpfsHash = "QmTest123";
        string memory metadataUri = "ipfs://metadata";

        bytes memory payload = abi.encode(
            storyIPId, creator, title, description, category, priceUSDC, assetIpfsHash, metadataUri
        );
        bytes memory message = abi.encodePacked(uint8(6), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);

        IPayReceiver.Listing memory listing = receiver.getListing(1);
        assertEq(listing.listingId, 1);
        assertEq(listing.storyIPId, storyIPId);
        assertEq(listing.creator, creator);
        assertEq(listing.title, title);
        assertEq(listing.description, description);
        assertEq(listing.category, category);
        assertEq(listing.priceUSDC, priceUSDC);
        assertEq(listing.assetIpfsHash, assetIpfsHash);
        assertEq(listing.metadataUri, metadataUri);
        assertEq(listing.sourceChain, DOMAIN_FUJI);
        assertTrue(listing.isActive);
        assertEq(listing.totalUses, 0);
    }

    function test_CreateListing_MultipleFromSameCreator() public {
        address creator = makeAddr("creator");

        // Create 3 listings from the same creator
        for (uint256 i = 0; i < 3; i++) {
            address storyIPId = makeAddr(string(abi.encodePacked("ip", i)));
            bytes memory payload = abi.encode(
                storyIPId, creator, "Title", "Desc", "art", 100e6, "hash", "uri"
            );
            bytes memory message = abi.encodePacked(uint8(6), payload);

            vm.prank(address(mailbox));
            receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);
        }

        uint256[] memory creatorListings = receiver.getListingsByCreator(creator);
        assertEq(creatorListings.length, 3);
        assertEq(creatorListings[0], 1);
        assertEq(creatorListings[1], 2);
        assertEq(creatorListings[2], 3);
    }

    function test_CreateListing_TracksListingsByIPId() public {
        address storyIPId = makeAddr("storyIP");
        address creator1 = makeAddr("creator1");
        address creator2 = makeAddr("creator2");

        // Create 2 listings for the same IP from different creators
        bytes memory payload1 = abi.encode(storyIPId, creator1, "T1", "D1", "art", 100e6, "h1", "u1");
        bytes memory payload2 = abi.encode(storyIPId, creator2, "T2", "D2", "music", 200e6, "h2", "u2");

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, abi.encodePacked(uint8(6), payload1));
        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_SEPOLIA, trustedSenderSepolia, abi.encodePacked(uint8(6), payload2));

        uint256[] memory ipListings = receiver.getListingsByIPId(storyIPId);
        assertEq(ipListings.length, 2);
    }

    // ============ Listing Update Tests ============

    function test_UpdateListing_UpdatesPrice() public {
        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);

        uint256 newPrice = 500e6;
        bytes memory payload = abi.encode(uint256(1), newPrice);
        bytes memory message = abi.encodePacked(uint8(7), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);

        IPayReceiver.Listing memory listing = receiver.getListing(1);
        assertEq(listing.priceUSDC, newPrice);
    }

    function testRevert_UpdateListing_NotFound() public {
        bytes memory payload = abi.encode(uint256(999), uint256(100e6));
        bytes memory message = abi.encodePacked(uint8(7), payload);

        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.ListingNotFound.selector);
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);
    }

    function testRevert_UpdateListing_NotActive() public {
        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);

        // Deactivate the listing
        bytes memory deactivatePayload = abi.encode(uint256(1));
        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, abi.encodePacked(uint8(8), deactivatePayload));

        // Try to update
        bytes memory updatePayload = abi.encode(uint256(1), uint256(500e6));
        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.ListingNotActive.selector);
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, abi.encodePacked(uint8(7), updatePayload));
    }

    // ============ Listing Deactivation Tests ============

    function test_DeactivateListing_SetsInactive() public {
        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);

        bytes memory payload = abi.encode(uint256(1));
        bytes memory message = abi.encodePacked(uint8(8), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);

        IPayReceiver.Listing memory listing = receiver.getListing(1);
        assertFalse(listing.isActive);
    }

    function testRevert_DeactivateListing_NotFound() public {
        bytes memory payload = abi.encode(uint256(999));
        bytes memory message = abi.encodePacked(uint8(8), payload);

        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.ListingNotFound.selector);
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);
    }

    // ============ License Minting with Listing Tracking Tests ============

    function test_MintLicense_TracksListingUsage() public {
        // Create a listing first
        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);

        // Mint a license referencing the listing
        bytes32 messageId = keccak256("mint-message");
        address ipId = makeAddr("ipId");
        bytes memory payload = abi.encode(messageId, ipId, uint256(1), uint256(1e6), user, uint256(1));
        bytes memory message = abi.encodePacked(uint8(1), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);

        IPayReceiver.Listing memory listing = receiver.getListing(1);
        assertEq(listing.totalUses, 1);
    }

    function test_MintLicense_NoListingTracking_WhenZeroId() public {
        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);

        // Mint without listing reference (listingId = 0)
        bytes32 messageId = keccak256("mint-message");
        address ipId = makeAddr("ipId");
        bytes memory payload = abi.encode(messageId, ipId, uint256(1), uint256(1e6), user, uint256(0));
        bytes memory message = abi.encodePacked(uint8(1), payload);

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);

        IPayReceiver.Listing memory listing = receiver.getListing(1);
        assertEq(listing.totalUses, 0);
    }

    function test_MintLicense_MultipleUsesTracked() public {
        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);
        address ipId = makeAddr("ipId");

        for (uint256 i = 0; i < 5; i++) {
            bytes32 messageId = keccak256(abi.encodePacked("mint", i));
            bytes memory payload = abi.encode(messageId, ipId, uint256(1), uint256(1e6), user, uint256(1));
            bytes memory message = abi.encodePacked(uint8(1), payload);

            vm.prank(address(mailbox));
            receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);
        }

        IPayReceiver.Listing memory listing = receiver.getListing(1);
        assertEq(listing.totalUses, 5);
    }

    // ============ Edge Cases ============
    // Note: getActiveListings was removed to reduce contract size - use subgraph instead

    function test_ListingIdStartsAtOne() public {
        assertEq(receiver.nextListingId(), 1);

        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);

        assertEq(receiver.nextListingId(), 2);

        IPayReceiver.Listing memory listing = receiver.getListing(1);
        assertEq(listing.listingId, 1);
    }

    function test_GetListingsByCreator_EmptyArray() public {
        address nobody = makeAddr("nobody");
        uint256[] memory result = receiver.getListingsByCreator(nobody);
        assertEq(result.length, 0);
    }

    function test_GetListingsByIPId_EmptyArray() public {
        address noIP = makeAddr("noIP");
        uint256[] memory result = receiver.getListingsByIPId(noIP);
        assertEq(result.length, 0);
    }

    function testRevert_UpdateListing_ZeroId() public {
        bytes memory payload = abi.encode(uint256(0), uint256(100e6));
        bytes memory message = abi.encodePacked(uint8(7), payload);

        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.ListingNotFound.selector);
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);
    }

    function testRevert_DeactivateListing_ZeroId() public {
        bytes memory payload = abi.encode(uint256(0));
        bytes memory message = abi.encodePacked(uint8(8), payload);

        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.ListingNotFound.selector);
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);
    }

    // Note: Domain constants were removed to reduce contract size - defined in frontend

    function test_OperationConstants_AreCorrect() public view {
        assertEq(receiver.OP_MINT_LICENSE(), 1);
        assertEq(receiver.OP_CREATE_DERIVATIVE(), 2);
        assertEq(receiver.OP_REGISTER_IP(), 3);
        assertEq(receiver.OP_TRANSFER_LICENSE(), 4);
        assertEq(receiver.OP_RAISE_DISPUTE(), 5);
        assertEq(receiver.OP_CREATE_LISTING(), 6);
        assertEq(receiver.OP_UPDATE_LISTING(), 7);
        assertEq(receiver.OP_DEACTIVATE_LISTING(), 8);
    }

    // ============ Event Tests ============

    function test_ListingCreated_EmitsEvent() public {
        address storyIPId = makeAddr("storyIP");
        address creator = makeAddr("creator");

        bytes memory payload = abi.encode(
            storyIPId, creator, "Title", "Desc", "art", 100e6, "hash", "uri"
        );
        bytes memory message = abi.encodePacked(uint8(6), payload);

        vm.expectEmit(true, true, true, true);
        emit IPayReceiver.ListingCreated(1, storyIPId, creator, 100e6, DOMAIN_FUJI, "Title", "art");

        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, message);
    }

    function test_ListingUpdated_EmitsEvent() public {
        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);

        vm.expectEmit(true, false, false, true);
        emit IPayReceiver.ListingUpdated(1, 500e6);

        bytes memory payload = abi.encode(uint256(1), uint256(500e6));
        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, abi.encodePacked(uint8(7), payload));
    }

    function test_ListingDeactivated_EmitsEvent() public {
        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);

        vm.expectEmit(true, false, false, false);
        emit IPayReceiver.ListingDeactivated(1);

        bytes memory payload = abi.encode(uint256(1));
        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, abi.encodePacked(uint8(8), payload));
    }

    function test_ListingUsed_EmitsEvent() public {
        _createListingFromDomain(DOMAIN_FUJI, trustedSenderFuji);

        vm.expectEmit(true, true, false, true);
        emit IPayReceiver.ListingUsed(1, user, 1e6);

        bytes32 messageId = keccak256("mint");
        address ipId = makeAddr("ipId");
        bytes memory payload = abi.encode(messageId, ipId, uint256(1), uint256(1e6), user, uint256(1));
        vm.prank(address(mailbox));
        receiver.handle(DOMAIN_FUJI, trustedSenderFuji, abi.encodePacked(uint8(1), payload));
    }

    function test_TrustedDomainUpdated_EmitsEvent() public {
        bytes32 newSender = bytes32(uint256(123));

        vm.expectEmit(true, false, false, true);
        emit IPayReceiver.TrustedDomainUpdated(12345, newSender, true);

        vm.prank(owner);
        receiver.setTrustedDomain(12345, newSender, true);
    }

    // ============ Helper Functions ============

    function _createListingFromDomain(uint32 domain, bytes32 sender) internal {
        address storyIPId = makeAddr("storyIP");
        address creator = makeAddr("creator");
        bytes memory payload = abi.encode(
            storyIPId, creator, "Title", "Description", "art", 100e6, "hash", "uri"
        );
        bytes memory message = abi.encodePacked(uint8(6), payload);

        vm.prank(address(mailbox));
        receiver.handle(domain, sender, message);
    }
}

// ============ Mock Contracts ============

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
        allowance[from][msg.sender] -= amount;
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

    function mintLicenseTokens(address, address, uint256, uint256, address, bytes calldata)
        external
        returns (uint256 startLicenseTokenId)
    {
        startLicenseTokenId = _nextTokenId;
        _nextTokenId++;
    }
}

contract MockIPAssetRegistry {
    function register(uint256, address, uint256) external pure returns (address) {
        return address(0x456);
    }

    function ipId(uint256, address, uint256) external pure returns (address) {
        return address(0x456);
    }

    function registerDerivative(address, address[] calldata, uint256[] calldata, address, bytes calldata) external pure {}
}

contract MockDisputeModule {
    uint256 private _nextDisputeId = 1;

    function raiseDispute(address, bytes32, bytes32, bytes calldata) external returns (uint256 disputeId) {
        disputeId = _nextDisputeId;
        _nextDisputeId++;
    }
}

contract MockLicenseToken {
    mapping(uint256 => address) private _owners;

    function ownerOf(uint256 tokenId) external view returns (address) {
        return _owners[tokenId];
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(_owners[tokenId] == from, "Not owner");
        _owners[tokenId] = to;
    }
}

contract MockRegistrationWorkflows {
    address private constant MOCK_IP_ID = address(0x789);
    uint256 private _nextTokenId = 1;

    function mintAndRegisterIpAndAttachPILTerms(
        address, // spgNftContract
        address, // recipient
        WorkflowStructs.IPMetadata calldata, // ipMetadata
        WorkflowStructs.LicenseTermsData[] calldata, // licenseTermsData
        bool // allowDuplicates
    ) external returns (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds) {
        ipId = MOCK_IP_ID;
        tokenId = _nextTokenId++;
        licenseTermsIds = new uint256[](1);
        licenseTermsIds[0] = 1;
    }

    function createCollection(ISPGNFT.InitParams calldata)
        external
        pure
        returns (address spgNftContract)
    {
        return address(0xABC);
    }
}

contract MockDerivativeWorkflows {
    address private constant MOCK_IP_ID = address(0xDEF);
    uint256 private _nextTokenId = 1;

    function mintAndRegisterIpAndMakeDerivativeWithLicenseTokens(
        address, uint256[] calldata, bytes calldata, uint32, WorkflowStructs.IPMetadata calldata, address, bool
    ) external returns (address ipId, uint256 tokenId) {
        ipId = MOCK_IP_ID;
        tokenId = _nextTokenId++;
    }
}

contract MockLicenseAttachmentWorkflows {
    address private constant MOCK_IP_ID = address(0xFED);
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
