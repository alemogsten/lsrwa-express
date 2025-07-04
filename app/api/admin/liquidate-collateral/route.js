// app/api/admin/liquidate-collateral/route.js
import { NextResponse } from "next/server";
import { ethers } from "ethers";
import vaultAbi from "@/abis/Vault.json";

export async function POST(request) {
  const {address} = await request.json();
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);

    let borrowers = [];
    const borrowEvents = await vault.queryFilter("BorrowRequested", 0, "latest");
    
    for (const event of borrowEvents) {
      const { originator, amount } = event.args;
      borrowers.push(originator);
    }
    const pending = false;
    const [borrowList, borrowerList] = await vault.getUnpaidBorrowList(borrowers, pending);

    const tx = await vault.liquidateCollateral(address, [...borrowerList]);
    await tx.wait();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
