"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { connectWallet } from "@/utils/wallet";
import vaultAbi from "@/abis/Vault.json";

export default function ExecuteWithdrawForm() {
  const { signer } = connectWallet();
  const [requestId, setRequestId] = useState("");
  const [status, setStatus] = useState("");

  const handleWithdraw = async () => {
    try {
      if (!signer) return alert("Connect wallet first");

      const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);
      setStatus("Sending withdraw transaction...");

      const tx = await vault.executeWithdraw(BigInt(requestId));
      await tx.wait();

      setStatus("✅ Withdraw executed!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error: " + (err?.reason || err?.message));
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <input
        type="number"
        placeholder="Enter Request ID"
        className="border rounded px-3 py-2"
        value={requestId}
        onChange={(e) => setRequestId(e.target.value)}
      />
      <button
        onClick={handleWithdraw}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Execute Withdraw
      </button>
      <p className="text-sm">{status}</p>
    </div>
  );
}
