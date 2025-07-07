// app/api/admin/process-requests/route.js
import { NextResponse } from "next/server";
import { ethers, parseUnits, formatUnits } from "ethers";
import vaultAbi from "@/abis/Vault.json";
import usdcAbi from "@/abis/ERC20.json";

export async function POST() {
  try {

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);

    const usdc = new ethers.Contract(process.env.NEXT_PUBLIC_USDC_ADDRESS, usdcAbi, provider);
    const poolUSDC = await usdc.balanceOf(process.env.NEXT_PUBLIC_VAULT_ADDRESS);

    let liquidityRemaining = poolUSDC;
    // uint kind[all, deposit, withdraw], bool processed, uint page, uint limit, address owner, bool isAdmin
    const [data, ids, total] = await vault.getRequests(0, false, 0, 0, process.env.NEXT_PUBLIC_VAULT_ADDRESS, true);
    console.log('data', data);
    let requests = [];
    let approvedRequests = [];

    requests = data.map((item, index) => ({
      user: item[0], 
      requestId: parseInt(ids[index]),
      amount: formatUnits(item[1], parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)),
      timestamp: item[2],
      isWithdraw: item[3],
    }));

    let withdrawRequests = requests.filter(item => item.isWithdraw);

    for (const item of withdrawRequests) {
      const { requestId, user, amount, timestamp } = item;
      let parsedAmount = parseUnits(amount.toString(), parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS));
      const approvedAmount = liquidityRemaining >= parsedAmount ? parsedAmount : liquidityRemaining;
      liquidityRemaining -= approvedAmount;

      approvedRequests.push({
        user,
        requestId,
        // amount: parseUnits(approvedAmount.toString(), parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)),
        amount: approvedAmount,
        timestamp,
        isWithdraw: true,
      });

      if (liquidityRemaining === 0n) break;
    }
    let depositRequests = requests.filter(item => !item.isWithdraw);

    for (const item of depositRequests) {
      const { requestId, user, amount, timestamp } = item;
      approvedRequests.push({
        user,
        requestId,
        amount: parseUnits(amount.toString(), parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)),
        timestamp,
        isWithdraw: false,
      });
    }

    let borrowers = [];
    const borrowEvents = await vault.queryFilter("BorrowRequested", 0, "latest");
    
    for (const event of borrowEvents) {
      const { originator, amount } = event.args;
      if (!borrowers.includes(originator)) {
        borrowers.push(originator);
      }
    }
    
    const pending = true;
    const [borrowList, borrowerList] = await vault.getUnpaidBorrowList(borrowers, pending);
    let unpaidBorrowers = [];
    for (let i = 0; i < borrowList.length; i++) {
      const [amount, epochStart, repaid] = borrowList[i];
      
      if(liquidityRemaining > amount) {
        liquidityRemaining -= amount;
        unpaidBorrowers.push(borrowerList[i]);
      }
    }
    console.log('unpaidBorrowers', unpaidBorrowers);

    let users = [];
    const depsoitEvents = await vault.queryFilter("DepositApproved", 0, "latest");
    
    for (const event of depsoitEvents) {
      const { requestId, user, amount } = event.args;
      if (!users.includes(user)) {
        users.push(user);
      }
    }
    const activeUsers = await vault.getActiveUserList(users);
    console.log('activeUsers', [...activeUsers]);
    const tx = await vault.processRequests(approvedRequests, unpaidBorrowers, [...activeUsers]);
    await tx.wait();
  
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
