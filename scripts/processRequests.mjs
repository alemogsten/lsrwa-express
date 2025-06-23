import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
import vaultAbi from "../abis/Vault.json" assert { type: "json" };

dotenv.config();

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);

async function processRequests() {
  console.log("📡 Scanning requests...");
  const usdc = new ethers.Contract(process.env.USDC_ADDRESS, usdcAbi, provider);
  const poolUSDC = await usdc.balanceOf(process.env.VAULT_ADDRESS);

  const latestBlock = await provider.getBlockNumber();
  const startBlock = latestBlock - 5000;

  const depositEvents = await vault.queryFilter("DepositRequested", startBlock, latestBlock);
  const withdrawEvents = await vault.queryFilter("WithdrawRequested", startBlock, latestBlock);

  const approvedRequests = [];
  let liquidityRemaining = poolUSDC;

  // Withdrawals first (FIFO)
  for (const event of withdrawEvents) {
    const { requestId, user, amount, timestamp } = event.args;
    const approvedAmount = liquidityRemaining >= amount ? amount : liquidityRemaining;
    liquidityRemaining -= approvedAmount;

    approvedRequests.push({
      user,
      requestId,
      amount: approvedAmount,
      timestamp,
      isWithdraw: true,
    });

    if (liquidityRemaining === 0n) break;
  }

  // Then deposits (all allowed)
  for (const event of depositEvents) {
    const { requestId, user, amount, timestamp } = event.args;
    approvedRequests.push({
      user,
      requestId,
      amount,
      timestamp,
      isWithdraw: false,
    });
  }

  console.log("✅ Approved Requests:");
  console.log(approvedRequests);

  // Send to smart contract
  const tx = await vault.processRequests(approvedRequests);
  console.log("📨 TX sent:", tx.hash);
  await tx.wait();
  console.log("✅ Requests processed.");
}

processRequests().catch(console.error);
