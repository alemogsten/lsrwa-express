// app/api/admin/process-requests/route.js
import { NextResponse } from "next/server";
import { ethers, parseUnits, formatUnits } from "ethers";
import vaultAbi from "@/abis/Vault.json";
import usdcAbi from "@/abis/ERC20.json";
import clientPromise from '@/lib/mongo';
// import { RequestType } from "@/utils/const";

const USDC_DECIMALS = parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6');

export async function POST() {
  try {

    await processRequests();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processRequests() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const requestsCol = db.collection('requests');
  const usersCol = db.collection('users');
  const borrowsCol = db.collection('borrows');
  const settingsCol = db.collection('settings');

  const depositRequests = await requestsCol
    .find({processed: false, isWithdraw: false})
    .toArray();
  const withdrawRequests = await requestsCol
    .find({processed: false, isWithdraw: true})
    .toArray();
    
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
  const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
  const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);

  const usdc = new ethers.Contract(process.env.NEXT_PUBLIC_USDC_ADDRESS, usdcAbi, provider);
  const poolUSDC = await usdc.balanceOf(process.env.NEXT_PUBLIC_VAULT_ADDRESS);
  let liquidityRemaining = parseFloat(formatUnits(poolUSDC, USDC_DECIMALS));

  const approvedRequests = [];

  for (let i = 0; i < withdrawRequests.length; i++) {
    const req = withdrawRequests[i];
    const user = await usersCol
        .findOne({address: req.user});
    const deposit = parseFloat(user.deposit);
    const amount = parseFloat(req.amount);

    if(deposit >= amount) {
      const approvedAmount = liquidityRemaining >= amount ? amount : liquidityRemaining;
      liquidityRemaining -= approvedAmount;

      approvedRequests.push({
        user: req.user,
        requestId: req.requestId,
        amount: parseUnits(approvedAmount.toString(), USDC_DECIMALS),
        timestamp: req.timestamp,
        isWithdraw: true,
      });

      await usersCol.updateOne(
        { address: req.user },
        { $set: { deposit: deposit - approvedAmount } }
      );
    }

    if (liquidityRemaining === 0) break;
  }

  // process deposit
  for (let i = 0; i < depositRequests.length; i++) {
    const req = depositRequests[i];
    const user = await usersCol
        .findOne({address: req.user});
    const deposit = parseFloat(user.deposit);
    const amount = parseFloat(req.amount);

    await usersCol.updateOne(
      { address: req.user },
      { $set: { deposit: deposit+amount } }
    );
    liquidityRemaining += amount;
    approvedRequests.push({
      user: req.user,
      requestId: req.requestId,
      amount: parseUnits(amount.toString(), USDC_DECIMALS),
      timestamp: req.timestamp,
      isWithdraw: false,
    });
  }

  // process borrow
  const borrows = await borrowsCol
    .find({repaid: false, epochStart: 0}, { projection: { user: 1, amount: 1, _id: 0 } })
    .toArray();

  const borrowerList = [];
  for (const item of borrows) {
    liquidityRemaining -= item.amount;
    if (liquidityRemaining >= 0) {
      borrowerList.push(item.user);
    } else {
      break;
    }
  }

  // process reward
  const settings = await settingsCol
        .findOne({});
  const BPS_DIVISOR = 10000;
  const blocksPerYear = 2300000;
  const rewardAPR = settings.rewardAPR ?? 500; // 5% APR
  const epochDuration = settings.epochDuration ?? 40320; // ~1 week in blocks
  const users = await usersCol
    .find({ deposit: { $gt: 0 } })
    .toArray();
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const reward = Math.round((user.deposit * rewardAPR * epochDuration) / (blocksPerYear * BPS_DIVISOR) * 1e6) / 1e6;
    if (reward > 0) {
      if (user.autoCompound) {
        await usersCol.updateOne(
          { address: user.address },
          {
            $inc: {
              deposit: reward
            }
          }
        );
      } else {
        await usersCol.updateOne(
          { address: user.address },
          {
            $inc: {
              reward: reward
            }
          }
        );
      }
    }
  }

  const tx = await vault.processRequests(approvedRequests, borrowerList);
  await tx.wait();
  // if (approvedRequests.length > 0 || borrowerList.length > 0) {
  // }
}