// app/api/admin/requests/route.js
import { NextResponse } from "next/server";
import { ethers, formatUnits } from "ethers";
import vaultAbi from "@/abis/Vault.json";

export async function GET(request) {

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const status = url.searchParams.get('status'); // 'pending', 'approved', 'executed'
  const type = url.searchParams.get('type') || 0;     // 'deposit: 1' or 'withdraw:2' or 'all:0'

  let processed = false;
  if (status === 'completed') processed = true;

  try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
      const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
      const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);
  
      const [data, ids, total] = await vault.getRequests(type,processed, page, limit, process.env.NEXT_PUBLIC_VAULT_ADDRESS, true);
      console.log('data', data);
      
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
      return NextResponse.json({ data: requests, total:parseInt(total)});
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
