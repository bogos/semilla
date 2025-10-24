// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/LendingPool.sol";
import "../src/IdentityVerifier.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy LendingPool
        LendingPool lendingPool = new LendingPool();
        console.log("LendingPool deployed at:", address(lendingPool));

        // Deploy IdentityVerifier
        IdentityVerifier identityVerifier = new IdentityVerifier();
        console.log("IdentityVerifier deployed at:", address(identityVerifier));

        vm.stopBroadcast();
    }
}
