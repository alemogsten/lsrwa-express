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

    // --- Mappings ---
    mapping(uint256 => DepositRequest) public depositRequests;
    mapping(uint256 => WithdrawRequest) public withdrawRequests;
    mapping(address => BorrowRequest) public borrowRequests;
    mapping(address => uint256) public collateralDeposits;

    uint256 public borrowingUSDC;
    uint256 public poolLSRWA;

    uint256 public collateralRatio;

    uint256 public depositCounter;
    uint256 public withdrawCounter;
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
        // uint256 endBlock;
        // uint256 totalDeposits;
        // uint256 totalWithdrawals;
        // uint256 rewardsDistributed;
        // uint256 aprBps;
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
    event DepositApproved(uint256 requestId, address indexed user);
    event DepositCancelled(uint256 requestId, address indexed user);
    event WithdrawRequested(uint256 requestId, address indexed user, uint256 amount, uint256 timestamp);
    event WithdrawApproved(uint256 requestId, address indexed user, uint256 amount);
    event WithdrawExecuted(uint256 requestId, address indexed user, uint256 amount);
    event CollateralDeposited(address indexed originator, uint256 amount);
    event BorrowRequested(address indexed originator, uint256 amount);
    event BorrowExecuted(address indexed originator, uint256 seizedAmount, uint256 epochStart);
    event BorrowRepaid(address indexed originator);
    event CollateralLiquidated(address borrower, uint256 seizedAmount);
    event RewardHarvested(address indexed sender, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _usdc, address _lsrwa) {
        admin = msg.sender;
        usdc = IERC20(_usdc);
        lsrwa = IERC20(_lsrwa);
        currentEpochId = 1;
    }

    function requestDeposit(uint256 amount) external returns (uint256 requestId) {
        require(amount > 0, "Zero amount");
        
        // _forceHarvest(msg.sender);

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
        // require(users[msg.sender].deposit >= amount, "Insufficient deposit balance");

        // _forceHarvest(msg.sender);

        requestId = ++withdrawCounter;
        withdrawRequests[requestId] = WithdrawRequest(msg.sender, amount, block.timestamp, false, false);
        emit WithdrawRequested(requestId, msg.sender, amount, block.timestamp);
    }

    function cancelDepositRequest(uint256 requestId) external {
        DepositRequest storage req = depositRequests[requestId];
        require(req.user == msg.sender, "Not request owner");
        require(!req.processed, "Already processed");

        usdc.safeTransfer(req.user, req.amount);
        req.processed = true;
        // delete depositRequests[requestId];
        
        emit DepositCancelled(requestId, req.user);
    }

    // executeWithdraw for deposit cancel after approval
   function executeWithdraw(uint256 requestId) external {
        WithdrawRequest storage req = withdrawRequests[requestId];
        
        require(req.user == msg.sender, "Not authorized");
        require(req.processed, "Not approved yet");
        require(!req.executed, "Already executed");
        require(req.amount > 0, "Invalid amount");

        usdc.safeTransfer(req.user, req.amount);

        req.executed = true;

        emit WithdrawExecuted(requestId, req.user, req.amount);
    }

    function harvestReward(address userAddr, uint256 reward) external {
        require(reward > 0, "Nothing to harvest");

        usdc.safeTransfer(userAddr, reward);

        emit RewardHarvested(userAddr, reward);
    }

    // function _forceHarvest(address userAddr) internal {
    //     // _forceHarvest(userAddr, false);
    //     uint256 reward = users[userAddr].reward;
    //     // require(reward > 0, "Nothing to harvest");
    //     if(reward > 0) {
    //         usdc.safeTransfer(userAddr, reward);
    //         // users[userAddr].reward = 0;
    //     }

    //     // emit RewardHarvested(userAddr, reward);
    // }

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
        pos.repaid = true;
        emit BorrowRepaid(msg.sender);
    }

    // --- Admin ---

    function processRequests(ApprovedRequest[] calldata requests, address[] calldata borrowList) external onlyAdmin {
        for (uint256 i = 0; i < requests.length; i++) {
            ApprovedRequest memory req = requests[i];
            if(req.isWithdraw) {
                WithdrawRequest storage wReq = withdrawRequests[req.requestId];
                if(wReq.amount > req.amount) {
                    // process partial withdraw
                    uint256 remain = wReq.amount - req.amount;
                    wReq.amount = req.amount;

                    // create new request for remain balance
                    withdrawCounter++;
                    withdrawRequests[withdrawCounter] = WithdrawRequest(
                        req.user, remain, req.timestamp, false, false
                    );
                    emit WithdrawRequested(withdrawCounter, req.user, remain, req.timestamp);
                }
                wReq.processed = true;
                emit WithdrawApproved(req.requestId, req.user, req.amount);
            } else {
                DepositRequest storage dReq = depositRequests[req.requestId];
                dReq.processed = true;
                emit DepositApproved(req.requestId, req.user);
            }
        }

        // process borrow
        for (uint256 i = 0; i < borrowList.length; i++) {
            address borrower = borrowList[i];
            BorrowRequest storage bReq = borrowRequests[borrower];
            usdc.safeTransfer(borrower, bReq.amount);
            borrowingUSDC += bReq.amount;
            bReq.epochStart = currentEpochId;
            emit BorrowExecuted(borrower, bReq.amount, currentEpochId);
        }
        currentEpochId++;

        // currentEpoch = Epoch({
        //     startBlock: (currentEpochId == 1 || block.number < currentEpoch.endBlock) ? block.number : currentEpoch.endBlock + 1
        //     endBlock: (currentEpochId == 1 || block.number < currentEpoch.endBlock) ? block.number + epochDuration : currentEpoch.endBlock + 1 + epochDuration
        // });
        currentEpoch = Epoch({
            startBlock: block.number
        });
    }

    function setCollateralRatio(uint256 ratio) external onlyAdmin {
        collateralRatio = ratio;
    }

    function repaymentRequired() external onlyAdmin {
        repaymentRequiredEpochId = currentEpochId;
    }

    function liquidateCollateral(address outAddress, address[] calldata unPaidBorrowerList) external onlyAdmin {
        uint256 liquidateLSRWA;
        for (uint256 i = 0; i < unPaidBorrowerList.length; i++) {
            address borrower = unPaidBorrowerList[i];
            BorrowRequest storage pos = borrowRequests[borrower];
            // if(pos.repaid) continue;

            uint256 seized = collateralDeposits[borrower];
            pos.repaid = true;
            collateralDeposits[borrower] = 0;
            liquidateLSRWA += seized;
            // borrowingUSDC -= pos.amount;
            emit CollateralLiquidated(borrower, seized);
        }

        // Withdraw LSRWA to outAddress and convert LSRWA to USDC off-chain and send USDC here again (it's not in contract)
        lsrwa.safeTransfer(outAddress, liquidateLSRWA);
        poolLSRWA -= liquidateLSRWA;
        borrowingUSDC = 0;
        repaymentRequiredEpochId = 0;

    }
}
