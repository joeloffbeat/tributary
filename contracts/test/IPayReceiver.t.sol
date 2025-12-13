// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { IPayReceiver } from "../src/IPayReceiver.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title IPayReceiver Tests
/// @notice Comprehensive tests for the IPayReceiver contract
contract IPayReceiverTest is Test {
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

    // ============ Addresses ============
    address public owner = makeAddr("owner");
    address public user = makeAddr("user");
    address public serverWallet = makeAddr("serverWallet");
    bytes32 public trustedSender;

    // ============ Constants ============
    uint256 public constant INITIAL_RATE = 10e18; // 1 USDC = 10 WIP
    uint256 public constant INITIAL_LIQUIDITY = 1000e18; // 1000 WIP
    address public constant PIL_TEMPLATE = address(0x123);
    uint32 public constant AVALANCHE_DOMAIN = 43113;

    // ============ Setup ============

    function setUp() public {
        // Deploy mocks
        mailbox = new MockMailbox();
        usdc = new MockERC20("USD Coin", "USDC", 6);
        wip = new MockERC20("Wrapped IP", "WIP", 18);
        royaltyModule = new MockRoyaltyModule();
        licensingModule = new MockLicensingModule();
        ipAssetRegistry = new MockIPAssetRegistry();
        disputeModule = new MockDisputeModule();
        licenseToken = new MockLicenseToken();

        // Deploy receiver
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
            INITIAL_RATE
        );

        // Set trusted domain for Avalanche
        trustedSender = bytes32(uint256(uint160(serverWallet)));
        vm.prank(owner);
        receiver.setTrustedDomain(AVALANCHE_DOMAIN, trustedSender, true);

        // Seed WIP liquidity
        wip.mint(owner, INITIAL_LIQUIDITY);
        vm.startPrank(owner);
        wip.approve(address(receiver), INITIAL_LIQUIDITY);
        receiver.depositWIP(INITIAL_LIQUIDITY);
        vm.stopPrank();
    }

    // ============ Constructor Tests ============

    function test_Constructor_SetsCorrectValues() public view {
        assertEq(receiver.mailbox(), address(mailbox));
        assertEq(address(receiver.usdc()), address(usdc));
        assertEq(address(receiver.wip()), address(wip));
        assertEq(receiver.royaltyModule(), address(royaltyModule));
        assertEq(receiver.licensingModule(), address(licensingModule));
        assertEq(receiver.pilTemplate(), PIL_TEMPLATE);
        assertEq(receiver.usdcToWipRate(), INITIAL_RATE);
        assertEq(receiver.owner(), owner);
    }

    function testRevert_Constructor_ZeroMailbox() public {
        vm.expectRevert(IPayReceiver.ZeroAddress.selector);
        new IPayReceiver(
            address(0),
            address(usdc),
            address(wip),
            address(royaltyModule),
            address(licensingModule),
            PIL_TEMPLATE,
            address(ipAssetRegistry),
            address(disputeModule),
            address(licenseToken),
            INITIAL_RATE
        );
    }

    function testRevert_Constructor_ZeroRate() public {
        vm.expectRevert(IPayReceiver.InvalidRate.selector);
        new IPayReceiver(
            address(mailbox),
            address(usdc),
            address(wip),
            address(royaltyModule),
            address(licensingModule),
            PIL_TEMPLATE,
            address(ipAssetRegistry),
            address(disputeModule),
            address(licenseToken),
            0
        );
    }

    // ============ WIP Liquidity Tests ============

    function test_DepositWIP_UpdatesLiquidity() public {
        uint256 amount = 100e18;
        wip.mint(user, amount);

        vm.startPrank(user);
        wip.approve(address(receiver), amount);
        receiver.depositWIP(amount);
        vm.stopPrank();

        assertEq(receiver.wipLiquidity(), INITIAL_LIQUIDITY + amount);
    }

    function testRevert_DepositWIP_ZeroAmount() public {
        vm.expectRevert(IPayReceiver.InvalidAmount.selector);
        receiver.depositWIP(0);
    }

    function test_WithdrawWIP_TransfersToOwner() public {
        uint256 amount = 100e18;

        vm.prank(owner);
        receiver.withdrawWIP(amount);

        assertEq(receiver.wipLiquidity(), INITIAL_LIQUIDITY - amount);
        assertEq(wip.balanceOf(owner), amount);
    }

    function testRevert_WithdrawWIP_NotOwner() public {
        vm.prank(user);
        vm.expectRevert(IPayReceiver.OnlyOwner.selector);
        receiver.withdrawWIP(100e18);
    }

    function testRevert_WithdrawWIP_InsufficientLiquidity() public {
        vm.prank(owner);
        vm.expectRevert(IPayReceiver.InsufficientLiquidity.selector);
        receiver.withdrawWIP(INITIAL_LIQUIDITY + 1);
    }

    // ============ USDC Withdrawal Tests ============

    function test_WithdrawUSDC_TransfersToOwner() public {
        uint256 amount = 100e6;
        usdc.mint(address(receiver), amount);

        vm.prank(owner);
        receiver.withdrawUSDC(amount);

        assertEq(usdc.balanceOf(owner), amount);
    }

    function testRevert_WithdrawUSDC_NotOwner() public {
        usdc.mint(address(receiver), 100e6);

        vm.prank(user);
        vm.expectRevert(IPayReceiver.OnlyOwner.selector);
        receiver.withdrawUSDC(100e6);
    }

    // ============ Exchange Rate Tests ============

    function test_SetExchangeRate_UpdatesRate() public {
        uint256 newRate = 20e18;

        vm.prank(owner);
        receiver.setExchangeRate(newRate);

        assertEq(receiver.usdcToWipRate(), newRate);
    }

    function testRevert_SetExchangeRate_NotOwner() public {
        vm.prank(user);
        vm.expectRevert(IPayReceiver.OnlyOwner.selector);
        receiver.setExchangeRate(20e18);
    }

    function testRevert_SetExchangeRate_ZeroRate() public {
        vm.prank(owner);
        vm.expectRevert(IPayReceiver.InvalidRate.selector);
        receiver.setExchangeRate(0);
    }

    // ============ Calculate WIP Amount Tests ============

    function test_CalculateWIPAmount_CorrectCalculation() public view {
        // 1 USDC (1e6) with rate of 10e18 should give 10 WIP (10e18)
        uint256 usdcAmount = 1e6;
        uint256 expectedWip = 10e18;

        assertEq(receiver.calculateWIPAmount(usdcAmount), expectedWip);
    }

    function test_CalculateWIPAmount_LargeAmount() public view {
        // 1000 USDC (1000e6) with rate of 10e18 should give 10000 WIP
        uint256 usdcAmount = 1000e6;
        uint256 expectedWip = 10_000e18;

        assertEq(receiver.calculateWIPAmount(usdcAmount), expectedWip);
    }

    function testFuzz_CalculateWIPAmount(uint256 usdcAmount) public view {
        vm.assume(usdcAmount < type(uint256).max / INITIAL_RATE);

        uint256 wipAmount = receiver.calculateWIPAmount(usdcAmount);
        uint256 expected = (usdcAmount * INITIAL_RATE) / 1e6;

        assertEq(wipAmount, expected);
    }

    // ============ Trusted Domain Tests ============

    function test_SetTrustedDomain_UpdatesDomain() public {
        bytes32 newSender = bytes32(uint256(uint160(makeAddr("newSender"))));
        uint32 newDomain = 12345;

        vm.prank(owner);
        receiver.setTrustedDomain(newDomain, newSender, true);

        assertTrue(receiver.isDomainTrusted(newDomain));
        (bool enabled, bytes32 sender) = receiver.getDomainConfig(newDomain);
        assertTrue(enabled);
        assertEq(sender, newSender);
    }

    // ============ Pause Tests ============

    function test_Pause_SetsPaused() public {
        vm.prank(owner);
        receiver.pause();

        assertTrue(receiver.paused());
    }

    function test_Unpause_ClearsPaused() public {
        vm.prank(owner);
        receiver.pause();

        vm.prank(owner);
        receiver.unpause();

        assertFalse(receiver.paused());
    }

    function testRevert_Pause_NotOwner() public {
        vm.prank(user);
        vm.expectRevert(IPayReceiver.OnlyOwner.selector);
        receiver.pause();
    }

    // ============ Handle Message Tests ============

    function test_Handle_MintLicense_Success() public {
        bytes32 messageId = keccak256("test-message");
        address ipId = makeAddr("ipId");
        uint256 licenseTermsId = 1;
        uint256 usdcAmount = 1e6; // 1 USDC
        address recipient = user;
        uint256 listingId = 0; // No listing reference

        // Encode payload (now includes listingId)
        bytes memory payload = abi.encode(messageId, ipId, licenseTermsId, usdcAmount, recipient, listingId);
        bytes memory message = abi.encodePacked(uint8(1), payload); // OP_MINT_LICENSE = 1

        // Call handle from mailbox
        vm.prank(address(mailbox));
        receiver.handle(AVALANCHE_DOMAIN, trustedSender, message);

        // Check payment record
        IPayReceiver.PaymentRecord memory record = receiver.getPayment(messageId);
        assertEq(record.payer, recipient);
        assertEq(record.ipId, ipId);
        assertEq(record.licenseTermsId, licenseTermsId);
        assertEq(record.usdcAmount, usdcAmount);
        assertTrue(record.processed);
    }

    function testRevert_Handle_NotMailbox() public {
        bytes memory message = abi.encodePacked(uint8(1), bytes("test"));

        vm.prank(user);
        vm.expectRevert(IPayReceiver.OnlyMailbox.selector);
        receiver.handle(AVALANCHE_DOMAIN, trustedSender, message);
    }

    function testRevert_Handle_InvalidOrigin() public {
        bytes memory message = abi.encodePacked(uint8(1), bytes("test"));

        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.InvalidOrigin.selector);
        receiver.handle(12345, trustedSender, message);
    }

    function testRevert_Handle_UntrustedSender() public {
        bytes memory message = abi.encodePacked(uint8(1), bytes("test"));
        bytes32 wrongSender = bytes32(uint256(uint160(makeAddr("wrongSender"))));

        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.UntrustedSender.selector);
        receiver.handle(AVALANCHE_DOMAIN, wrongSender, message);
    }

    function testRevert_Handle_WhenPaused() public {
        vm.prank(owner);
        receiver.pause();

        bytes memory message = abi.encodePacked(uint8(1), bytes("test"));

        vm.prank(address(mailbox));
        vm.expectRevert(IPayReceiver.ContractPaused.selector);
        receiver.handle(AVALANCHE_DOMAIN, trustedSender, message);
    }

    function test_Handle_InsufficientLiquidity_EmitsFailedEvent() public {
        bytes32 messageId = keccak256("test-message");
        address ipId = makeAddr("ipId");
        uint256 licenseTermsId = 1;
        uint256 usdcAmount = 10_000e6; // 10000 USDC - requires 100000 WIP but we only have 1000
        address recipient = user;
        uint256 listingId = 0;

        bytes memory payload = abi.encode(messageId, ipId, licenseTermsId, usdcAmount, recipient, listingId);
        bytes memory message = abi.encodePacked(uint8(1), payload);

        vm.expectEmit(true, false, false, true);
        emit IPayReceiver.PaymentFailed(messageId, 1, "Insufficient liquidity");

        vm.prank(address(mailbox));
        receiver.handle(AVALANCHE_DOMAIN, trustedSender, message);
    }

    // ============ Check Liquidity Tests ============

    function test_CheckLiquidity_SufficientLiquidity() public view {
        uint256 usdcAmount = 10e6; // 10 USDC = 100 WIP

        (bool hasLiquidity, uint256 requiredWIP) = receiver.checkLiquidity(usdcAmount);

        assertTrue(hasLiquidity);
        assertEq(requiredWIP, 100e18);
    }

    function test_CheckLiquidity_InsufficientLiquidity() public view {
        uint256 usdcAmount = 10_000e6; // 10000 USDC = 100000 WIP (more than 1000 WIP liquidity)

        (bool hasLiquidity, uint256 requiredWIP) = receiver.checkLiquidity(usdcAmount);

        assertFalse(hasLiquidity);
        assertEq(requiredWIP, 100_000e18);
    }

    // ============ Ownership Tests ============

    function test_TransferOwnership_UpdatesOwner() public {
        address newOwner = makeAddr("newOwner");

        vm.prank(owner);
        receiver.transferOwnership(newOwner);

        assertEq(receiver.owner(), newOwner);
    }

    function testRevert_TransferOwnership_NotOwner() public {
        vm.prank(user);
        vm.expectRevert(IPayReceiver.OnlyOwner.selector);
        receiver.transferOwnership(user);
    }

    function testRevert_TransferOwnership_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(IPayReceiver.ZeroAddress.selector);
        receiver.transferOwnership(address(0));
    }
}

// ============ Mock Contracts ============

contract MockMailbox {
    // Simple mock - just needs to exist for address comparison
}

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
    function payRoyaltyOnBehalf(address, address, address, uint256) external pure {
        // Mock implementation - always succeeds
    }
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

    function registerDerivative(address, address[] calldata, uint256[] calldata, address, bytes calldata)
        external
        pure
    {
        // Mock implementation
    }
}

contract MockDisputeModule {
    uint256 private _nextDisputeId = 1;

    function raiseDispute(address, bytes32, bytes32, bytes calldata)
        external
        returns (uint256 disputeId)
    {
        disputeId = _nextDisputeId;
        _nextDisputeId++;
    }

    function resolveDispute(uint256, bool) external pure {
        // Mock implementation
    }
}

contract MockLicenseToken {
    mapping(uint256 => address) private _owners;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    function mint(address to, uint256 tokenId) external {
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

    function approve(address, uint256) external pure {
        // Mock implementation
    }

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
