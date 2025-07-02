//node scripts/listener.js

// scripts/listener.js
import { ethers, formatUnits } from "ethers";
import vaultAbi from "../abis/Vault.json" assert { type: "json" };
import { MongoClient } from 'mongodb';

import dotenv from "dotenv";
dotenv.config();

const USDC_DECIMALS = parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6');

const provider = new ethers.WebSocketProvider(process.env.SEPOLIA_WSS);
const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, provider);

const mongo = new MongoClient(process.env.MONGO_URI);
await mongo.connect();
const db = mongo.db('lsrwa');
const requestsCollection = db.collection('requests');
const borrowsCollection = db.collection('borrows');
const usersCollection = db.collection('users');

vault.on("DepositRequested", async (requestId, user, amount, timestamp) => {
  console.log("DepositRequest:", requestId.toString(), user, amount, timestamp);
  await requestsCollection.insertOne({
    requestId: Number(requestId),
    user,
    amount: Number(formatUnits(amount, USDC_DECIMALS)),
    timestamp: Number(timestamp),
    isWithdraw: false,
    processed: false,
    executed: false
  });

  await usersCollection.updateOne(
    { address: user },
    {
      $inc: {
        deposit: 0
      },
      $setOnInsert: {
        address: user,
        reward: 0,
        autoCompound: false
      }
    },
    { upsert: true }
  );
});

vault.on("DepositApproved", async(requestId, user) => {
  console.log("DepositApproved:", requestId.toString(), user);
  await requestsCollection.updateOne(
    { requestId: Number(requestId), isWithdraw: false },
    { $set: { processed: true } }
  );
});

vault.on("DepositCancelled", async (requestId, user) => {
  console.log("DepositCancelled:", requestId.toString(), user);
  await requestsCollection.deleteOne({ requestId: Number(requestId), isWithdraw: false });
});

vault.on("WithdrawRequested", async (requestId, user, amount, timestamp) => {
  console.log("WithdrawRequest:", requestId.toString(), user, amount, timestamp);
  await requestsCollection.insertOne({
    requestId: Number(requestId),
    user,
    amount: Number(formatUnits(amount, USDC_DECIMALS)),
    timestamp: Number(timestamp),
    isWithdraw: true,
    processed: false,
    executed: false
  });
});

vault.on("WithdrawExecuted", async(requestId, user, amount) => {
  console.log("WithdrawExecute:", requestId.toString(), user, amount);
  await requestsCollection.updateOne(
    { requestId: Number(requestId), isWithdraw: true },
    { $set: { executed: true } }
  );
});

vault.on("WithdrawApproved", async(requestId, user, amount) => {
  console.log("WithdrawApproved:", requestId.toString(), user, amount);
  await requestsCollection.updateOne(
    { requestId: Number(requestId), isWithdraw: true },
    { $set: { processed: true, amount: Number(formatUnits(amount, USDC_DECIMALS)) } }
  );
});

vault.on("CollateralDeposited", async (user, amount) => {
  console.log("CollateralDeposited:", user, amount);
  await borrowsCollection.insertOne({
    user,
    amount: 0,
    collateral: Number(formatUnits(amount, 18)),
    repaid: false,
    epochStart: 0
  });
});

vault.on("BorrowRequested", async (user, amount) => {
  console.log("BorrowRequested:", user, amount);
  await borrowsCollection.updateOne(
    { user: user },
    { $set: { amount: Number(formatUnits(amount, USDC_DECIMALS)) } }
  );
});

vault.on("BorrowExecuted", async (user, amount, epochStart) => {
  console.log("BorrowExecuted:", user, amount, epochStart);
  await borrowsCollection.updateOne(
    { user: user },
    { $set: { epochStart: Number(epochStart) } }
  );
});

vault.on("BorrowRepaid", async (user) => {
  console.log("BorrowRepaid:", user);
  await borrowsCollection.updateOne(
    { user: user },
    { $set: { repaid: true } }
  );
});

vault.on("CollateralLiquidated", async (borrower, amount) => {
  console.log("CollateralLiquidated:", borrower, amount);
  await borrowsCollection.updateOne(
    { user: borrower },
    { $set: { repaid: true } }
  );
});

vault.on("RewardHarvested", async (user, amount) => {
  console.log("RewardHarvested:", user, amount);
  await usersCollection.updateOne(
    { address: user },
    { $set: { reward: 0 } }
  );
});