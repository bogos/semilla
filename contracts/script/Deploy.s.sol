// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/factory/LendingFactory.sol";
import "../src/factory/PoolRegistry.sol";
import "../src/IdentityVerifier.sol";
import "../src/tokens/MockUSDC.sol";
import "../src/tokens/MockUSX.sol";

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
        
        // Step 5: Deploy Mock Tokens
        MockUSDC mockUSDC = new MockUSDC();
        MockUSX mockUSX = new MockUSX();
        console.log("5. MockUSDC deployed at:", address(mockUSDC));
        console.log("6. MockUSX deployed at:", address(mockUSX));
        
        // Step 6: Whitelist Assets in Factory
        // Note: ETH (0x0) is handled specially in createPool() and doesn't need whitelist
        
        // Whitelist ERC20 tokens
        lendingFactory.whitelistAsset(address(mockUSDC));
        console.log("7. MockUSDC whitelisted at:", address(mockUSDC));
        
        lendingFactory.whitelistAsset(address(mockUSX));
        console.log("8. MockUSX whitelisted at:", address(mockUSX));
        
        // Step 7: Mint tokens to deployer
        address walletAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        uint256 amount = 100000 * 10**6; // 100,000 tokens with 6 decimals
        
        mockUSDC.mint(walletAddress, amount);
        console.log("9. Minted 100,000 MockUSDC to:", walletAddress);
        
        mockUSX.mint(walletAddress, amount);
        console.log("10. Minted 100,000 MockUSX to:", walletAddress);
        
        console.log("\n=== Deployment Complete ===");
        console.log("\nContract Addresses:");
        console.log("PoolRegistry:", address(poolRegistry));
        console.log("LendingFactory:", address(lendingFactory));
        console.log("IdentityVerifier:", address(identityVerifier));
        console.log("MockUSDC:", address(mockUSDC));
        console.log("MockUSX:", address(mockUSX));
        console.log("\nToken Info:");
        console.log("MockUSDC Balance (deployer):", mockUSDC.balanceOf(msg.sender), "(6 decimals)");
        console.log("MockUSX Balance (deployer):", mockUSX.balanceOf(msg.sender), "(6 decimals)");
        
        console.log("\nNext Steps:");
        console.log("1. Copy contract addresses to frontend .env.local");
        console.log("2. Create pools using factory.createPool(name, asset, apr, rifCoverageBp, isERC20)");
        console.log("3. Start frontend: cd frontend && pnpm dev");
        console.log("4. Connect MetaMask and test the application");

        vm.stopBroadcast();
    }
}
