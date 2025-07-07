// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract LSRWAExpress {
    using SafeERC20 for IERC20;
    // --- Tokens ---
    IERC20 public immutable usdc;
    IERC20 public immutable lsrwa;

    address public admin;

    // --- Constants ---
    uint256 public constant BPS_DIVISOR = 10000;
    uint256 public blocksPerYear= 2_300_000;

    // --- State Variables ---
    
    uint256 public epochDuration= 40320; // in blocks
    uint256 public rewardAPR= 500;
    uint256 public maxEpochsBeforeLiquidation= 2;
    uint256 public collateralRatio;

    // --- Mappings ---
    mapping(uint256 => Request) public requests;
    mapping(address => UserInfo) public users;
    mapping(address => BorrowRequest) public borrowRequests;
    mapping(address => uint256) public collateralDeposits;
    
    uint256 public borrowingUSDC;
    uint256 public poolLSRWA;

    uint256 public requestCounter;
    uint256 public epochCounter;
    uint256 public currentEpochId= 1;
    uint256 public repaymentRequiredEpochId;

    Epoch public currentEpoch;

    // --- Structs ---

    struct Request {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool isWithdraw;
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
    }

    function requestDeposit(uint256 amount) external returns (uint256 requestId) {
        require(amount > 0, "Zero amount");
        
        _forceHarvest(msg.sender);

        usdc.safeTransferFrom(            
            msg.sender,
            address(this),
            amount // uint256 _value
        );

        requestId = requestCounter++;
        requests[requestId] = Request(msg.sender, amount, block.timestamp, false, false, false);

        emit DepositRequested(requestId, msg.sender, amount, block.timestamp);
    }

    function requestWithdraw(uint256 amount) external returns (uint256 requestId) {
        require(amount > 0, "Invalid amount");
        require(users[msg.sender].deposit >= amount, "Insufficient deposit balance");

        _forceHarvest(msg.sender);

        requestId = requestCounter++;
        requests[requestId] = Request(msg.sender, amount, block.timestamp, true, false, false);
        emit WithdrawRequested(requestId, msg.sender, amount, block.timestamp);
    }

    function cancelDepositRequest(uint256 requestId) external {
        Request storage req = requests[requestId];
        require(!req.isWithdraw, "Not deposit");
        require(!req.processed, "Already processed");
        require(!req.executed, "Already cancelled");
        require(req.user == msg.sender, "Not request owner");

        usdc.safeTransfer(req.user, req.amount);
        req.processed = true;
        req.executed = true;
        
        emit DepositCancelled(requestId, req.user);
    }

    // executeWithdraw for deposit cancel after approval
   function executeWithdraw(uint256 requestId) external {
        Request storage req = requests[requestId];
        
        require(req.user == msg.sender, "Not authorized");
        require(req.isWithdraw, "Not withdraw");
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
        require(pos.epochStart != 0 && !pos.repaid, "Already borrowed");
        require(collateralDeposits[msg.sender] > 0, "No cllateral deposits");
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
        pos.epochStart = 0;
    }

    // --- Admin ---

    function processRequests(ApprovedRequest[] calldata arequests, address[] calldata unpaidBorrowerList, address[] calldata activeUserList) external onlyAdmin {
        // require(block.number > currentEpoch.endBlock, "Epoch not ended");

        uint256 totalActiveDeposits;
        uint256 totalWithdrawals;

        // Process approved deposit/withdraw
        for (uint256 i = 0; i < arequests.length; i++) {
            ApprovedRequest memory req = arequests[i];

            if (req.isWithdraw) {
                Request storage wReq = requests[req.requestId];
                // if(wReq.processed) continue;
                if(users[req.user].deposit < req.amount) continue;
                
                if(wReq.amount > req.amount) {
                    
                    uint256 remaining = wReq.amount - req.amount;
                    wReq.amount = req.amount;
                    requests[requestCounter] = Request(
                        req.user, remaining, req.timestamp, true, false, false
                    );
                    requestCounter++;
                    emit WithdrawRequested(requestCounter, req.user, remaining, req.timestamp);
                }
                
                users[req.user].deposit -= req.amount;
                
                wReq.processed = true;
                
                totalWithdrawals += req.amount;

                emit WithdrawApproved(req.requestId, req.user, req.amount);
                
                    // repaymentRequiredEpochId = currentEpochId; // enable when needed
                
            } else {
                Request storage dReq = requests[req.requestId];
                
                // if(dReq.processed) continue;

                users[req.user].deposit += req.amount;
                totalActiveDeposits += req.amount;
                dReq.processed = true;
                
                emit DepositApproved(req.requestId, req.user, req.amount);
            }
        }

        // Borrowing
        for (uint256 i = 0; i < unpaidBorrowerList.length; i++) {
            address borrower = unpaidBorrowerList[i];
            BorrowRequest storage bReq = borrowRequests[borrower];
            usdc.safeTransfer(borrower, bReq.amount);
            borrowingUSDC += bReq.amount;
            bReq.epochStart = currentEpochId;
            emit BorrowExecuted(borrower, bReq.amount);
        }

        // Rewards
        uint256 reward;
        for (uint256 i = 0; i < activeUserList.length; i++) {
            address user = activeUserList[i];
            UserInfo storage u = users[user];

            uint256 blocks = epochDuration;
            reward = (u.deposit * rewardAPR * blocks) / (blocksPerYear * BPS_DIVISOR);

            if (reward > 0) {
                if (u.autoCompound) {
                    u.deposit += reward;
                    totalActiveDeposits += reward;
                } else {
                    u.reward += reward;
                }
                
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

        // epochs[currentEpochId] = currentEpoch;

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

    function repaymentRequired() external onlyAdmin {
        repaymentRequiredEpochId = currentEpochId;
    }

    function liquidateCollateral(address outAddress, address[] calldata unpaidBorrowerList) external onlyAdmin {
        uint256 liquidateLSRWA;
        for (uint256 i = 0; i < unpaidBorrowerList.length; i++) {
            address borrower = unpaidBorrowerList[i];
            BorrowRequest storage pos = borrowRequests[borrower];

            if(pos.repaid) continue;

            uint256 seized = collateralDeposits[borrower];
            pos.repaid = true;
            pos.epochStart = 0;
            liquidateLSRWA += seized;
            collateralDeposits[borrower] = 0;
            
            // borrowingUSDC -= pos.amount;
        }

        // Withdraw LSRWA to outAddress and convert LSRWA to USDC off-chain and send USDC here again (it's not in contract)
        borrowingUSDC = 0;
        poolLSRWA -= liquidateLSRWA;
        lsrwa.safeTransfer(outAddress, liquidateLSRWA);
        repaymentRequiredEpochId = 0;

        emit CollateralLiquidated(liquidateLSRWA);
    }

    function getRequests(uint kind, bool processed, uint page, uint limit, address owner, bool isAdmin)
        external
        view
        returns (Request[] memory, uint[] memory, uint)
    {
        
        Request[] memory temp = new Request[](requestCounter);
        uint[] memory tempIds = new uint[](requestCounter);

        uint j = 0;
        uint counter = 0;
        if(page == 0) {
            for (uint i = 0; i < requestCounter; i++) {
                Request storage req = requests[i];
                if(processed != req.processed || (!req.isWithdraw && req.executed) || (!isAdmin && owner != req.user)) {
                    continue;
                }
                temp[counter] = req;
                tempIds[counter] = i;
                counter++;
            }
        }
        else {
            for (uint i = 0; i < requestCounter; i++) {
                Request storage req = requests[i];
                if((isAdmin && processed != req.processed) || (!isAdmin && owner != req.user)) {
                    continue;
                }
                if(kind == 1 && req.isWithdraw) continue ;
                if(kind == 2 && !req.isWithdraw) continue ;
                temp[counter] = req;
                tempIds[counter] = i;
                counter++;
            }
        }
        Request[] memory trequests = new Request[](counter);
        uint[] memory ids = new uint[](counter);
        if(page == 0) {
            for (uint i = 0; i < counter; i++) {
                Request memory req = temp[i];
                trequests[j] = req;
                ids[j] = tempIds[i];
                j++;
            }
        }
        else {
            // pagination
            page = page - 1;
            uint end = counter > page * limit ? counter - (page * limit) : 0;
            uint start = end >= limit ? end - limit : 0;

            trequests = new Request[](end-start);

            for (uint i = end; i > start; i--) {
                Request memory req = temp[i-1];
                trequests[j] = req;
                ids[j] = tempIds[i-1];
                j++;
            }
        }

        return (trequests, ids, counter);
    }

    function getBorrowRequests(address[] calldata borrowers) onlyAdmin
        external
        view
        returns (BorrowRequest[] memory)
    {
        BorrowRequest[] memory borrows = new BorrowRequest[](borrowers.length);
        for (uint i = 0; i < borrowers.length; i++) {
            BorrowRequest storage req = borrowRequests[borrowers[i]];
            borrows[i] = req;
        }

        return borrows;
    }

    function getUnpaidBorrowList(address[] calldata borrowers, bool pending) onlyAdmin
        external
        view
        returns (BorrowRequest[] memory filters, address[] memory filters1)
    {
        uint j = 0;
        BorrowRequest[] memory temp = new BorrowRequest[](borrowers.length);
        address[] memory temp1 = new address[](borrowers.length);
        for (uint i = 0; i < borrowers.length; i++) {
            BorrowRequest storage req = borrowRequests[borrowers[i]];
            if(pending && !req.repaid && req.epochStart == 0 || !pending && !req.repaid && req.epochStart != 0) {
                temp[j] = req;
                temp1[j] = borrowers[i];
                j++;
            }
        }
        filters = new BorrowRequest[](j);
        filters1 = new address[](j);
        for (uint i = 0; i < j; i++) {
            filters[i] = temp[i];
            filters1[i] = temp1[i];
        }

        return (filters, filters1);
    }

    function getActiveUserList(address[] calldata tusers) onlyAdmin
        external
        view
        returns (address[] memory filters)
    {
        uint j = 0;
        address[] memory temp = new address[](tusers.length);
        for (uint i = 0; i < tusers.length; i++) {
            UserInfo storage user = users[tusers[i]];
            if(user.deposit > 0) {
                temp[j] = tusers[i];
                j++;
            }
        }
        filters = new address[](j);
        for (uint i = 0; i < j; i++) {
            filters[i] = temp[i];
        }

        return filters;
    }
}
