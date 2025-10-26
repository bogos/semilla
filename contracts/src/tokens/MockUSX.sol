// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSX
 * @dev Mock USX token for testing (6 decimals)
 */
contract MockUSX is ERC20 {
    constructor() ERC20("Mock USX", "USX") {
        // Mint 1 million USX to deployer (6 decimals)
        _mint(msg.sender, 1_000_000 * 10 ** 6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
