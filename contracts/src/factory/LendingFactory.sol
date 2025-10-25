// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../LendingPool.sol";
import "./PoolRegistry.sol";

/**
 * @title LendingFactory
 * @dev Factory for creating and managing multiple independent lending pools
 * TODO: Add access control levels (creator, admin, super-admin)
 * TODO: Implement pool creation fees
 * TODO: Add whitelisting for supported assets
 * TODO: Replace getPoolsByOwner loop with mapping for production efficiency
 */
contract LendingFactory is Ownable {
    // Pool storage
    address[] public allPools;
    mapping(address => bool) public isPool;
    mapping(address => address) public poolOwner;
    mapping(address => PoolConfig) public poolConfigs;
    
    // Registry reference
    PoolRegistry public poolRegistry;
    
    // Supported assets
    mapping(address => bool) public supportedAssets;
    
    // Feature flags
    bool public factoryEnabled = true;
    
    struct PoolConfig {
        string name;
        address asset;
        uint16 rifCoverageBp; // e.g., 2000 = 20%
        uint32 createdAt;
    }
    
    event PoolCreated(
        address indexed pool,
        address indexed owner,
        string name,
        address asset
    );
    
    event AssetWhitelisted(address indexed asset);
    event AssetRemoved(address indexed asset);
    event FactoryToggled(bool enabled);
    
    constructor(address _registry) Ownable(msg.sender) {
        require(_registry != address(0), "Invalid registry");
        poolRegistry = PoolRegistry(_registry);
    }
    
    /**
     * @dev Whitelist an asset for pool creation
     */
    function whitelistAsset(address asset) external onlyOwner {
        require(asset != address(0), "Invalid asset");
        supportedAssets[asset] = true;
        emit AssetWhitelisted(asset);
    }
    
    /**
     * @dev Remove asset from whitelist
     */
    function removeAsset(address asset) external onlyOwner {
        supportedAssets[asset] = false;
        emit AssetRemoved(asset);
    }
    
    /**
     * @dev Toggle factory creation
     */
    function toggleFactory(bool enabled) external onlyOwner {
        factoryEnabled = enabled;
        emit FactoryToggled(enabled);
    }
    
    /**
     * @dev Create a new lending pool
     * TODO: Add creation fee mechanism
     * TODO: Add pool initialization parameters
     */
    function createPool(
        string memory name,
        address asset,
        uint256 apr,
        uint16 rifCoverageBp
    ) external returns (address poolAddress) {
        require(factoryEnabled, "Factory disabled");
        require(supportedAssets[asset], "Asset not whitelisted");
        require(apr > 0 && apr <= 100, "Invalid APR");
        require(rifCoverageBp <= 10000, "Invalid RIF coverage");
        require(bytes(name).length > 0, "Name required");
        
        // Deploy new LendingPool
        LendingPool newPool = new LendingPool();
        poolAddress = address(newPool);
        
        // Initialize pool with configuration
        newPool.initialize(name, asset, msg.sender, apr, rifCoverageBp);
        
        // Store configuration
        allPools.push(poolAddress);
        isPool[poolAddress] = true;
        poolOwner[poolAddress] = msg.sender;
        
        PoolConfig memory config = PoolConfig({
            name: name,
            asset: asset,
            rifCoverageBp: rifCoverageBp,
            createdAt: uint32(block.timestamp)
        });
        
        poolConfigs[poolAddress] = config;
        
        // Register in registry
        poolRegistry.registerPool(poolAddress, msg.sender, name, asset);
        
        emit PoolCreated(poolAddress, msg.sender, name, asset);
        
        return poolAddress;
    }
    
    /**
     * @dev Get all pools
     */
    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }
    
    /**
     * @dev Get pool count
     */
    function getPoolCount() external view returns (uint256) {
        return allPools.length;
    }
    
    /**
     * @dev Get pools by owner
     * WARNING: This function iterates over all pools. For production,
     * consider replacing with a poolsByOwner mapping for efficiency.
     * For MVP hackathon, this is acceptable for read-only calls.
     */
    function getPoolsByOwner(address owner_) external view returns (address[] memory) {
        uint256 count = 0;
        
        // Count pools owned by address
        for (uint256 i = 0; i < allPools.length; i++) {
            if (poolOwner[allPools[i]] == owner_) {
                count++;
            }
        }
        
        // Collect pools
        address[] memory result = new address[](count);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < allPools.length; i++) {
            if (poolOwner[allPools[i]] == owner_) {
                result[idx] = allPools[i];
                idx++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get pool configuration
     */
    function getPoolConfig(address pool) external view returns (PoolConfig memory) {
        require(isPool[pool], "Invalid pool");
        return poolConfigs[pool];
    }
}
