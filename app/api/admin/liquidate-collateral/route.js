// app/api/admin/liquidate-collateral/route.js
import { NextResponse } from "next/server";
import { ethers } from "ethers";
import vaultAbi from "@/abis/Vault.json";
import clientPromise from '@/lib/mongo';

export async function POST(request) {
  const {address} = await request.json();

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const collection = db.collection('borrows');

  try {

    const borrows = await collection
    .find({repaid: false, epochStart: { $ne: 0 }}, { projection: { user: 1, _id: 0 } })
    .toArray();

    const borrowerList = [];
    for (const item of borrows) {
      borrowerList.push(item.user);
    }
    
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);

    const tx = await vault.liquidateCollateral(address, borrowerList);
    await tx.wait();

    await collection.deleteMany({ repaid: false, epochStart: { $ne: 0 } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
