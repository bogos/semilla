// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/factory/LendingFactory.sol";
import "../src/factory/PoolRegistry.sol";
import "../src/IdentityVerifier.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // This is a temporary deployment. In production:
        // 1. Deploy PoolRegistry with factory placeholder
        // 2. Deploy LendingFactory with registry address
        // For now, we'll deploy them manually
        
        console.log("Deploy script requires pool creation via factory.");
        console.log("1. Deploy PoolRegistry: new PoolRegistry(address factory)");
        console.log("2. Deploy LendingFactory: new LendingFactory(address registry)");
        console.log("3. Create pool via: factory.createPool(name, asset, apr, rifCoverage)");

        // Deploy IdentityVerifier
        IdentityVerifier identityVerifier = new IdentityVerifier();
        console.log("IdentityVerifier deployed at:", address(identityVerifier));

        vm.stopBroadcast();
    }
}
