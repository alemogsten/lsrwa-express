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
    uint256 public rewardAPR;
    uint256 public maxEpochsBeforeLiquidation;

    // --- Mappings ---
    mapping(uint256 => DepositRequest) public depositRequests;
    mapping(uint256 => WithdrawRequest) public withdrawRequests;
    mapping(uint256 => ApprovedRequest) public approvedRequestQueue;
    mapping(uint256 => Epoch) public epochs;
    mapping(address => uint256) public activeDeposits;
    mapping(address => BorrowRequest) public borrowRequests;
    mapping(address => uint256) public collateralDeposits;
    mapping(address => uint256) public unclaimedRewards;
    mapping(address => bool) public isActiveUser;
    mapping(address => bool) public isBorrower;

    uint256 public approvedRequestStart;
    uint256 public approvedRequestEnd;

    address[] public activeUserList;
    address[] public borrowerList;
    
    uint256 public poolUSDC; // available liquidity
    uint256 public borrowingUSDC;
    uint256 public poolLSRWA;

    uint256 public collateralRatio;

    uint256 public depositCounter;
    uint256 public withdrawCounter;
    uint256 public epochCounter;
    uint256 public borrowCounter;
    uint256 public currentEpochId;

    uint256 public repaymentRequiredEpochId;

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
        uint256 amount;   // USDC
        uint256 epochStart;
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
    event BorrowExecuted(address indexed originator, uint256 seizedAmount);
    event CollateralLiquidated(uint256 seizedAmount);
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
        collateralDeposits[msg.sender] += amount;
        poolLSRWA += amount;
        
        emit CollateralDeposited(msg.sender, amount);
    }

    function requestBorrow(uint256 amount) external {
        BorrowRequest storage pos = borrowRequests[msg.sender];
        require(pos.amount == 0, "Already borrowed");

        pos.amount = amount;

        if (!isBorrower[msg.sender]) {
            isBorrower[msg.sender] = true;
            borrowerList.push(msg.sender);
        }

        emit BorrowRequested(msg.sender, amount);
    }

    function repayBorrow() external {
        BorrowRequest storage pos = borrowRequests[msg.sender];
        require(pos.amount > 0 && !pos.repaid, "Nothing to repay");
        usdc.safeTransferFrom(msg.sender, address(this), pos.amount);
        borrowingUSDC -= pos.amount;
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

        uint256 totalActiveDeposits;
        uint256 totalWithdrawals;

        poolUSDC = usdc.balanceOf(address(this));

        // Process approved deposit/withdraw
        for (uint256 i = approvedRequestStart; i < approvedRequestEnd; i++) {
            ApprovedRequest memory req = approvedRequestQueue[i];

            if (req.isWithdraw) {
                WithdrawRequest storage wReq = withdrawRequests[req.requestId];
                require(!wReq.processed, "Already processed");

                if (poolUSDC >= req.amount) {
                    usdc.safeTransfer(req.user, req.amount);
                    activeDeposits[req.user] -= req.amount;
                    poolUSDC -= req.amount;
                    totalWithdrawals += req.amount;
                    wReq.processed = true;
                    emit WithdrawApproved(req.requestId, req.user, req.amount);
                } else {
                    if (poolUSDC > 0) {
                        // Partial fill
                        uint256 partialAmount = poolUSDC;
                        usdc.safeTransfer(req.user, partialAmount);
                        activeDeposits[req.user] -= partialAmount;
                        poolUSDC = 0;
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

                    repaymentRequiredEpochId = currentEpochId;
                }
            } else {
                if (!isActiveUser[req.user]) {
                    isActiveUser[req.user] = true;
                    activeUserList.push(req.user);
                }
                activeDeposits[req.user] += req.amount;
                totalActiveDeposits += req.amount;
                poolUSDC += req.amount;
                emit DepositApproved(req.requestId, req.user, req.amount);
            }

            delete approvedRequestQueue[i];
        }

        // Borrowing
        for (uint256 i = 1; i <= borrowerList.length; i++) {
            address borrower = borrowerList[i];
            BorrowRequest storage bReq = borrowRequests[borrower];
            if (!bReq.repaid) {
                uint256 collateralValue = collateralDeposits[borrower];
                if (poolUSDC >= bReq.amount && collateralValue * 100 / bReq.amount >= collateralRatio) {
                    poolUSDC -= bReq.amount;
                    usdc.safeTransfer(borrower, bReq.amount);
                    borrowingUSDC += bReq.amount;
                    bReq.epochStart = currentEpochId;
                    emit BorrowExecuted(borrower, bReq.amount);
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
        }

        // if (repaymentRequiredEpochId != 0 && currentEpochId > repaymentRequiredEpochId + maxEpochsBeforeLiquidation) {
        //     liquidateCollateral();
        // }

        currentEpoch = Epoch({
            startBlock: currentEpochId == 0 ? block.number : currentEpoch.endBlock + 1,
            endBlock: currentEpochId == 0 ? block.number + epochDuration : currentEpoch.endBlock + 1 + epochDuration,
            totalDeposits: totalActiveDeposits,
            totalWithdrawals: totalWithdrawals,
            rewardsDistributed: epochReward,
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

    function setCollateralRatio(uint256 ratio) external onlyAdmin {
        collateralRatio = ratio;
    }

    function repaymentRequired() external onlyAdmin {
        repaymentRequiredEpochId = currentEpochId;
    }

    function liquidateCollateral(address outAddress) external onlyAdmin {
        uint256 liquidateLSRWA;
        for (uint256 i = 1; i <= borrowerList.length; i++) {
            address borrower = borrowerList[i];
            BorrowRequest storage pos = borrowRequests[borrower];
            require(!pos.repaid, "Not eligible");

            uint256 seized = collateralDeposits[borrower];
            pos.repaid = true;
            liquidateLSRWA += seized;
            poolLSRWA -= seized;
            borrowingUSDC -= pos.amount;
        }

        // Withdraw LSRWA to outAddress and convert LSRWA to USDC off-chain and send USDC here again (it's not in contract)
        lsrwa.safeTransfer(outAddress, liquidateLSRWA);
        repaymentRequiredEpochId = 0;
        
        emit CollateralLiquidated(liquidateLSRWA);
    }
}
