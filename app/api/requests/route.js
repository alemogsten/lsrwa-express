// app/api/requests/route.js
import { NextResponse } from 'next/server';
import { ethers, formatUnits } from "ethers";
import vaultAbi from "@/abis/Vault.json";

export async function POST(request) {
  const { address } = await request.json();

  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);

    const [data, ids, total] = await vault.getRequests(0,false, 1, 10, address, false);
    let requests = [];
    requests = data.map((item, index) => ({
      requestId: parseInt(ids[index]),
      user: item[0], 
      amount: formatUnits(item[1], parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)),
      timestamp: parseInt(item[2]),
      isWithdraw: item[3],
      processed: item[4],
      executed: item[5]
    }));

    console.log('requests', requests);
    

    return NextResponse.json({ requests, total:parseInt(total)});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
