// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/factory/LendingFactory.sol";

contract CreateTestPool is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address FACTORY_ADDRESS = vm.envAddress("VITE_LENDING_FACTORY_ADDRESS");
        
        console.log("\n=== Creating Test Pool ===\");
        console.log("Factory address:", FACTORY_ADDRESS);
        
        LendingFactory factory = LendingFactory(FACTORY_ADDRESS);
        
        // Whitelist ETH (use address(0) or a mock ETH token)
        // For native ETH pools, we use address(0)
        address ethAsset = address(0);
        
        console.log("\nWhitelisting ETH asset...");
        factory.whitelistAsset(ethAsset);
        
        // Create test pool
        // Name: "Test Pool", Asset: ETH, APR: 8%, RIF Coverage: 20%
        console.log("Creating test pool...");
        address poolAddress = factory.createPool(
            "Test Pool ETH",  // name
            ethAsset,         // asset (address(0) for native ETH)
            8,                // APR: 8%
            2000              // RIF Coverage: 20% (in basis points)
        );
        
        console.log("\n=== Pool Created Successfully ===\");
        console.log("Pool Address:", poolAddress);
        console.log("Pool Name: Test Pool ETH");
        console.log("Asset: ETH");
        console.log("APR: 8%");
        console.log("RIF Coverage: 20%");
        
        console.log("\nNext: Use this pool address in your frontend!");
        console.log("Pool Address for .env.local: VITE_TEST_POOL_ADDRESS=", poolAddress);
        
        vm.stopBroadcast();
    }
}
