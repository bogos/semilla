// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/IdentityVerifier.sol";

contract IdentityVerifierTest is Test {
    IdentityVerifier public verifier;
    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        verifier = new IdentityVerifier();
    }

    function testVerifyIdentity() public {
        vm.prank(alice);
        verifier.verifyIdentity("biometric");
        
        assertEq(verifier.isUserVerified(alice), true);
        assertEq(verifier.getTotalVerified(), 1);
    }

    function testCannotVerifyTwice() public {
        vm.prank(alice);
        verifier.verifyIdentity("biometric");
        
        vm.prank(alice);
        vm.expectRevert("Already verified");
        verifier.verifyIdentity("biometric");
    }

    function testGetVerificationDetails() public {
        vm.prank(alice);
        verifier.verifyIdentity("zk_proof");
        
        (bool verified, uint256 timestamp, string memory method) = verifier.getVerificationDetails(alice);
        
        assertEq(verified, true);
        assertGt(timestamp, 0);
        assertEq(keccak256(abi.encodePacked(method)), keccak256(abi.encodePacked("zk_proof")));
    }

    function testSubmitZKProof() public {
        bytes memory proof = abi.encodePacked("test_proof");
        
        vm.prank(alice);
        verifier.submitZKProof(proof);
        
        assertEq(verifier.isUserVerified(alice), true);
    }

    function testRevokeVerification() public {
        vm.prank(alice);
        verifier.verifyIdentity("biometric");
        
        verifier.revokeVerification(alice);
        
        assertEq(verifier.isUserVerified(alice), false);
        assertEq(verifier.getTotalVerified(), 0);
    }

    function testCannotRevokeUnverifiedUser() public {
        vm.expectRevert("User not verified");
        verifier.revokeVerification(alice);
    }

    function testMultipleUsers() public {
        vm.prank(alice);
        verifier.verifyIdentity("biometric");
        
        vm.prank(bob);
        verifier.verifyIdentity("zk_proof");
        
        assertEq(verifier.getTotalVerified(), 2);
        assertEq(verifier.isUserVerified(alice), true);
        assertEq(verifier.isUserVerified(bob), true);
    }
}
