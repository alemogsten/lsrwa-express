//node scripts/listener.js

// scripts/listener.js
import { ethers } from "ethers";
import vaultAbi from "../abis/Vault.json" assert { type: "json" };;
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.WebSocketProvider(process.env.SEPOLIA_WSS);
const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, provider);

vault.on("DepositRequested", (requestId, user, amount, timestamp) => {
  console.log("📥 DepositRequest:", requestId.toString(), user, amount, timestamp);
  // Optionally write to local DB, file, or call internal API
});
vault.on("DepositCancelled", (requestId, user) => {
  console.log("📥 DepositCancelled:", requestId.toString(), user);
  // Optionally write to local DB, file, or call internal API
});
vault.on("WithdrawRequested", (requestId, user, amount, timestamp) => {
  console.log("📥 WithdrawRequest:", requestId.toString(), user, amount, timestamp);
  // Optionally write to local DB, file, or call internal API
});
vault.on("WithdrawExecuted", (requestId, user, amount) => {
  console.log("📥 WithdrawExecut:", requestId.toString(), user, amount);
  // Optionally write to local DB, file, or call internal API
});
vault.on("DepositApproved", (requestId, user, amount) => {
  console.log("📥 DepositApprove:", requestId.toString(), user, amount);
  // Optionally write to local DB, file, or call internal API
});
vault.on("WithdrawApproved", (requestId, user, amount) => {
  console.log("📥 WithdrawApproved:", requestId.toString(), user, amount);
  // Optionally write to local DB, file, or call internal API
});
vault.on("PartialWithdrawalFilled", (requestId, user, amount, timestamp) => {
  console.log("📥 PartialWithdrawalFill:", requestId.toString(), user, amount, timestamp);
  // Optionally write to local DB, file, or call internal API
});
vault.on("BorrowRequested", (user, amount) => {
  console.log("📥 BorrowRequest:", user, amount);
  // Optionally write to local DB, file, or call internal API
});
vault.on("CollateralDeposited", (user, amount) => {
  console.log("📥 CollateralDeposit:", user, amount);
  // Optionally write to local DB, file, or call internal API
});
vault.on("CollateralLiquidated", (user, amount) => {
  console.log("📥 CollateralLiquidat:", user, amount);
  // Optionally write to local DB, file, or call internal API
});
vault.on("EpochProcessed", (currentEpoch, depositCounter, withdrawCounter) => {
  console.log("📥 EpochProcess:", 'currentEpoch ->'+currentEpoch, 'depositCounter->'+depositCounter, 'withdrawCounter->'+withdrawCounter);
  // Optionally write to local DB, file, or call internal API
});
