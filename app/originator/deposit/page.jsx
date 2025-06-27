"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import vaultAbi from "@/abis/Vault.json";
import erc20Abi from "@/abis/ERC20.json";
import { connectWallet } from "@/utils/wallet";

export default function DepositForm() {
  const {
    isConnected,
  } = useWallet();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const handleDeposit = async () => {
    try {
      const { signer } = await connectWallet();
      if (!isConnected) return alert("Wallet not connected");
      const token = new ethers.Contract(process.env.NEXT_PUBLIC_TOKEN_ADDRESS, erc20Abi, signer);
      const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);

      const parsedAmount = ethers.parseUnits(amount, 18);

      setStatus("Checking allowance...");
      const owner = await signer.getAddress();
      const allowance = await token.allowance(owner, process.env.NEXT_PUBLIC_VAULT_ADDRESS);

      if (allowance < parsedAmount) {
        setStatus("Approving token...");
        const approveTx = await token.approve(process.env.NEXT_PUBLIC_VAULT_ADDRESS, parsedAmount);
        await approveTx.wait();
      }

      setStatus("Depositing...");
      const depositTx = await vault.depositCollateral(parsedAmount);
      await depositTx.wait();

      setStatus("Deposited!");
    } catch (error) {
      console.error(error);
      setStatus("Error: " + (error?.reason || error?.message));
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6 p-6">
      <input
        type="number"
        placeholder="Amount in token"
        className="border rounded px-3 py-2"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={handleDeposit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Deposit Token
      </button>
      <p className="text-sm">{status}</p>
    </div>
  );
}
