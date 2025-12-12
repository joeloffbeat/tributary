// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {IPayRegistry} from "../src/IPayRegistry.sol";

contract DeployIPayRegistry is Script {
    function setUp() public {}

    function run() public returns (IPayRegistry registry) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console2.log("Deploying IPayRegistry...");
        console2.log("Deployer:", vm.addr(deployerPrivateKey));

        vm.startBroadcast(deployerPrivateKey);

        registry = new IPayRegistry();

        vm.stopBroadcast();

        console2.log("IPayRegistry deployed at:", address(registry));
        console2.log("Owner:", registry.owner());

        return registry;
    }
}
