// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/factory/PoolRegistry.sol";

contract PoolRegistryTest is Test {
    PoolRegistry public registry;
    
    address public owner = address(0x1);
    address public factory = address(0x2);
    address public pool1 = address(0x3);
    address public pool2 = address(0x4);
    address public poolOwner1 = address(0x5);
    address public poolOwner2 = address(0x6);
    address public usdc = address(0x7);
    address public usX = address(0x8);
    
    function setUp() public {
        vm.startPrank(owner);
        registry = new PoolRegistry(factory);
        vm.stopPrank();
    }
    
    function testRegisterPool() public {
        vm.startPrank(factory);
        
        registry.registerPool(pool1, poolOwner1, "Pool 1", usdc);
        
        assertTrue(registry.poolExists(pool1));
        PoolRegistry.PoolMetadata memory metadata = registry.getPoolMetadata(pool1);
        
        assertEq(metadata.pool, pool1);
        assertEq(metadata.owner, poolOwner1);
        assertEq(metadata.name, "Pool 1");
        assertEq(metadata.asset, usdc);
        assertTrue(metadata.active);
        
        vm.stopPrank();
    }
    
    function testCannotRegisterPoolTwice() public {
        vm.startPrank(factory);
        
        registry.registerPool(pool1, poolOwner1, "Pool 1", usdc);
        
        vm.expectRevert("Already registered");
        registry.registerPool(pool1, poolOwner1, "Pool 1", usdc);
        
        vm.stopPrank();
    }
    
    function testOnlyFactoryCanRegister() public {
        vm.startPrank(poolOwner1);
        
        vm.expectRevert("Only factory");
        registry.registerPool(pool1, poolOwner1, "Pool 1", usdc);
        
        vm.stopPrank();
    }
    
    function testDeactivatePool() public {
        vm.startPrank(factory);
        registry.registerPool(pool1, poolOwner1, "Pool 1", usdc);
        vm.stopPrank();
        
        vm.startPrank(poolOwner1);
        registry.deactivatePool(pool1);
        
        PoolRegistry.PoolMetadata memory metadata = registry.getPoolMetadata(pool1);
        assertFalse(metadata.active);
        assertFalse(registry.isPoolActive(pool1));
        
        vm.stopPrank();
    }
    
    function testGetAllPools() public {
        vm.startPrank(factory);
        
        registry.registerPool(pool1, poolOwner1, "Pool 1", usdc);
        registry.registerPool(pool2, poolOwner2, "Pool 2", usX);
        
        address[] memory allPools = registry.getAllPools();
        assertEq(allPools.length, 2);
        assertEq(allPools[0], pool1);
        assertEq(allPools[1], pool2);
        
        vm.stopPrank();
    }
    
    function testGetActivePools() public {
        vm.startPrank(factory);
        
        registry.registerPool(pool1, poolOwner1, "Pool 1", usdc);
        registry.registerPool(pool2, poolOwner2, "Pool 2", usX);
        
        vm.stopPrank();
        
        // Deactivate pool1
        vm.startPrank(poolOwner1);
        registry.deactivatePool(pool1);
        vm.stopPrank();
        
        address[] memory activePools = registry.getActivePools();
        assertEq(activePools.length, 1);
        assertEq(activePools[0], pool2);
    }
    
    function testGetPoolsByOwner() public {
        vm.startPrank(factory);
        
        registry.registerPool(pool1, poolOwner1, "Pool 1", usdc);
        registry.registerPool(pool2, poolOwner1, "Pool 1-2", usX);
        
        address pool3 = address(0x9);
        registry.registerPool(pool3, poolOwner2, "Pool 2", usdc);
        
        vm.stopPrank();
        
        address[] memory owner1Pools = registry.getPoolsByOwner(poolOwner1);
        assertEq(owner1Pools.length, 2);
        assertEq(owner1Pools[0], pool1);
        assertEq(owner1Pools[1], pool2);
        
        address[] memory owner2Pools = registry.getPoolsByOwner(poolOwner2);
        assertEq(owner2Pools.length, 1);
        assertEq(owner2Pools[0], pool3);
    }
    
    function testGetPoolCount() public {
        vm.startPrank(factory);
        
        assertEq(registry.getPoolCount(), 0);
        
        registry.registerPool(pool1, poolOwner1, "Pool 1", usdc);
        assertEq(registry.getPoolCount(), 1);
        
        registry.registerPool(pool2, poolOwner2, "Pool 2", usX);
        assertEq(registry.getPoolCount(), 2);
        
        vm.stopPrank();
    }
    
    function testSetFactory() public {
        address newFactory = address(0x10);
        
        vm.startPrank(owner);
        registry.setFactory(newFactory);
        assertEq(registry.factory(), newFactory);
        vm.stopPrank();
    }
    
    function testOnlyOwnerCanSetFactory() public {
        address newFactory = address(0x10);
        
        vm.startPrank(poolOwner1);
        vm.expectRevert();
        registry.setFactory(newFactory);
        vm.stopPrank();
    }
}
