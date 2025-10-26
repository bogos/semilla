// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/LendingPool.sol";

contract LendingPoolTest is Test {
    LendingPool public pool;
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public poolOwner = address(0x3);

    function setUp() public {
        pool = new LendingPool();
        pool.initialize("Test Pool", address(0), poolOwner, 8, 2000, false);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testDeposit() public {
        vm.prank(alice);
        pool.deposit{value: 1 ether}(0);
        
        assertEq(pool.getBalance(alice), 1 ether);
        (uint256 deposits, , , , ) = pool.getPoolStats();
        assertEq(deposits, 1 ether);
    }

    function testWithdraw() public {
        vm.prank(alice);
        pool.deposit{value: 1 ether}(0);
        
        vm.prank(alice);
        pool.withdraw(0.5 ether);
        
        assertEq(pool.getBalance(alice), 0.5 ether);
        (uint256 deposits, , , , ) = pool.getPoolStats();
        assertEq(deposits, 0.5 ether);
    }

    function testCreateLoan() public {
        vm.prank(alice);
        pool.deposit{value: 5 ether}(0);
        
        vm.prank(bob);
        pool.createLoan(2 ether, 30);
        
        (uint256 principal, , , string memory status) = pool.getLoanInfo(bob);
        assertEq(principal, 2 ether);
        (, uint256 borrowed, , , ) = pool.getPoolStats();
        assertEq(borrowed, 2 ether);
    }

    function testRepayLoan() public {
        vm.prank(alice);
        pool.deposit{value: 5 ether}(0);
        
        vm.prank(bob);
        pool.createLoan(2 ether, 30);
        
        vm.prank(bob);
        pool.repayLoan{value: 2.1 ether}(0);
        
        (uint256 principal, , , ) = pool.getLoanInfo(bob);
        assertEq(principal, 0);
        (, uint256 borrowed, , , ) = pool.getPoolStats();
        assertEq(borrowed, 0);
    }

    function testGetPoolStats() public {
        vm.prank(alice);
        pool.deposit{value: 5 ether}(0);
        
        vm.prank(bob);
        pool.createLoan(2 ether, 30);
        
        (uint256 deposits, uint256 borrowed, uint256 available, , ) = pool.getPoolStats();
        
        assertEq(deposits, 5 ether);
        assertEq(borrowed, 2 ether);
        assertEq(available, 3 ether);
    }

    function testCannotWithdrawMoreThanBalance() public {
        vm.prank(alice);
        pool.deposit{value: 1 ether}(0);
        
        vm.prank(alice);
        vm.expectRevert("Insufficient balance");
        pool.withdraw(2 ether);
    }

    function testCannotCreateLoanWithInsufficientPoolBalance() public {
        vm.prank(alice);
        pool.deposit{value: 1 ether}(0);
        
        vm.prank(bob);
        vm.expectRevert("Insufficient pool liquidity");
        pool.createLoan(5 ether, 30);
    }
}
