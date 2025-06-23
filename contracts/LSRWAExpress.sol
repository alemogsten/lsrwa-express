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
    Epoch public currentEpoch;
    uint256 public epochDuration; // in blocks
    uint256 public lastEpochBlock;
    uint256 public rewardAPR;
    uint256 public maxEpochsBeforeLiquidation;

    // --- Mappings ---
    mapping(uint256 => DepositRequest) public depositRequests;
    mapping(uint256 => WithdrawRequest) public withdrawRequests;
    mapping(address => uint256) public activeDeposits;
    mapping(address => BorrowRequest) public borrowRequests;
    mapping(uint256 => Epoch) public epochs;
    mapping(address => uint256) public unclaimedRewards;
    mapping(address => uint256) public collateralDeposits;
    mapping(uint256 => ApprovedRequest) public approvedRequestQueue;
    mapping(address => bool) public isActiveUser;
    mapping(address => bool) public isBorrower;

    uint256 public approvedRequestStart;
    uint256 public approvedRequestEnd;

    address[] public activeUserList;
    address[] public borrowerList;
    
    uint256 public poolUSDC; // available liquidity
    uint256 public poolLSRWA;

    uint256 public currentUSDC;
    uint256 public currentLSRWA;
    uint256 public currentCollaterals;
    uint256 public collateralRatio;

    uint256 public depositCounter;
    uint256 public withdrawCounter;
    uint256 public epochCounter;
    uint256 public borrowCounter;
    uint256 public currentEpochId;

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
        bool executed;
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
        uint256 amount;   // USDC
        uint256 startEpoch;
        bool repaid;
    }

    struct ApprovedRequest {
        address user;
        uint256 requestId;
        uint256 amount;
        uint256 timestamp;
        bool isWithdraw;
    }


    // --- Events ---
    event DepositRequested(uint256 requestId, address indexed user, uint256 amount, uint256 timestamp);
    event WithdrawRequested(uint256 requestId, address indexed user, uint256 amount, uint256 timestamp);
    event DepositApproved(uint256 requestId, address indexed user, uint256 amount);
    event WithdrawApproved(uint256 requestId, address indexed user, uint256 amount);
    event PartialWithdrawalFilled(uint256 requestId, address indexed user, uint256 amount, uint256 timestamp);
    event DepositCancelled(uint256 requestId, address indexed user);
    event WithdrawExecuted(uint256 requestId, address indexed user, uint256 amount);
    event EpochProcessed(uint256 indexed epochId, uint256 totalDeposits, uint256 totalWithdrawals);
    event CollateralDeposited(address indexed originator, uint256 amount);
    event BorrowRequested(address indexed originator, uint256 amount);
    event BorrowExecuted(uint256 requestId, address indexed originator, uint256 seizedAmount);
    event CollateralLiquidated(address indexed originator, uint256 seizedAmount);
    event RewardsClaimed(address indexed sender, uint256 amount);

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
        poolUSDC = 0;
        poolLSRWA = 0;
        
    }

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
        require(!req.processed, "Already processed");
        require(req.user == msg.sender, "Not request owner");

        usdc.safeTransfer(req.user, req.amount);
        req.processed = true;
        
        emit DepositCancelled(requestId, req.user);
    }

    // executeWithdraw for deposit cancel after approval
   function executeWithdraw(uint256 requestId) external {
        WithdrawRequest storage req = withdrawRequests[requestId];
        
        require(req.user == msg.sender, "Not authorized");
        require(req.processed, "Not approved yet");
        require(!req.executed, "Already executed");
        require(req.amount > 0, "Invalid amount");
        require(activeDeposits[msg.sender] >= req.amount, "Insufficient balance");

        req.executed = true;
        usdc.safeTransfer(req.user, req.amount);

        if (activeDeposits[req.user] == 0 && isActiveUser[req.user]) {
            isActiveUser[req.user] = false;
        }

        emit WithdrawExecuted(requestId, req.user, req.amount);
    }

    function claimRewards() external {
        uint256 reward = unclaimedRewards[msg.sender];
        require(reward > 0, "No rewards");

        unclaimedRewards[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, reward);
        emit RewardsClaimed(msg.sender, reward);
    }

    // --- Originator ---
    function depositCollateral(uint256 amount) external {
        lsrwa.safeTransferFrom(msg.sender, address(this), amount);
        borrowRequests[msg.sender].collateralAmount += amount;
        
        emit CollateralDeposited(msg.sender, amount);
    }

    function requestBorrow(uint256 amount) external {
        BorrowRequest storage pos = borrowRequests[msg.sender];
        require(pos.collateralAmount > 0, "No collateral");
        require(pos.amount == 0, "Already borrowed");

        pos.amount = amount;
        pos.startEpoch = currentEpoch.startBlock;

        if (!isBorrower[msg.sender]) {
            isBorrower[msg.sender] = true;
            borrowerList.push(msg.sender);
        }

        emit BorrowRequested(msg.sender, amount);
    }

    function repayBorrow(uint256 amount) external {
        BorrowRequest storage pos = borrowRequests[msg.sender];
        require(pos.amount > 0 && !pos.repaid, "Nothing to repay");
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        pos.repaid = true;
    }

    // --- Admin ---
    function processRequests(ApprovedRequest[] calldata requests) external onlyAdmin {
        for (uint256 i = 0; i < requests.length; i++) {
            approvedRequestQueue[approvedRequestEnd] = requests[i];
            approvedRequestEnd++;
        }
    }

    function processEpoch() external onlyAdmin {
        require(block.number > currentEpoch.endBlock, "Epoch not ended");

        uint256 liquidity = poolUSDC;
        uint256 totalActiveDeposits;
        uint256 totalWithdrawals;

        // Process approved deposit/withdraw
        for (uint256 i = approvedRequestStart; i < approvedRequestEnd; i++) {
            ApprovedRequest memory req = approvedRequestQueue[i];

            if (req.isWithdraw) {
                WithdrawRequest storage wReq = withdrawRequests[req.requestId];
                require(!wReq.processed, "Already processed");

                if (liquidity >= req.amount) {
                    usdc.safeTransfer(req.user, req.amount);
                    activeDeposits[req.user] -= req.amount;
                    liquidity -= req.amount;
                    totalWithdrawals += req.amount;
                    wReq.processed = true;
                    emit WithdrawApproved(req.requestId, req.user, req.amount);
                } else if (liquidity > 0) {
                    // Partial fill
                    uint256 partialAmount = liquidity;
                    usdc.safeTransfer(req.user, partialAmount);
                    activeDeposits[req.user] -= partialAmount;
                    liquidity = 0;
                    totalWithdrawals += partialAmount;

                    wReq.processed = true;

                    uint256 remaining = req.amount - partialAmount;
                    withdrawCounter++;
                    withdrawRequests[withdrawCounter] = WithdrawRequest(
                        req.user, remaining, req.timestamp, false, false
                    );
                    
                    emit WithdrawApproved(req.requestId, req.user, partialAmount);
                    emit WithdrawRequested(withdrawCounter, req.user, remaining, req.timestamp);
                }
            } else {
                if (!isActiveUser[req.user]) {
                    isActiveUser[req.user] = true;
                    activeUserList.push(req.user);
                }
                activeDeposits[req.user] += req.amount;
                totalActiveDeposits += req.amount;
                emit DepositApproved(req.requestId, req.user, req.amount);
            }

            delete approvedRequestQueue[i];
        }

        // Borrowing
        for (uint256 i = 1; i <= borrowerList.length; i++) {
            address borrower = borrowerList[i];
            BorrowRequest storage bReq = borrowRequests[borrower];
            if (!bReq.repaid) {
                uint256 collateralValue = collateralDeposits[borrower]; // Assumes 1:1 for simplicity
                if (liquidity >= bReq.amount && collateralValue * 100 / bReq.amount >= collateralRatio) {
                    liquidity -= bReq.amount;
                    usdc.safeTransfer(borrower, bReq.amount);
                    bReq.startEpoch = currentEpoch.startBlock;
                    emit BorrowExecuted(i, borrower, bReq.amount);
                }
            }
        }

        // Rewards
        uint256 duration = currentEpoch.endBlock - currentEpoch.startBlock;
        uint256 epochReward = (totalActiveDeposits * currentEpoch.aprBps * duration) / (2102400 * 10000); // 2102400 blocks ≈ 365 days at 15s/block

        if (epochReward > 0 && totalActiveDeposits > 0) {
            for (uint256 i = 0; i < activeUserList.length; i++) {
                address user = activeUserList[i];
                if (!isActiveUser[user]) continue;
                uint256 userDeposit = activeDeposits[user];
                if (userDeposit > 0) {
                    uint256 reward = (userDeposit * epochReward) / totalActiveDeposits;
                    unclaimedRewards[user] += reward;
                }
            }

            currentEpoch.rewardsDistributed = epochReward;
        }

        currentEpoch = Epoch({
            startBlock: currentEpoch.endBlock + 1,
            endBlock: currentEpoch.endBlock + epochDuration,
            totalDeposits: totalActiveDeposits,
            totalWithdrawals: totalWithdrawals,
            rewardsDistributed: 0,
            aprBps: rewardAPR
        });

        emit EpochProcessed(currentEpochId, totalActiveDeposits, totalWithdrawals);

        // Move pointer forward
        approvedRequestStart = approvedRequestEnd;
        currentEpochId++;
    }

    function setRewardAPR(uint256 aprBps) external onlyAdmin {
        rewardAPR = aprBps;
    }

    function setEpochDuration(uint256 blocks) external onlyAdmin {
        epochDuration = blocks;
    }

    function setMaxEpochsBeforeLiquidation(uint256 epoch) external onlyAdmin {
        maxEpochsBeforeLiquidation = epoch;
    }

    function liquidateCollateral(address originator) external onlyAdmin {
        BorrowRequest storage pos = borrowRequests[originator];
        require(!pos.repaid && currentEpoch.startBlock > pos.startEpoch + maxEpochsBeforeLiquidation, "Not eligible");

        uint256 seized = pos.collateralAmount;
        pos.collateralAmount = 0;
        pos.repaid = true;

        // Convert LSRWA to USDC off-chain (not in contract)
        emit CollateralLiquidated(originator, seized);
    }
}
