// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPayReceiver {
    function setTrustedDomain(uint32 domain, bytes32 sender, bool enabled) external;
    function depositWIP(uint256 amount) external;
    function isDomainTrusted(uint32 domain) external view returns (bool);
    function getDomainConfig(uint32 domain) external view returns (bool enabled, bytes32 sender);
    function wipLiquidity() external view returns (uint256);
}

interface IWIP {
    function deposit() external payable;
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title Setup IPayReceiver
/// @notice Wraps IP to WIP and deposits liquidity, sets trusted domains
contract SetupIPayReceiver is Script {
    // Story Aeneid addresses
    address public constant IPAY_RECEIVER = 0xe4c7f7d38C2F6a3f7ac61821C70BB7D18CdCECFE;
    address public constant WIP_TOKEN = 0x1514000000000000000000000000000000000000;

    // Domain IDs
    uint32 public constant DOMAIN_AVALANCHE_FUJI = 43113;
    uint32 public constant DOMAIN_SEPOLIA = 11155111;
    uint32 public constant DOMAIN_AMOY = 80002;

    // Amount to wrap and deposit (0.5 IP = 0.5 * 1e18)
    uint256 public constant WRAP_AMOUNT = 0.5 ether;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address serverWallet = vm.envAddress("SERVER_WALLET_ADDRESS");

        console2.log("=== Setting up IPayReceiver ===");
        console2.log("Deployer:", deployer);
        console2.log("Server Wallet:", serverWallet);
        console2.log("IPayReceiver:", IPAY_RECEIVER);
        console2.log("");

        IPayReceiver receiver = IPayReceiver(IPAY_RECEIVER);
        IWIP wip = IWIP(WIP_TOKEN);

        console2.log("Current state:");
        console2.log("  WIP Liquidity:", receiver.wipLiquidity());
        console2.log("  Deployer IP Balance:", deployer.balance);
        console2.log("  Deployer WIP Balance:", wip.balanceOf(deployer));
        console2.log("  Fuji trusted:", receiver.isDomainTrusted(DOMAIN_AVALANCHE_FUJI));
        console2.log("  Sepolia trusted:", receiver.isDomainTrusted(DOMAIN_SEPOLIA));
        console2.log("  Amoy trusted:", receiver.isDomainTrusted(DOMAIN_AMOY));
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Wrap IP to WIP
        console2.log("Step 1: Wrapping", WRAP_AMOUNT, "IP to WIP...");
        wip.deposit{ value: WRAP_AMOUNT }();
        console2.log("  WIP Balance after wrap:", wip.balanceOf(deployer));

        // Step 2: Approve IPayReceiver to spend WIP
        console2.log("Step 2: Approving IPayReceiver to spend WIP...");
        wip.approve(IPAY_RECEIVER, WRAP_AMOUNT);

        // Step 3: Deposit WIP to IPayReceiver
        console2.log("Step 3: Depositing WIP to IPayReceiver...");
        receiver.depositWIP(WRAP_AMOUNT);
        console2.log("  WIP Liquidity after deposit:", receiver.wipLiquidity());

        // Step 4: Set trusted domain (Avalanche Fuji by default)
        console2.log("Step 4: Setting trusted domain for Avalanche Fuji...");
        bytes32 senderBytes = bytes32(uint256(uint160(serverWallet)));
        receiver.setTrustedDomain(DOMAIN_AVALANCHE_FUJI, senderBytes, true);
        console2.log("  Fuji domain trusted:", receiver.isDomainTrusted(DOMAIN_AVALANCHE_FUJI));

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== Setup Complete ===");
        console2.log("IPayReceiver is ready to receive cross-chain messages from Fuji");
        console2.log("");
        console2.log("To add more domains, call setTrustedDomain with:");
        console2.log("  Sepolia: 11155111");
        console2.log("  Amoy: 80002");
    }

    /// @notice Setup with all three domains
    function runAllDomains() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address serverWallet = vm.envAddress("SERVER_WALLET_ADDRESS");

        console2.log("=== Setting up IPayReceiver (All Domains) ===");
        console2.log("Deployer:", deployer);
        console2.log("Server Wallet:", serverWallet);

        IPayReceiver receiver = IPayReceiver(IPAY_RECEIVER);
        IWIP wip = IWIP(WIP_TOKEN);

        vm.startBroadcast(deployerPrivateKey);

        // Wrap and deposit WIP
        wip.deposit{ value: WRAP_AMOUNT }();
        wip.approve(IPAY_RECEIVER, WRAP_AMOUNT);
        receiver.depositWIP(WRAP_AMOUNT);

        // Set all three trusted domains
        bytes32 senderBytes = bytes32(uint256(uint160(serverWallet)));
        receiver.setTrustedDomain(DOMAIN_AVALANCHE_FUJI, senderBytes, true);
        receiver.setTrustedDomain(DOMAIN_SEPOLIA, senderBytes, true);
        receiver.setTrustedDomain(DOMAIN_AMOY, senderBytes, true);

        vm.stopBroadcast();

        console2.log("=== All Domains Configured ===");
    }
}
