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
    mapping(uint256 => Epoch) public epochs;
    mapping(address => UserInfo) public users;
    mapping(address => BorrowRequest) public borrowRequests;
    mapping(address => uint256) public collateralDeposits;
    
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

    uint256 public blocksPerYear;

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

    struct UserInfo {
        uint256 deposit;
        uint256 reward;
        bool autoCompound;
        uint256 lastHarvestBlock;
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
    event RewardHarvested(address indexed sender, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _usdc, address _lsrwa) {
        admin = msg.sender;
        usdc = IERC20(_usdc);
        lsrwa = IERC20(_lsrwa);
        epochDuration = 40320; // ~1 week in blocks
        maxEpochsBeforeLiquidation = 2;
        currentEpochId = 1;
        rewardAPR = 500; // 5% APR
        blocksPerYear = 2_300_000;
    }

    function requestDeposit(uint256 amount) external returns (uint256 requestId) {
        require(amount > 0, "Zero amount");
        
        _forceHarvest(msg.sender);

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
        require(amount > 0, "Invalid amount");
        require(users[msg.sender].deposit >= amount, "Insufficient deposit balance");

        _forceHarvest(msg.sender);

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
        // require(users[msg.sender].deposit >= req.amount, "Insufficient balance");

        req.executed = true;
        usdc.safeTransfer(req.user, req.amount);

        emit WithdrawExecuted(requestId, req.user, req.amount);
    }

    function compound() external {
        uint256 reward = users[msg.sender].reward;
        require(reward > 0, "Nothing to compund");

        users[msg.sender].deposit += reward;
        users[msg.sender].reward = 0;

    }

    function harvestReward() external {
        uint256 reward = users[msg.sender].reward;
        require(reward > 0, "Nothing to harvest");

        _forceHarvest(msg.sender);

        emit RewardHarvested(msg.sender, reward);
    }

    function _forceHarvest(address userAddr) internal {
        uint256 reward = users[userAddr].reward;
        if(reward > 0) {
            usdc.safeTransfer(userAddr, reward);
            users[userAddr].reward = 0;
        }

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
        require(!pos.repaid, "Already borrowed");
        require(collateralDeposits[msg.sender] * 100 / amount >= collateralRatio, 'Insufficient collateral value');

        pos.amount = amount;
        pos.repaid = false;
        pos.epochStart = 0;

        emit BorrowRequested(msg.sender, amount);
    }

    function repayBorrow() external {
        BorrowRequest storage pos = borrowRequests[msg.sender];
        require(pos.amount > 0, "Nothing to repay");
        require(!pos.repaid, "Repaid already");

        usdc.safeTransferFrom(msg.sender, address(this), pos.amount);
        borrowingUSDC -= pos.amount;
        poolUSDC += pos.amount;
        pos.repaid = true;
    }

    // --- Admin ---

    function processRequests(ApprovedRequest[] calldata requests, address[] calldata unpaidBorrowerList, address[] calldata activeUserList) external onlyAdmin {
        // require(block.number > currentEpoch.endBlock, "Epoch not ended");

        uint256 totalActiveDeposits;
        uint256 totalWithdrawals;

        // Process approved deposit/withdraw
        for (uint256 i = 0; i < requests.length; i++) {
            ApprovedRequest memory req = requests[i];

            if (req.isWithdraw) {
                WithdrawRequest storage wReq = withdrawRequests[req.requestId];
                // if(wReq.processed) continue;
                if(users[req.user].deposit < req.amount) continue;
                
                if(wReq.amount > req.amount) {
                    
                    uint256 remaining = wReq.amount - req.amount;
                    wReq.amount = req.amount;
                    withdrawCounter++;
                    withdrawRequests[withdrawCounter] = WithdrawRequest(
                        req.user, remaining, req.timestamp, false, false
                    );
                    emit WithdrawRequested(withdrawCounter, req.user, remaining, req.timestamp);
                }
                
                users[req.user].deposit -= req.amount;
                
                wReq.processed = true;
                
                totalWithdrawals += req.amount;

                emit WithdrawApproved(req.requestId, req.user, req.amount);
                
                    // repaymentRequiredEpochId = currentEpochId; // enable when needed
                
            } else {
                DepositRequest storage dReq = depositRequests[req.requestId];
                
                if(dReq.processed) continue;

                users[req.user].deposit += req.amount;
                totalActiveDeposits += req.amount;
                poolUSDC += req.amount;
                emit DepositApproved(req.requestId, req.user, req.amount);
            }
        }

        // Borrowing
        for (uint256 i = 0; i < unpaidBorrowerList.length; i++) {
            address borrower = unpaidBorrowerList[i];
            BorrowRequest storage bReq = borrowRequests[borrower];
            if (!bReq.repaid && bReq.epochStart == 0 && poolUSDC >= bReq.amount) {
                usdc.safeTransfer(borrower, bReq.amount);
                poolUSDC -= bReq.amount;
                borrowingUSDC += bReq.amount;
                bReq.epochStart = currentEpochId;
                emit BorrowExecuted(borrower, bReq.amount);
            }
        }

        // Rewards
        uint256 reward;
        for (uint256 i = 0; i < activeUserList.length; i++) {
            address user = activeUserList[i];
            UserInfo storage u = users[user];
            if (u.deposit == 0) continue;

            uint256 blocks = epochDuration;
            reward = (u.deposit * rewardAPR * blocks) / (blocksPerYear * BPS_DIVISOR);

            if (reward > 0) {
                if (u.autoCompound) {
                    u.deposit += reward;
                    totalActiveDeposits += reward;
                } else {
                    u.reward += reward;
                }
                poolUSDC -= reward;
                u.lastHarvestBlock = block.number;
            }
        }

        currentEpoch = Epoch({
            startBlock: (currentEpochId == 1 || block.number < currentEpoch.endBlock) ? block.number : currentEpoch.endBlock + 1,
            endBlock: (currentEpochId == 1 || block.number < currentEpoch.endBlock) ? block.number + epochDuration : currentEpoch.endBlock + 1 + epochDuration,
            totalDeposits: totalActiveDeposits,
            totalWithdrawals: totalWithdrawals,
            rewardsDistributed: reward,
            aprBps: rewardAPR
        });

        epochs[currentEpochId] = currentEpoch;

        emit EpochProcessed(currentEpochId, totalActiveDeposits, totalWithdrawals);

        // Move pointer forward
        currentEpochId++;
    }

    function setRewardAPR(uint256 aprBps) external onlyAdmin {
        rewardAPR = aprBps;
    }

    function setAutoCompound(bool status) external {
        users[msg.sender].autoCompound = status;
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

    function toupUSDC(uint256 amount) external onlyAdmin {
        poolUSDC += amount;
    }

    function repaymentRequired() external onlyAdmin {
        repaymentRequiredEpochId = currentEpochId;
    }

    function liquidateCollateral(address outAddress, address[] calldata unpaidBorrowerList) external onlyAdmin {
        uint256 liquidateLSRWA;
        for (uint256 i = 0; i < unpaidBorrowerList.length; i++) {
            address borrower = unpaidBorrowerList[i];
            BorrowRequest storage pos = borrowRequests[borrower];

            uint256 seized = collateralDeposits[borrower];
            pos.repaid = true;
            liquidateLSRWA += seized;
            
            // borrowingUSDC -= pos.amount;
        }

        // Withdraw LSRWA to outAddress and convert LSRWA to USDC off-chain and send USDC here again (it's not in contract)
        borrowingUSDC = 0;
        poolLSRWA -= liquidateLSRWA;
        lsrwa.safeTransfer(outAddress, liquidateLSRWA);
        repaymentRequiredEpochId = 0;

        emit CollateralLiquidated(liquidateLSRWA);
    }
}
