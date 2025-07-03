"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import vaultAbi from "@/abis/Vault.json";
import erc20Abi from "@/abis/ERC20.json";
import { connectWallet } from "@/utils/wallet";

export default function WithdrawForm() {
  const {
    address,
    isConnected,
    disconnect,
    balance,
    symbol,
    isBalanceLoading,
  } = useWallet();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const handleWithdraw = async () => {
    try {
      const { signer } = await connectWallet();
      if (!isConnected) return alert("Wallet not connected");

      const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);

      const parsedAmount = ethers.parseUnits(amount, parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)); // USDC uses 6 decimals

      setStatus("Requesting withdraw...");
      const withdrawTx = await vault.requestWithdraw(parsedAmount);
      await withdrawTx.wait();

      setStatus("Requested withdraw!");
    } catch (error) {
      console.error(error);
      setStatus("Error: " + (error?.reason || error?.message));
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6 p-6">
      <input
        type="number"
        placeholder="Amount in USDC"
        className="border rounded px-3 py-2"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={handleWithdraw}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Withdraw USDC
      </button>
      <p className="text-sm">{status}</p>
    </div>
  );
}
