// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/factory/LendingFactory.sol";
import "../src/factory/PoolRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Mock USDC for testing
contract MockUSDC is IERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint8 public decimals = 6;
    
    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
    
    function totalSupply() external pure returns (uint256) {
        return 1_000_000_000 * 10**6;
    }
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }
}

contract LendingFactoryTest is Test {
    LendingFactory public factory;
    PoolRegistry public registry;
    MockUSDC public usdc;
    
    address public owner = address(0x1);
    address public poolCreator = address(0x2);
    
    function setUp() public {
        vm.startPrank(owner);
        
        usdc = new MockUSDC();
        registry = new PoolRegistry(owner); // Placeholder factory, will be updated
        factory = new LendingFactory(address(registry));
        
        // Update registry factory reference
        registry.setFactory(address(factory));
        
        // Whitelist USDC
        factory.whitelistAsset(address(usdc));
        
        vm.stopPrank();
    }
    
    function testWhitelistAsset() public {
        vm.startPrank(owner);
        
        address newAsset = address(0x3);
        factory.whitelistAsset(newAsset);
        
        assertTrue(factory.supportedAssets(newAsset));
        
        vm.stopPrank();
    }
    
    function testRemoveAsset() public {
        vm.startPrank(owner);
        
        factory.removeAsset(address(usdc));
        assertFalse(factory.supportedAssets(address(usdc)));
        
        vm.stopPrank();
    }
    
    function testToggleFactory() public {
        vm.startPrank(owner);
        
        assertTrue(factory.factoryEnabled());
        factory.toggleFactory(false);
        assertFalse(factory.factoryEnabled());
        
        vm.stopPrank();
    }
    
    function testCreatePool() public {
        vm.startPrank(poolCreator);
        
        address poolAddress = factory.createPool(
            "Test Pool",
            address(usdc),
            2000 // 20% RIF coverage
        );
        
        assertTrue(factory.isPool(poolAddress));
        assertEq(factory.poolOwner(poolAddress), poolCreator);
        
        LendingFactory.PoolConfig memory config = factory.getPoolConfig(poolAddress);
        assertEq(config.name, "Test Pool");
        assertEq(config.asset, address(usdc));
        assertEq(config.rifCoverageBp, 2000);
        
        vm.stopPrank();
    }
    
    function testCannotCreatePoolWithoutWhitelistedAsset() public {
        vm.startPrank(poolCreator);
        
        address unknownAsset = address(0x999);
        
        vm.expectRevert("Asset not whitelisted");
        factory.createPool("Test Pool", unknownAsset, 2000);
        
        vm.stopPrank();
    }
    
    function testCannotCreatePoolWithInvalidRIFCoverage() public {
        vm.startPrank(poolCreator);
        
        vm.expectRevert("Invalid RIF coverage");
        factory.createPool("Test Pool", address(usdc), 15000); // > 10000
        
        vm.stopPrank();
    }
    
    function testCannotCreatePoolWhenDisabled() public {
        vm.startPrank(owner);
        factory.toggleFactory(false);
        vm.stopPrank();
        
        vm.startPrank(poolCreator);
        vm.expectRevert("Factory disabled");
        factory.createPool("Test Pool", address(usdc), 2000);
        vm.stopPrank();
    }
    
    function testGetAllPools() public {
        vm.startPrank(poolCreator);
        
        address pool1 = factory.createPool("Pool 1", address(usdc), 1000);
        address pool2 = factory.createPool("Pool 2", address(usdc), 2000);
        
        address[] memory allPools = factory.getAllPools();
        assertEq(allPools.length, 2);
        assertEq(allPools[0], pool1);
        assertEq(allPools[1], pool2);
        
        vm.stopPrank();
    }
    
    function testGetPoolCount() public {
        vm.startPrank(poolCreator);
        
        assertEq(factory.getPoolCount(), 0);
        factory.createPool("Pool 1", address(usdc), 1000);
        assertEq(factory.getPoolCount(), 1);
        factory.createPool("Pool 2", address(usdc), 2000);
        assertEq(factory.getPoolCount(), 2);
        
        vm.stopPrank();
    }
    
    function testGetPoolsByOwner() public {
        address otherCreator = address(0x3);
        
        vm.startPrank(poolCreator);
        address pool1 = factory.createPool("Pool 1", address(usdc), 1000);
        address pool2 = factory.createPool("Pool 2", address(usdc), 2000);
        vm.stopPrank();
        
        vm.startPrank(otherCreator);
        address pool3 = factory.createPool("Pool 3", address(usdc), 1500);
        vm.stopPrank();
        
        address[] memory creatorPools = factory.getPoolsByOwner(poolCreator);
        assertEq(creatorPools.length, 2);
        assertEq(creatorPools[0], pool1);
        assertEq(creatorPools[1], pool2);
        
        address[] memory otherPools = factory.getPoolsByOwner(otherCreator);
        assertEq(otherPools.length, 1);
        assertEq(otherPools[0], pool3);
    }
}
