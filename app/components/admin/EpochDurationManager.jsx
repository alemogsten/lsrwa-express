'use client';

import { useContractRead, useContractWrite } from 'wagmi';
import { useState } from 'react';
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export default function EpochDurationManager() {
  const [newDuration, setNewDuration] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Read current epoch duration
  const { data: epochDuration } = useContractRead({
    address: VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: 'epochDuration',
    watch: true,
  });

  // Set new epoch duration
  const { writeAsync } = useContractWrite({
    address: VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: 'setEpochDuration',
  });

  const handleSetDuration = async () => {
    if (!newDuration) return;
    try {
      setIsPending(true);
      await writeAsync({
        args: [BigInt(newDuration)],
      });
      setNewDuration('');
    } catch (err) {
      console.error('Error setting epoch duration:', err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-700">
        Current Epoch Duration:{' '}
        {epochDuration ? `${epochDuration.toString()} blocks` : 'Loading...'}
      </p>

      <input
        type="number"
        placeholder="New duration (blocks)"
        className="border p-2 rounded"
        value={newDuration}
        onChange={(e) => setNewDuration(e.target.value)}
      />

      <button
        onClick={handleSetDuration}
        disabled={isPending || !newDuration}
        className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
      >
        {isPending ? 'Setting...' : 'Set Epoch Duration'}
      </button>
    </div>
  );
}
