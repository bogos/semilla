// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/LendingFactory.sol";
import "../src/PoolRegistry.sol";
import "../src/IdentityVerifier.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PoolRegistry
        PoolRegistry poolRegistry = new PoolRegistry();
        console.log("PoolRegistry deployed at:", address(poolRegistry));

        // Deploy LendingFactory
        LendingFactory lendingFactory = new LendingFactory(address(poolRegistry));
        console.log("LendingFactory deployed at:", address(lendingFactory));

        // Deploy IdentityVerifier
        IdentityVerifier identityVerifier = new IdentityVerifier();
        console.log("IdentityVerifier deployed at:", address(identityVerifier));

        vm.stopBroadcast();
    }
}
