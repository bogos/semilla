// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LendingPool
 * @dev Main contract for decentralized lending pool management
 * Compatible with LendingFactory for multi-pool support
 */
contract LendingPool is ReentrancyGuard {
    // Enum for loan status
    enum LoanStatus { ACTIVE, REPAID, DEFAULTED }
    
    // Loan structure with accurate interest tracking
    struct Loan {
        uint256 principal;
        uint256 durationDays;
        uint256 createdAt;
        uint256 dueDate;
        uint256 interestRate; // APR in basis points (800 = 8%)
        uint256 accruedInterest;
        uint256 paidInterest;
        LoanStatus status;
    }
    
    // State variables
    string public poolName;
    address public asset; // USDC, USX, ETH, etc.
    bool public isERC20; // false = ETH, true = ERC20
    address public poolOwner;
    
    uint256 public totalDeposits;
    uint256 public totalBorrowed;
    uint256 public rifFundBalance;
    uint256 public protocolFundBalance;
    
    uint256 public apr = 800; // 8% APR (in basis points: 800 = 8%)
    uint256 public rifCoverageBp = 2000; // 20% of interest to RIF
    uint256 public protocolFeeBp = 1000; // 10% of interest to protocol
    
    // Constants for distribution
    uint256 private constant LENDERS_SHARE_BP = 7000; // 70% to lenders
    uint256 private constant RIF_SHARE_BP = 2000;     // 20% to RIF fund
    uint256 private constant PROTOCOL_SHARE_BP = 1000; // 10% to protocol
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant DAYS_PER_YEAR = 365;
    
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public withdrawableInterest; // Interest earned by lenders
    mapping(address => Loan) public loans;
    mapping(address => uint256) public lastUpdateTime;
    
    bool private initialized;

    // Events
    event PoolInitialized(string name, address asset, uint256 apr, uint256 rifCoverage, bool isERC20);
    event Deposit(address indexed depositor, uint256 amount);
    event Withdraw(address indexed withdrawer, uint256 amount);
    event InterestWithdrawn(address indexed lender, uint256 amount);
    event LoanCreated(address indexed borrower, uint256 amount, uint256 durationDays, uint256 dueDate);
    event LoanRepaid(address indexed borrower, uint256 principal, uint256 interest);
    event InterestAccrued(uint256 totalInterest, uint256 lendersShare, uint256 rifShare, uint256 protocolShare);
    event APRUpdated(uint256 newAPR);
    event RIFUpdated(uint256 newRIFCoverageBp);
    event LoanDefaulted(address indexed borrower, uint256 amount);
    
    modifier onlyPoolOwner() {
        require(msg.sender == poolOwner, "Only pool owner");
        _;
    }
    
    modifier onlyOnce() {
        require(!initialized, "Already initialized");
        _;  
    }
    
    /**
     * @dev Initialize pool (called by factory)
     */
    function initialize(
        string memory _name,
        address _asset,
        address _owner,
        uint256 _apr,
        uint256 _rifCoverageBp,
        bool _isERC20
    ) external onlyOnce {
        poolName = _name;
        asset = _asset;
        isERC20 = _isERC20;
        poolOwner = _owner;
        apr = _apr * 100; // Convert percent to basis points (8 -> 800)
        rifCoverageBp = _rifCoverageBp;
        initialized = true;
        
        emit PoolInitialized(_name, _asset, apr, _rifCoverageBp, _isERC20);
    }
    
    /**
     * @dev Update APR (pool owner only)
     */
    function setAPR(uint256 newAPR) external onlyPoolOwner {
        require(newAPR > 0 && newAPR <= 100, "Invalid APR");
        apr = newAPR;
        emit APRUpdated(newAPR);
    }
    
    /**
     * @dev Update RIF coverage (pool owner only)
     */
    function setRIFCoverage(uint256 newRIFCoverageBp) external onlyPoolOwner {
        require(newRIFCoverageBp <= 10000, "Invalid RIF coverage");
        rifCoverageBp = newRIFCoverageBp;
        emit RIFUpdated(newRIFCoverageBp);
    }

    /**
     * @dev Deposit ETH into the pool (or ERC20 via proxy function)
     */
    function deposit(uint256 amount) external payable nonReentrant {
        if (isERC20) {
            require(amount > 0, "Deposit amount must be greater than 0");
            require(msg.value == 0, "ETH not allowed for ERC20 pool");
            
            // Transfer ERC20 from sender to pool
            require(
                IERC20(asset).transferFrom(msg.sender, address(this), amount),
                "Transfer failed"
            );
            
            deposits[msg.sender] += amount;
            totalDeposits += amount;
        } else {
            // ETH deposit
            require(msg.value > 0, "Deposit amount must be greater than 0");
            deposits[msg.sender] += msg.value;
            totalDeposits += msg.value;
        }
        
        lastUpdateTime[msg.sender] = block.timestamp;
        emit Deposit(msg.sender, isERC20 ? amount : msg.value);
    }

    /**
     * @dev Withdraw funds from the pool
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Withdraw amount must be greater than 0");
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        
        if (isERC20) {
            require(IERC20(asset).transfer(msg.sender, amount), "Transfer failed");
        } else {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Transfer failed");
        }
        
        emit Withdraw(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw accrued interest earned from lending
     */
    function withdrawInterest() external nonReentrant {
        uint256 interest = withdrawableInterest[msg.sender];
        require(interest > 0, "No interest to withdraw");
        
        withdrawableInterest[msg.sender] = 0;
        
        if (isERC20) {
            require(IERC20(asset).transfer(msg.sender, interest), "Transfer failed");
        } else {
            (bool success, ) = msg.sender.call{value: interest}("");
            require(success, "Transfer failed");
        }
        
        emit InterestWithdrawn(msg.sender, interest);
    }

    /**
     * @dev Calculate accrued interest for a loan
     */
    function calculateAccruedInterest(address borrower) public view returns (uint256) {
        Loan storage loan = loans[borrower];
        if (loan.status != LoanStatus.ACTIVE) return 0;
        
        uint256 timeElapsed = block.timestamp - loan.createdAt;
        uint256 daysElapsed = timeElapsed / (1 days);
        
        // Interest = principal * (APR / 100) * (days / 365)
        // Using basis points: APR = 800 means 8% = 0.08
        uint256 interest = (loan.principal * loan.interestRate * daysElapsed) / 
                          (BASIS_POINTS * DAYS_PER_YEAR);
        
        return interest;
    }
    
    /**
     * @dev Creates a new loan for a borrower
     * Jury approval is automatic (always true for MVP)
     */
    function createLoan(
        uint256 amount,
        uint256 durationDays
    ) external nonReentrant {
        require(amount > 0, "Loan amount must be greater than 0");
        require(durationDays > 0, "Duration must be greater than 0");
        require(
            totalDeposits - totalBorrowed >= amount,
            "Insufficient pool liquidity"
        );
        require(loans[msg.sender].status != LoanStatus.ACTIVE, "Existing active loan");
        
        // Jury approval: Always true for MVP (automatic approval)
        
        uint256 dueDate = block.timestamp + (durationDays * 1 days);
        
        // Create loan record
        loans[msg.sender] = Loan({
            principal: amount,
            durationDays: durationDays,
            createdAt: block.timestamp,
            dueDate: dueDate,
            interestRate: apr, // Use pool's APR
            accruedInterest: 0,
            paidInterest: 0,
            status: LoanStatus.ACTIVE
        });
        
        totalBorrowed += amount;
        lastUpdateTime[msg.sender] = block.timestamp;
        
        // Transfer loan amount to borrower
        if (isERC20) {
            require(IERC20(asset).transfer(msg.sender, amount), "Loan transfer failed");
        } else {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Loan transfer failed");
        }
        
        emit LoanCreated(msg.sender, amount, durationDays, dueDate);
    }

    /**
     * @dev Repay loan with interest and distribute to lenders/funds
     */
    function repayLoan(uint256 repaymentAmount) external payable nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(loan.status == LoanStatus.ACTIVE, "No active loan");
        
        // Get accrued interest
        uint256 accruedInterest = calculateAccruedInterest(msg.sender);
        uint256 totalDue = loan.principal + accruedInterest;
        
        uint256 amount = isERC20 ? repaymentAmount : msg.value;
        require(amount >= totalDue, "Insufficient repayment amount");
        
        // Receive payment
        if (isERC20) {
            require(
                IERC20(asset).transferFrom(msg.sender, address(this), amount),
                "Transfer failed"
            );
        }
        
        // Update loan status
        loan.status = LoanStatus.REPAID;
        loan.paidInterest = accruedInterest;
        totalBorrowed -= loan.principal;
        
        // Distribute interest: 70% lenders, 20% RIF, 10% protocol
        uint256 lendersShare = (accruedInterest * LENDERS_SHARE_BP) / BASIS_POINTS;
        uint256 rifShare = (accruedInterest * RIF_SHARE_BP) / BASIS_POINTS;
        uint256 protocolShare = accruedInterest - lendersShare - rifShare;
        
        // Distribute to lenders proportionally to their deposits
        if (totalDeposits > 0) {
            address[] memory allLenders = getLendersArray();
            for (uint256 i = 0; i < allLenders.length; i++) {
                if (deposits[allLenders[i]] > 0) {
                    uint256 lenderShare = (lendersShare * deposits[allLenders[i]]) / totalDeposits;
                    withdrawableInterest[allLenders[i]] += lenderShare;
                }
            }
        }
        
        rifFundBalance += rifShare;
        protocolFundBalance += protocolShare;
        
        emit InterestAccrued(accruedInterest, lendersShare, rifShare, protocolShare);
        emit LoanRepaid(msg.sender, loan.principal, accruedInterest);
    }
    
    /**
     * @dev Get all lenders (helper for distribution)
     * WARNING: This is a simplified version. In production, use a set/list.
     */
    function getLendersArray() internal view returns (address[] memory) {
        // This is a placeholder - actual implementation would track lenders
        // For MVP, we'll distribute proportionally via totalDeposits
        address[] memory empty = new address[](0);
        return empty;
    }

    /**
     * @dev Gets user's deposit balance
     */
    function getBalance(address user) external view returns (uint256) {
        return deposits[user];
    }
    
    /**
     * @dev Gets user's withdrawable interest
     */
    function getWithdrawableInterest(address user) external view returns (uint256) {
        return withdrawableInterest[user];
    }

    /**
     * @dev Gets user's active loan info
     */
    function getLoanInfo(address user) external view returns (
        uint256 principal,
        uint256 accruedInterest,
        uint256 dueDate,
        string memory status
    ) {
        Loan storage loan = loans[user];
        string memory statusStr = loan.status == LoanStatus.ACTIVE ? "ACTIVE" :
                                  loan.status == LoanStatus.REPAID ? "REPAID" : "DEFAULTED";
        
        uint256 accrued = calculateAccruedInterest(user);
        
        return (loan.principal, accrued, loan.dueDate, statusStr);
    }

    /**
     * @dev Gets overall pool statistics
     */
    function getPoolStats() external view returns (
        uint256 _totalDeposits,
        uint256 _totalBorrowed,
        uint256 _availableLiquidity,
        uint256 _rifFundBalance,
        uint256 _protocolFundBalance
    ) {
        return (
            totalDeposits,
            totalBorrowed,
            totalDeposits - totalBorrowed,
            rifFundBalance,
            protocolFundBalance
        );
    }
}
