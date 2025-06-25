'use client';

import { useState } from 'react';
import { useContractRead, useContractWrite } from 'wagmi';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
const AVERAGE_BLOCK_TIME_MS = process.env.NEXT_PUBLIC_BLOCK_TIME * 1000;

export default function EpochDurationManager() {
  const [newDuration, setNewDuration] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Read current epoch duration
  const { data: epochDuration, isLoading: isReading } = useContractRead({
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
        args: [BigInt(newDuration / AVERAGE_BLOCK_TIME_MS)],
      });
      setNewDuration('');
    } catch (err) {
      console.error('Error setting epoch duration:', err);
    } finally {
      setIsPending(false);
    }
  };

  const formattedTimeLeft = formatDuration(
      intervalToDuration({ start: 0, end: parseInt(epochDuration) * parseInt(AVERAGE_BLOCK_TIME_MS) }),
      { format: ['days','hours','minutes', 'seconds'] }
  );

  return (
    <div className="space-y-4">
      <p className='font-semibold text-lg mb-0'>Epoch Duration</p>
      <p className="mb-2">
        Current Epoch Duration:{' '}
        {!isReading ? 
        `${epochDuration*BigInt(AVERAGE_BLOCK_TIME_MS)} s (${formattedTimeLeft})` : 'Loading...'}
      </p>

      <input
        type="number"
        placeholder="New duration (s)"
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
