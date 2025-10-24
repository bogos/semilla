// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LendingPool
 * @dev Main contract for decentralized lending pool management
 * TODO: Add reentrancy guards
 * TODO: Implement accurate interest calculation with compound
 * TODO: Add event indexing for off-chain monitoring
 * TODO: Add pause/emergency functionality
 */
contract LendingPool {
    // State variables
    string public name = "Semilla Lending Pool";
    uint256 public totalDeposits;
    uint256 public totalBorrowed;
    uint256 public constant APR = 8; // 8% APR
    uint256 public constant ADMIN_FEE_PERCENT = 10; // 10% of interest
    
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrowed;
    mapping(address => uint256) public lastUpdateTime;

    // Events
    event Deposit(address indexed depositor, uint256 amount);
    event Withdraw(address indexed withdrawer, uint256 amount);
    event LoanCreated(address indexed borrower, uint256 amount);
    event LoanRepaid(address indexed borrower, uint256 amount);

    /**
     * @dev Allows user to deposit funds into the pool
     * TODO: Add minimum deposit amount
     * TODO: Validate sender is not zero address
     */
    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        deposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
        lastUpdateTime[msg.sender] = block.timestamp;
        
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Allows user to withdraw funds from the pool
     * TODO: Check available liquidity before allowing withdrawal
     * TODO: Implement withdrawal queue for large withdrawals
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Withdraw amount must be greater than 0");
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdraw(msg.sender, amount);
    }

    /**
     * @dev Creates a new loan (simplified - no identity validation yet)
     * TODO: Add identity verification requirement
     * TODO: Add jury validation (currently hardcoded as true)
     * TODO: Add credit scoring logic
     * TODO: Add loan terms configuration
     */
    function createLoan(uint256 amount) external {
        require(amount > 0, "Loan amount must be greater than 0");
        require(totalDeposits >= amount, "Insufficient pool balance");
        require(borrowed[msg.sender] == 0, "Existing active loan");
        
        borrowed[msg.sender] = amount;
        totalBorrowed += amount;
        lastUpdateTime[msg.sender] = block.timestamp;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Loan transfer failed");
        
        emit LoanCreated(msg.sender, amount);
    }

    /**
     * @dev Allows user to repay loan with interest
     * TODO: Calculate accrued interest based on time
     * TODO: Distribute interest to lenders and admin
     * TODO: Update borrower credit score
     */
    function repayLoan() external payable {
        uint256 loanAmount = borrowed[msg.sender];
        require(loanAmount > 0, "No active loan");
        require(msg.value >= loanAmount, "Insufficient repayment amount");
        
        borrowed[msg.sender] = 0;
        totalBorrowed -= loanAmount;
        
        emit LoanRepaid(msg.sender, msg.value);
    }

    /**
     * @dev Gets user's deposit balance
     */
    function getBalance(address user) external view returns (uint256) {
        return deposits[user];
    }

    /**
     * @dev Gets user's active loan amount
     */
    function getLoanInfo(address user) external view returns (uint256) {
        return borrowed[user];
    }

    /**
     * @dev Gets overall pool statistics
     */
    function getPoolStats() external view returns (
        uint256 _totalDeposits,
        uint256 _totalBorrowed,
        uint256 _availableLiquidity
    ) {
        return (
            totalDeposits,
            totalBorrowed,
            totalDeposits - totalBorrowed
        );
    }
}
