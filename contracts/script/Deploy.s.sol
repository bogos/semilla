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

        console.log("\n=== Deploying Semilla Contracts ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        // Step 1: Deploy PoolRegistry (with factory placeholder address first)
        PoolRegistry poolRegistry = new PoolRegistry(address(0));
        console.log("\n1. PoolRegistry deployed at:", address(poolRegistry));
        
        // Step 2: Deploy LendingFactory
        LendingFactory lendingFactory = new LendingFactory(address(poolRegistry));
        console.log("2. LendingFactory deployed at:", address(lendingFactory));
        
        // Step 3: Update PoolRegistry with correct factory address
        poolRegistry.setFactory(address(lendingFactory));
        console.log("3. PoolRegistry updated with factory address");
        
        // Step 4: Deploy IdentityVerifier
        IdentityVerifier identityVerifier = new IdentityVerifier();
        console.log("4. IdentityVerifier deployed at:", address(identityVerifier));
        
        console.log("\n=== Deployment Complete ===");
        console.log("\nContract Addresses:");
        console.log("- PoolRegistry:", address(poolRegistry));
        console.log("- LendingFactory:", address(lendingFactory));
        console.log("- IdentityVerifier:", address(identityVerifier));
        
        console.log("\nNext Steps:");
        console.log("1. Set VITE_POOL_REGISTRY_ADDRESS and VITE_LENDING_FACTORY_ADDRESS in .env.local");
        console.log("2. Whitelist assets in LendingFactory: factory.whitelistAsset(address asset)");
        console.log("3. Create pools: factory.createPool(name, asset, apr, rifCoverageBp)");

        vm.stopBroadcast();
    }
}
