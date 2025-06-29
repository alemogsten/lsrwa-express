// app/api/admin/process-epoch/route.js
import { NextResponse } from "next/server";
import { ethers } from "ethers";
import vaultAbi from "@/abis/Vault.json";

export async function POST() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);

    const tx = await vault.processEpoch();
    await tx.wait();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
