// app/api/admin/process-epoch/route.js
import { NextResponse } from "next/server";
import { ethers } from "ethers";
import vaultAbi from "@/abi/Vault.json";

export async function POST() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const vault = new ethers.Contract(process.env.VAULT_ADDRESS, vaultAbi, signer);

    const tx = await vault.processEpoch();
    await tx.wait();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
