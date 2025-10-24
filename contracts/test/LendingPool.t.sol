// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/LendingPool.sol";

contract LendingPoolTest is Test {
    LendingPool public pool;
    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        pool = new LendingPool();
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testDeposit() public {
        vm.prank(alice);
        pool.deposit{value: 1 ether}();
        
        assertEq(pool.getBalance(alice), 1 ether);
        (uint256 deposits, , ) = pool.getPoolStats();
        assertEq(deposits, 1 ether);
    }

    function testWithdraw() public {
        vm.prank(alice);
        pool.deposit{value: 1 ether}();
        
        vm.prank(alice);
        pool.withdraw(0.5 ether);
        
        assertEq(pool.getBalance(alice), 0.5 ether);
        (uint256 deposits, , ) = pool.getPoolStats();
        assertEq(deposits, 0.5 ether);
    }

    function testCreateLoan() public {
        vm.prank(alice);
        pool.deposit{value: 5 ether}();
        
        vm.prank(bob);
        pool.createLoan(2 ether);
        
        assertEq(pool.getLoanInfo(bob), 2 ether);
        (, uint256 borrowed, ) = pool.getPoolStats();
        assertEq(borrowed, 2 ether);
    }

    function testRepayLoan() public {
        vm.prank(alice);
        pool.deposit{value: 5 ether}();
        
        vm.prank(bob);
        pool.createLoan(2 ether);
        
        vm.prank(bob);
        pool.repayLoan{value: 2 ether}();
        
        assertEq(pool.getLoanInfo(bob), 0);
        (, uint256 borrowed, ) = pool.getPoolStats();
        assertEq(borrowed, 0);
    }

    function testGetPoolStats() public {
        vm.prank(alice);
        pool.deposit{value: 5 ether}();
        
        vm.prank(bob);
        pool.createLoan(2 ether);
        
        (uint256 deposits, uint256 borrowed, uint256 available) = pool.getPoolStats();
        
        assertEq(deposits, 5 ether);
        assertEq(borrowed, 2 ether);
        assertEq(available, 3 ether);
    }

    function testCannotWithdrawMoreThanBalance() public {
        vm.prank(alice);
        pool.deposit{value: 1 ether}();
        
        vm.prank(alice);
        vm.expectRevert("Insufficient balance");
        pool.withdraw(2 ether);
    }

    function testCannotCreateLoanWithInsufficientPoolBalance() public {
        vm.prank(alice);
        pool.deposit{value: 1 ether}();
        
        vm.prank(bob);
        vm.expectRevert("Insufficient pool balance");
        pool.createLoan(5 ether);
    }
}
