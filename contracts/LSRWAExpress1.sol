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
    mapping(uint256 => Epoch) public epochs;
    
    uint256 public poolUSDC; // available liquidity
    uint256 public poolLSRWA;

    uint256 public currentUSDC;
    uint256 public currentLSRWA;
    uint256 public currentCollaterals;

    uint256 public depositCounter;
    uint256 public withdrawCounter;
    uint256 public epochCounter;

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
        bool fulfilled;
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

    struct ApprovedRequest {
        address user;
        uint256 requestId;
        uint256 amount;
        uint256 timestamp;
        bool isWithdraw;
    }


    // --- Events ---
    event DepositRequested(uint256 requestId, address user, uint256 amount, uint256 timestamp);
    event WithdrawRequested(uint256 requestId, address user, uint256 amount, uint256 timestamp);
    event DepositApproved(uint256 requestId, address user, uint256 amount);
    event WithdrawApproved(uint256 requestId, address user, uint256 amount);
    event PartialWithdrawalFilled(uint256 requestId, address user, uint256 amount, uint256 timestamp);
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
        poolUSDC = 0;
        poolLSRWA = 0;
        
        currentEpoch = block.number / epochDuration + 1; // current 5 week period
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
        require(req.user == msg.sender && req.processed, "Not authorized");
        require(req.amount > 0 && activeDeposits[msg.sender] >= req.amount, "Invalid amount");

        activeDeposits[msg.sender] -= req.amount;
        usdc.safeTransfer(req.user, req.amount);
        emit WithdrawExecuted(requestId, req.user, req.amount);
    }

    function claimRewards() external {
        // TODO: Track and distribute yield rewards
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
        require(pos.borrowedAmount == 0, "Already borrowed");

        pos.borrowedAmount = amount;
        pos.startEpoch = currentEpoch;
        usdc.safeTransfer(msg.sender, amount);
        emit BorrowRequested(msg.sender, amount);
    }

    function repayBorrow(uint256 amount) external {
        BorrowRequest storage pos = borrowRequests[msg.sender];
        require(pos.borrowedAmount > 0 && !pos.repaid, "Nothing to repay");
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        pos.repaid = true;
    }

    // --- Admin ---
    function processRequests(ApprovedRequest[] calldata requests) external onlyAdmin {
        for (uint256 i = 0; i < requests.length; i++) {
            ApprovedRequest calldata req = requests[i];

            if (req.isWithdraw) {
                WithdrawRequest storage wReq = withdrawRequests[req.requestId];
                require(!wReq.processed, "Already processed");

                // Transfer the approved amount
                usdc.safeTransfer(req.user, req.amount);
                activeDeposits[req.user] -= req.amount;

                if (req.amount < wReq.amount) {
                    // Partial fill — re-emit event with remaining
                    uint256 remaining = wReq.amount - req.amount;
                    withdrawCounter++;
                    withdrawRequests[withdrawCounter] = WithdrawRequest(
                        req.user, remaining, req.timestamp, false, false
                    );
                    emit WithdrawRequested(withdrawCounter, req.user, remaining, req.timestamp);
                }

                wReq.processed = true;
                emit WithdrawApproved(req.requestId, req.user, req.amount);
            } else {
                DepositRequest storage dReq = depositRequests[req.requestId];
                require(!dReq.processed, "Already processed");
                dReq.processed = true;
                activeDeposits[dReq.user] += req.amount;
                emit DepositApproved(req.requestId, dReq.user, req.amount);
            }
        }

        // emit BatchProcessed(block.timestamp, requests.length);
    }
    function processEpoch() external onlyAdmin {
        Epoch storage lastEpoch = epochs[epochCounter];
        require(block.number >= lastEpoch.endBlock, "Epoch not ended");

        epochCounter++;
        uint256 startBlock = block.number;
        uint256 endBlock = startBlock + epochDuration;

        // Record stats
        epochs[epochCounter] = Epoch({
            startBlock: startBlock,
            endBlock: endBlock,
            totalDeposits: 0,           // Will update in processRequests
            totalWithdrawals: 0,        // Will update in processRequests
            rewardsDistributed: 0,      // Optional
            aprBps: rewardAPR
        });

        emit EpochProcessed(epochCounter, startBlock, endBlock);
    }

    // function processEpoch() external onlyAdmin {
    //     Epoch storage lastEpoch = epochs[epochCounter];
    //     require(block.number >= lastEpoch.endBlock, "Epoch not ended");

    //     epochCounter++;
    //     uint256 startBlock = block.number;
    //     uint256 endBlock = startBlock + epochDuration;
    //     uint256 totalWithdrawals = 0;
    //     uint256 totalDeposits = 0;
    //     uint256 remainingLiquidity = poolUSDC;

    //     // Step 1: Process Withdrawals (FIFO with partial fills)
    //     for (uint256 i = 1; i <= withdrawCounter; i++) {
    //         WithdrawRequest storage req = withdrawRequests[i];

    //         if (!req.processed && activeDeposits[req.user] >= req.amount) {
    //             if (remainingLiquidity >= req.amount) {
    //                 // Full fill
    //                 req.processed = true;
    //                 req.fulfilled = true;
    //                 totalWithdrawals += req.amount;
    //                 remainingLiquidity -= req.amount;

    //                 emit WithdrawApproved(i, req.user, req.amount);
    //             } else if (remainingLiquidity > 0) {
    //                 // Partial fill
    //                 uint256 partialAmount = remainingLiquidity;

    //                 // Emit event with backdated timestamp
    //                 emit PartialWithdrawalFilled(i, req.user, partialAmount, req.timestamp);

    //                 // Update the original request
    //                 req.amount -= partialAmount;
    //                 remainingLiquidity = 0;
    //                 totalWithdrawals += partialAmount;
    //             }

    //             if (remainingLiquidity == 0) {
    //                 break; // No funds left, break early
    //             }
    //         }
    //     }

    //     // Step 2: Process Deposits
    //     for (uint256 j = 1; j <= depositCounter; j++) {
    //         DepositRequest storage dep = depositRequests[j];

    //         if (!dep.processed) {
    //             dep.processed = true;
    //             activeDeposits[dep.user] += dep.amount;
    //             totalDeposits += dep.amount;
    //             remainingLiquidity += dep.amount;

    //             emit DepositApproved(j, dep.user, dep.amount);
    //         }
    //     }

    //     // Update available pool
    //     poolUSDC = remainingLiquidity;

    //     // Step 3: Record Epoch Stats
    //     epochs[epochCounter] = Epoch({
    //         startBlock: startBlock,
    //         endBlock: endBlock,
    //         totalDeposits: totalDeposits,
    //         totalWithdrawals: totalWithdrawals,
    //         rewardsDistributed: 0,
    //         aprBps: rewardAPR
    //     });

    //     currentEpoch = epochCounter;

    //     emit EpochProcessed(epochCounter, totalDeposits, totalWithdrawals);
    // }


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
        require(!pos.repaid && currentEpoch > pos.startEpoch + maxEpochsBeforeLiquidation, "Not eligible");

        uint256 seized = pos.collateralAmount;
        pos.collateralAmount = 0;
        pos.repaid = true;

        // Convert LSRWA to USDC off-chain (not in contract)
        emit CollateralLiquidated(originator, seized);
    }
}
