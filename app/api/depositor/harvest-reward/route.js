// app/api/depositor/harvest-reward/route.js
import { NextResponse } from "next/server";
import { ethers, parseUnits } from "ethers";
import vaultAbi from "@/abis/Vault.json";
import clientPromise from '@/lib/mongo';

export async function POST(request) {
  try {
    const { address } = await request.json();

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB);
    const collection = db.collection('users');

    const user = await collection.findOne(
      { address: address }
    );

    const reward = user?.reward ?? 0;
    if (reward > 0) {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
      const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
      const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);
  
      const tx = await vault.harvestReward(address, parseUnits(reward.toString(), parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)));
      await tx.wait();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
