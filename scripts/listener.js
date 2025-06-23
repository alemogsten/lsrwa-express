//node scripts/listener.js

// scripts/listener.js
import { ethers } from "ethers";
import vaultAbi from "@/abis/Vault.json";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.WebSocketProvider(process.env.SEPOLIA_WSS);
const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, provider);

vault.on("DepositRequested", (requestId, user, amount, timestamp) => {
  console.log("📥 DepositRequest:", requestId.toString(), user);
  // Optionally write to local DB, file, or call internal API
});
