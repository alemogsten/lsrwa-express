// app/api/admin/process-requests/route.js
import { NextResponse } from "next/server";
import { ethers, parseUnits } from "ethers";
import vaultAbi from "@/abis/Vault.json";
import clientPromise from '@/lib/mongo';

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB);
    const collection = db.collection('requests');

    const query = {processed: false, approved: false};
    const data = await db
      .collection('requests')
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);

    const approvedRequests = data.map((r) => ({
      user: r.user,
      requestId: r.requestId,
      amount: parseUnits(r.amount.toString(), parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)),
      timestamp: r.timestamp,
      isWithdraw: r.isWithdraw,
    }));

    if(approvedRequests.length > 0) {
      const tx = await vault.processRequests(approvedRequests);
      await tx.wait();
  
      for (const element of approvedRequests) {
        await collection.updateOne(
          { requestId: Number(element.requestId), timestamp: element.timestamp },
          { $set: { approved: true } }
        );
      }
  
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "No pending requests" });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
