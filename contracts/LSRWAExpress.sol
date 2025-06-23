// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract LSRWAExpress {
    using SafeERC20 for IERC20;
    // --- Tokens ---
    IERC20 public immutable usdc;
    IERC20 public immutable lsrwa;

    // --- Constants ---
    uint256 public constant BPS_DIVISOR = 10000;

    // --- State Variables ---
    address public admin;
    uint256 public currentEpoch;
    uint256 public epochDuration; // in blocks
    uint256 public lastEpochBlock;
    uint256 public rewardAPR;
    uint256 public maxEpochsBeforeLiquidation;

    // --- Mappings ---
    mapping(uint256 => DepositRequest) public depositRequests;
    mapping(uint256 => WithdrawRequest) public withdrawRequests;
    mapping(address => uint256) public activeDeposits;
    mapping(address => BorrowRequest) public borrowRequests;

    uint256 public depositCounter;
    uint256 public withdrawCounter;

    // --- Structs ---
    struct DepositRequest {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool processed;
    }

    struct WithdrawRequest {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool processed;
        bool isPartial;
    }

    struct Epoch {
        uint256 startBlock;
        uint256 endBlock;
        uint256 totalDeposits;
        uint256 totalWithdrawals;
        uint256 rewardsDistributed;
        uint256 aprBps;
    }

    struct BorrowRequest {
        uint256 collateralAmount; // LSRWA
        uint256 borrowedAmount;   // USDC
        uint256 startEpoch;
        bool repaid;
    }


    // --- Events ---
    event DepositRequested(uint256 requestId, address user, uint256 amount, uint256 timestamp);
    event WithdrawRequested(uint256 requestId, address user, uint256 amount, uint256 timestamp);
    event DepositCancelled(uint256 requestId, address user);
    event WithdrawExecuted(uint256 requestId, address user, uint256 amount);
    event EpochProcessed(uint256 epochId, uint256 totalDeposits, uint256 totalWithdrawals);
    event CollateralDeposited(address originator, uint256 amount);
    event BorrowRequested(address originator, uint256 amount);
    event CollateralLiquidated(address originator, uint256 seizedAmount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _usdc, address _lsrwa) {
        admin = msg.sender;
        usdc = IERC20(_usdc);
        lsrwa = IERC20(_lsrwa);
        epochDuration = 40320; // ~1 week in blocks
        lastEpochBlock = block.number;
        depositCounter = 0;
        withdrawCounter = 0;
    }

    // --- Depositor ---

    function requestDeposit(uint256 amount) external returns (uint256 requestId) {
        require(amount > 0, "Zero amount");
        

        usdc.safeTransferFrom(            
            msg.sender,
            address(this),
            amount // uint256 _value
        );

        requestId = ++depositCounter;
        depositRequests[requestId] = DepositRequest(msg.sender, amount, block.timestamp, false);
        emit DepositRequested(requestId, msg.sender, amount, block.timestamp);
    }

    function requestWithdraw(uint256 amount) external returns (uint256 requestId) {
        require(amount > 0 && activeDeposits[msg.sender] >= amount, "Invalid amount");

        requestId = ++withdrawCounter;
        withdrawRequests[requestId] = WithdrawRequest(msg.sender, amount, block.timestamp, false, false);
        emit WithdrawRequested(requestId, msg.sender, amount, block.timestamp);
    }

    function cancelDepositRequest(uint256 requestId) external {
        DepositRequest storage req = depositRequests[requestId];
        require(!req.processed && req.user == msg.sender, "Can't cancel");
        req.processed = true;
        usdc.transfer(req.user, req.amount);
        emit DepositCancelled(requestId, req.user);
    }

    function executeWithdraw(uint256 requestId) external {
        WithdrawRequest storage req = withdrawRequests[requestId];
        require(req.user == msg.sender && req.processed, "Not authorized");
        activeDeposits[msg.sender] -= req.amount;
        usdc.transfer(req.user, req.amount);
        emit WithdrawExecuted(requestId, req.user, req.amount);
    }

    function claimRewards() external {
        // TODO: Track and distribute yield rewards
    }

    // --- Originator ---
    function depositCollateral(uint256 amount) external {
        lsrwa.transferFrom(msg.sender, address(this), amount);
        borrowRequests[msg.sender].collateralAmount += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    function requestBorrow(uint256 amount) external {
        BorrowRequest storage pos = borrowRequests[msg.sender];
        require(pos.collateralAmount > 0, "No collateral");
        require(pos.borrowedAmount == 0, "Already borrowed");

        pos.borrowedAmount = amount;
        pos.startEpoch = currentEpoch;
        usdc.transfer(msg.sender, amount);
        emit BorrowRequested(msg.sender, amount);
    }

    function repayBorrow(uint256 amount) external {
        BorrowRequest storage pos = borrowRequests[msg.sender];
        require(pos.borrowedAmount > 0 && !pos.repaid, "Nothing to repay");
        usdc.transferFrom(msg.sender, address(this), amount);
        pos.repaid = true;
    }

    // --- Admin ---
    function processEpoch() external onlyAdmin {
        require(block.number >= lastEpochBlock + epochDuration, "Epoch ongoing");
        currentEpoch++;
        lastEpochBlock = block.number;

        // Simplified: assume 1-to-1 approval for demonstration
        for (uint256 i = 1; i <= depositCounter; i++) {
            DepositRequest storage req = depositRequests[i];
            if (!req.processed) {
                activeDeposits[req.user] += req.amount;
                req.processed = true;
            }
        }

        for (uint256 i = 1; i <= withdrawCounter; i++) {
            WithdrawRequest storage req = withdrawRequests[i];
            if (!req.processed && activeDeposits[req.user] >= req.amount) {
                req.processed = true;
            }
        }
		
		// distribute rewards
		// claimRewards();

        emit EpochProcessed(currentEpoch, depositCounter, withdrawCounter);
    }

    function setRewardAPR(uint256 aprBps) external onlyAdmin {
        rewardAPR = aprBps;
    }

    function setEpochDuration(uint256 blocks) external onlyAdmin {
        epochDuration = blocks;
    }

    function setMaxEpochsBeforeLiquidation(uint256 epochs) external onlyAdmin {
        maxEpochsBeforeLiquidation = epochs;
    }

    function liquidateCollateral(address originator) external onlyAdmin {
        BorrowRequest storage pos = borrowRequests[originator];
        require(!pos.repaid && currentEpoch > pos.startEpoch + maxEpochsBeforeLiquidation, "Not eligible");

        uint256 seized = pos.collateralAmount;
        pos.collateralAmount = 0;
        pos.repaid = true;

        // Convert LSRWA to USDC off-chain (not in contract)
        emit CollateralLiquidated(originator, seized);
    }
}
