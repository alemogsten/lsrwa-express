'use client';

import { useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';

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

  const { writeContractAsync } = useWriteContract();

  const handleSetRewardAPR = async () => {
    try {
      setIsPending(true);
      await writeContractAsync({
        abi: vaultAbi,
        address: VAULT_ADDRESS,
        functionName: 'setRewardAPR',
        args: [BigInt(newAPR)],
      });
      // setNewAPR('');
      refetch(); // refresh rewardAPR after update
    } catch (err) {
      console.error('Failed to set rewardAPR:', err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">
        Current Reward APR: {!isReading ? `${rewardAPR.toString()}%` : 'Loading...'}
      </p>

      <input
        type="number"
        placeholder="Enter new APR"
        value={newAPR}
        onChange={(e) => setNewAPR(e.target.value)}
        className="border p-2 rounded"
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
