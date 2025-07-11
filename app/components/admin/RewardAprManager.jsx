'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { ethers } from "ethers";
import vaultAbi from '@/abis/Vault.json';
import { connectWallet } from "@/utils/wallet";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export default function RewardAPRManager() {
  const [newAPR, setNewAPR] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Read rewardAPR
  const { data: rewardAPR, refetch, isLoading: isReading } = useReadContract({
    abi: vaultAbi,
    address: VAULT_ADDRESS,
    functionName: 'rewardAPR',
  });

  const handleSetRewardAPR = async () => {
      setIsPending(true);
      try {
        const {signer} = await connectWallet();
        const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);
        const tx = await vault.setRewardAPR(newAPR*100);
        await tx.wait();
        
        setNewAPR('');
        refetch();
    } catch (error) {
        alert("Failed: "+error.message);
      }
    setIsPending(false);
  };

  return (
    <div className="max-w-md">
      <p className="text-lg font-semibold mb-0">Reward APR</p>
      <p className='mb-2'>Current Reward APR: {!isReading ? `${(Number(rewardAPR)*0.01)}%` : 'Loading...'}</p>

      <input
        type="number"
        placeholder="Enter new APR"
        value={newAPR}
        onChange={(e) => setNewAPR(e.target.value)}
        className="flex-1 border px-3 py-2 rounded"
      />

      <button
        onClick={handleSetRewardAPR}
        disabled={isPending || !newAPR}
        className="ml-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
      >
        {isPending ? 'Updating...' : 'Set Reward APR'}
      </button>
    </div>
  );
}
