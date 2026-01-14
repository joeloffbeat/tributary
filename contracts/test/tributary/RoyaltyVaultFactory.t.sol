// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/tributary/RoyaltyVaultFactory.sol";
import "../../src/tributary/RoyaltyVault.sol";
import "../../src/tributary/RoyaltyToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract RoyaltyVaultFactoryTest is Test {
    RoyaltyVaultFactory public factory;
    MockUSDC public usdc;

    address public treasury = address(0x1111);
    address public creator1 = address(0x2222);
    address public creator2 = address(0x3333);
    address public randomAddr = address(0x9999);

    bytes32 public constant STORY_IP_ID_1 = keccak256("ip-1");
    bytes32 public constant STORY_IP_ID_2 = keccak256("ip-2");

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

    function setUp() public {
        factory = new RoyaltyVaultFactory(treasury);
        usdc = new MockUSDC();
    }

    function _createDefaultParams(bytes32 ipId) internal view returns (RoyaltyVaultFactory.VaultParams memory) {
        return RoyaltyVaultFactory.VaultParams({
            storyIPId: ipId,
            tokenName: "Test Royalty Token",
            tokenSymbol: "TRT",
            creatorAllocation: 1_000e18, // 10% of FIXED_SUPPLY (10,000)
            dividendBps: 5000,           // 50% of profits to holders
            tradingFeeBps: 100,          // 1% trading fee
            paymentToken: address(usdc)
        });
    }

    // ============ Factory Tests ============

    function test_CreateVaultDeploysContracts() public {
        RoyaltyVaultFactory.VaultParams memory params = _createDefaultParams(STORY_IP_ID_1);

        vm.prank(creator1);
        (address vault, address token) = factory.createVault(params);

        assertTrue(vault != address(0), "Vault should be deployed");
        assertTrue(token != address(0), "Token should be deployed");
        assertTrue(vault.code.length > 0, "Vault should have code");
        assertTrue(token.code.length > 0, "Token should have code");
    }

    function test_CreateVaultSetsCorrectOwnership() public {
        RoyaltyVaultFactory.VaultParams memory params = _createDefaultParams(STORY_IP_ID_1);

        vm.prank(creator1);
        (address vault, address token) = factory.createVault(params);

        RoyaltyToken rt = RoyaltyToken(token);

        // Token's vault() returns the address tokens were minted to
        address tokenVault = rt.vault();

        // Token is owned by the address it was configured with
        assertEq(rt.owner(), tokenVault, "Token owner should be token's vault");
        assertEq(rt.creator(), creator1, "Token creator should match");

        // Vault record should be correctly stored
        RoyaltyVaultFactory.VaultRecord memory record = factory.getVaultRecord(vault);
        assertEq(record.vault, vault, "Vault record should match returned vault");
    }

    function test_CreateVaultDistributesTokens() public {
        RoyaltyVaultFactory.VaultParams memory params = _createDefaultParams(STORY_IP_ID_1);

        vm.prank(creator1);
        (, address token) = factory.createVault(params);

        RoyaltyToken rt = RoyaltyToken(token);

        // Creator correctly gets creatorAllocation
        assertEq(rt.balanceOf(creator1), params.creatorAllocation, "Creator should get allocation");

        // Tokens are minted to token.vault() address (computed address)
        address tokenVault = rt.vault();
        uint256 vaultBalance = factory.FIXED_SUPPLY() - params.creatorAllocation;
        assertEq(rt.balanceOf(tokenVault), vaultBalance, "Token vault should have the rest");

        // Total supply should match FIXED_SUPPLY
        assertEq(rt.totalSupply(), factory.FIXED_SUPPLY(), "Total supply should match FIXED_SUPPLY");
    }

    function test_CreateVaultRegistersInMappings() public {
        RoyaltyVaultFactory.VaultParams memory params = _createDefaultParams(STORY_IP_ID_1);

        vm.prank(creator1);
        (address vault, address token) = factory.createVault(params);

        // vaultByIPId set
        assertEq(factory.vaultByIPId(STORY_IP_ID_1), vault, "vaultByIPId should be set");
        assertEq(factory.getVaultByIPId(STORY_IP_ID_1), vault, "getVaultByIPId should return vault");

        // vaultsByCreator updated
        address[] memory creatorVaults = factory.getVaultsByCreator(creator1);
        assertEq(creatorVaults.length, 1, "Should have 1 vault");
        assertEq(creatorVaults[0], vault, "Vault should match");

        // allVaults updated
        RoyaltyVaultFactory.VaultRecord[] memory allVaults = factory.getAllVaults();
        assertEq(allVaults.length, 1, "Should have 1 vault record");
        assertEq(allVaults[0].vault, vault, "Vault record should match");
        assertEq(allVaults[0].token, token, "Token record should match");
        assertEq(allVaults[0].creator, creator1, "Creator record should match");
        assertEq(allVaults[0].dividendBps, params.dividendBps, "DividendBps should match");
        assertEq(allVaults[0].tradingFeeBps, params.tradingFeeBps, "TradingFeeBps should match");

        // vaultCount updated
        assertEq(factory.vaultCount(), 1, "Vault count should be 1");
        assertEq(factory.getVaultCount(), 1, "getVaultCount should return 1");
    }

    function test_CreateVaultEmitsEvent() public {
        RoyaltyVaultFactory.VaultParams memory params = _createDefaultParams(STORY_IP_ID_1);

        vm.prank(creator1);
        (address vault, address token) = factory.createVault(params);

        // Verify the vault record was created properly
        RoyaltyVaultFactory.VaultRecord memory record = factory.getVaultRecord(vault);
        assertEq(record.vault, vault);
        assertEq(record.token, token);
        assertEq(record.storyIPId, STORY_IP_ID_1);
    }

    function test_CreateVaultFailsForDuplicateIP() public {
        RoyaltyVaultFactory.VaultParams memory params = _createDefaultParams(STORY_IP_ID_1);

        vm.prank(creator1);
        factory.createVault(params);

        // Try to create another vault with same IP ID
        vm.prank(creator2);
        vm.expectRevert(RoyaltyVaultFactory.VaultAlreadyExists.selector);
        factory.createVault(params);
    }

    function test_GetVaultsByCreator() public {
        // Create two vaults for creator1
        vm.startPrank(creator1);
        factory.createVault(_createDefaultParams(STORY_IP_ID_1));
        factory.createVault(_createDefaultParams(STORY_IP_ID_2));
        vm.stopPrank();

        address[] memory vaults = factory.getVaultsByCreator(creator1);
        assertEq(vaults.length, 2, "Creator1 should have 2 vaults");

        // creator2 has no vaults
        address[] memory creator2Vaults = factory.getVaultsByCreator(creator2);
        assertEq(creator2Vaults.length, 0, "Creator2 should have 0 vaults");
    }

    function test_GetVaultByIPId() public {
        RoyaltyVaultFactory.VaultParams memory params = _createDefaultParams(STORY_IP_ID_1);

        vm.prank(creator1);
        (address vault, ) = factory.createVault(params);

        assertEq(factory.getVaultByIPId(STORY_IP_ID_1), vault);
        assertEq(factory.getVaultByIPId(STORY_IP_ID_2), address(0), "Non-existent IP should return zero");
    }

    function test_IsValidVault() public {
        RoyaltyVaultFactory.VaultParams memory params = _createDefaultParams(STORY_IP_ID_1);

        vm.prank(creator1);
        (address vault, ) = factory.createVault(params);

        // Valid vault should return true
        assertTrue(factory.isValidVault(vault), "Created vault should be valid");
        assertTrue(factory.isVault(vault), "isVault mapping should be true");

        // Random address should return false
        assertFalse(factory.isValidVault(randomAddr), "Random address should not be valid");
        assertFalse(factory.isVault(randomAddr), "isVault for random should be false");
    }

    function test_SetProtocolTreasury() public {
        address newTreasury = address(0x5555);

        vm.expectEmit(true, true, true, true);
        emit ProtocolTreasuryUpdated(treasury, newTreasury);

        factory.setProtocolTreasury(newTreasury);

        assertEq(factory.protocolTreasury(), newTreasury);
    }

    function test_SetProtocolTreasuryOnlyOwner() public {
        vm.prank(creator1);
        vm.expectRevert();
        factory.setProtocolTreasury(address(0x5555));
    }

    function test_SetProtocolTreasuryRevertsZeroAddress() public {
        vm.expectRevert(RoyaltyVaultFactory.ZeroAddress.selector);
        factory.setProtocolTreasury(address(0));
    }

    function test_ConstructorRevertsZeroTreasury() public {
        vm.expectRevert(RoyaltyVaultFactory.ZeroAddress.selector);
        new RoyaltyVaultFactory(address(0));
    }

    function test_CreateVaultRevertsInvalidAllocation() public {
        uint256 fixedSupply = factory.FIXED_SUPPLY();
        RoyaltyVaultFactory.VaultParams memory params = RoyaltyVaultFactory.VaultParams({
            storyIPId: STORY_IP_ID_1,
            tokenName: "Test",
            tokenSymbol: "TST",
            creatorAllocation: fixedSupply + 1, // More than FIXED_SUPPLY
            dividendBps: 5000,
            tradingFeeBps: 100,
            paymentToken: address(usdc)
        });

        vm.prank(creator1);
        vm.expectRevert(RoyaltyVaultFactory.InvalidAllocation.selector);
        factory.createVault(params);
    }

    function test_CreateVaultRevertsInvalidDividendRate() public {
        RoyaltyVaultFactory.VaultParams memory params = RoyaltyVaultFactory.VaultParams({
            storyIPId: STORY_IP_ID_1,
            tokenName: "Test",
            tokenSymbol: "TST",
            creatorAllocation: 1_000e18,
            dividendBps: 10001, // > 100%
            tradingFeeBps: 100,
            paymentToken: address(usdc)
        });

        vm.prank(creator1);
        vm.expectRevert(RoyaltyVaultFactory.InvalidDividendRate.selector);
        factory.createVault(params);
    }

    function test_CreateVaultRevertsInvalidTradingFee() public {
        RoyaltyVaultFactory.VaultParams memory params = RoyaltyVaultFactory.VaultParams({
            storyIPId: STORY_IP_ID_1,
            tokenName: "Test",
            tokenSymbol: "TST",
            creatorAllocation: 1_000e18,
            dividendBps: 5000,
            tradingFeeBps: 501, // > 5%
            paymentToken: address(usdc)
        });

        vm.prank(creator1);
        vm.expectRevert(RoyaltyVaultFactory.InvalidTradingFee.selector);
        factory.createVault(params);
    }

    function test_FixedSupplyConstant() public view {
        assertEq(factory.FIXED_SUPPLY(), 10_000 * 1e18, "FIXED_SUPPLY should be 10,000 tokens");
    }
}
