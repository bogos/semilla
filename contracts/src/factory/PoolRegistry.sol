// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PoolRegistry
 * @dev Registry for storing pool metadata and facilitating discovery
 * TODO: Add pool performance metrics tracking
 * TODO: Add pool reputation/rating system
 */
contract PoolRegistry is Ownable {
    
    struct PoolMetadata {
        address pool;
        address owner;
        string name;
        address asset;
        uint32 createdAt;
        bool active;
    }
    
    address[] public allPools;
    mapping(address => PoolMetadata) public pools;
    mapping(address => bool) public poolExists;
    mapping(address => address[]) public poolsByOwner;
    
    // Only factory can register
    address public factory;
    
    event PoolRegistered(
        address indexed pool,
        address indexed owner,
        string name
    );
    
    event PoolDeactivated(address indexed pool);
    event FactoryUpdated(address indexed newFactory);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }
    
    constructor(address _factory) Ownable(msg.sender) {
        factory = _factory;
    }
    
    /**
     * @dev Update factory address
     */
    function setFactory(address _factory) external onlyOwner {
        require(_factory != address(0), "Invalid factory");
        factory = _factory;
        emit FactoryUpdated(_factory);
    }
    
    /**
     * @dev Register a new pool (called by factory)
     */
    function registerPool(
        address pool,
        address owner,
        string memory name,
        address asset
    ) external onlyFactory {
        require(pool != address(0), "Invalid pool");
        require(owner != address(0), "Invalid owner");
        require(!poolExists[pool], "Already registered");
        require(bytes(name).length > 0, "Name required");
        
        PoolMetadata memory metadata = PoolMetadata({
            pool: pool,
            owner: owner,
            name: name,
            asset: asset,
            createdAt: uint32(block.timestamp),
            active: true
        });
        
        allPools.push(pool);
        pools[pool] = metadata;
        poolExists[pool] = true;
        poolsByOwner[owner].push(pool);
        
        emit PoolRegistered(pool, owner, name);
    }
    
    /**
     * @dev Deactivate pool
     */
    function deactivatePool(address pool) external {
        require(poolExists[pool], "Pool not found");
        require(pools[pool].owner == msg.sender || msg.sender == owner(), "Not authorized");
        
        pools[pool].active = false;
        emit PoolDeactivated(pool);
    }
    
    /**
     * @dev Get all pools
     */
    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }
    
    /**
     * @dev Get active pools only
     */
    function getActivePools() external view returns (address[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < allPools.length; i++) {
            if (pools[allPools[i]].active) {
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < allPools.length; i++) {
            if (pools[allPools[i]].active) {
                result[idx] = allPools[i];
                idx++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get pools by owner
     */
    function getPoolsByOwner(address owner_) external view returns (address[] memory) {
        return poolsByOwner[owner_];
    }
    
    /**
     * @dev Get pool count
     */
    function getPoolCount() external view returns (uint256) {
        return allPools.length;
    }
    
    /**
     * @dev Get pool metadata
     */
    function getPoolMetadata(address pool) external view returns (PoolMetadata memory) {
        require(poolExists[pool], "Pool not found");
        return pools[pool];
    }
    
    /**
     * @dev Check if pool is active
     */
    function isPoolActive(address pool) external view returns (bool) {
        return poolExists[pool] && pools[pool].active;
    }
}
