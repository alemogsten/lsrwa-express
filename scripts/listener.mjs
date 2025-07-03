//node scripts/listener.js

// scripts/listener.js
import { ethers, formatUnits } from "ethers";
import vaultAbi from "../abis/Vault.json" assert { type: "json" };
import { MongoClient } from 'mongodb';

import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.WebSocketProvider(process.env.SEPOLIA_WSS);
const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, provider);

const mongo = new MongoClient(process.env.MONGO_URI);
await mongo.connect();
const db = mongo.db('lsrwa');
const collection = db.collection('requests');

vault.on("DepositRequested", async (requestId, user, amount, timestamp) => {
  console.log("DepositRequest:", requestId.toString(), user, amount, timestamp);
  await collection.insertOne({
    requestId: Number(requestId),
    user,
    amount: formatUnits(amount, parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6')),
    timestamp: Number(timestamp),
    isWithdraw: false,
    processed: false,
    approved: false,
    executed: false
  });
  console.log('Deposit stored:', requestId.toString());
});

vault.on("DepositCancelled", async (requestId, user) => {
  console.log("DepositCancelled:", requestId.toString(), user);
  await collection.deleteOne({ requestId: Number(requestId),isWithdraw: false });
});

vault.on("WithdrawRequested", async (requestId, user, amount, timestamp) => {
  console.log("WithdrawRequest:", requestId.toString(), user, amount, timestamp);
  await collection.insertOne({
    requestId: Number(requestId),
    user,
    amount: formatUnits(amount, parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6')),
    timestamp: Number(timestamp),
    isWithdraw: true,
    processed: false,
    approved: false,
    executed: false
  });
  console.log('Withdraw stored:', requestId.toString());
});

vault.on("WithdrawExecuted", async(requestId, user, amount) => {
  console.log("WithdrawExecute:", requestId.toString(), user, amount);
  await collection.updateOne(
    { requestId: Number(requestId),isWithdraw: true },
    { $set: { executed: true } }
  );
});

vault.on("DepositApproved", async(requestId, user, amount) => {
  try {
    console.log("DepositApprove:", requestId.toString(), user, amount);
    await collection.updateOne(
      { requestId: Number(requestId),isWithdraw: false },
      { $set: { processed: true } }
    );
    } catch (error) {
    console.error("Error handling DepositApproved event:", error);
  }
});

vault.on("WithdrawApproved", async(requestId, user, amount) => {
  console.log("WithdrawApproved:", requestId.toString(), user, amount);
  await collection.updateOne(
    { requestId: Number(requestId),isWithdraw: true },
    { $set: { processed: true, amount: formatUnits(amount, parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6')) } }
  );
});

vault.on("PartialWithdrawalFilled", (requestId, user, amount, timestamp) => {
  console.log("PartialWithdrawalFill:", requestId.toString(), user, amount, timestamp);
  // Optionally write to local DB, file, or call internal API
});

vault.on("BorrowRequested", (user, amount) => {
  console.log("BorrowRequest:", user, amount);
  // Optionally write to local DB, file, or call internal API
});

vault.on("CollateralDeposited", (user, amount) => {
  console.log("CollateralDeposit:", user, amount);
  // Optionally write to local DB, file, or call internal API
});

vault.on("CollateralLiquidated", (amount) => {
  console.log("CollateralLiquidat:", amount);
  // Optionally write to local DB, file, or call internal API
});

vault.on("EpochProcessed", (currentEpoch, depositCounter, withdrawCounter) => {
  console.log("EpochProcess:", 'currentEpoch ->'+currentEpoch, 'depositCounter->'+depositCounter, 'withdrawCounter->'+withdrawCounter);
  // Optionally write to local DB, file, or call internal API
});
