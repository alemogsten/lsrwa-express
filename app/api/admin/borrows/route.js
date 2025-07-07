// app/api/admin/borrows/route.js
import { NextResponse } from "next/server";
import { ethers, formatUnits } from "ethers";
import vaultAbi from "@/abis/Vault.json";

export async function GET(request) {

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
      const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
      const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);

      let borrowers = [];
      const borrowEvents = await vault.queryFilter("BorrowRequested", 0, "latest");
      
      for (const event of borrowEvents) {
        const { originator, amount } = event.args;
        if (!borrowers.includes(originator)) {
          borrowers.push(originator);
        }
      }
  
      const data = await vault.getBorrowRequests(borrowers);
      console.log('borrows', data);
      
      let requests = [];
      requests = data.map((item, index) => ({
        user: borrowers[index],
        amount: formatUnits(item[0], parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)),
        epochStart: Number(item[1]),
        repaid: item[2]
      }));
      requests = requests.slice((page-1)*limit, limit);
      return NextResponse.json({ data: requests, total:borrowers.length});
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
