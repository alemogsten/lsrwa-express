'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import axios from 'axios';


const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
import VAULT_ABI from '@/abis/Vault.json';

export default function MaxEpochSetting() {
  const [maxEpoch, setMaxEpoch] = useState('');
  const [loading, setLoading] = useState(false);

  // Read maxEpochsBeforeLiquidation from contract
  const { data: currentValue, refetch, isLoading: isReading } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'maxEpochsBeforeLiquidation',
  });

  const handleSubmit = async () => {
    if (!maxEpoch) return;
    setLoading(true);
    axios
            .post('/api/admin/set_max_epoch', { value: maxEpoch })
            .then((res) => {
              console.log(res.data.status);
              refetch();
            })
            .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold mb-2">Max Epochs Before Liquidation</h2>
      <p className="mb-2">
        Current value:{' '}
        <span className="font-mono">
          {isReading ? 'Loading...' : currentValue?.toString() ?? 'N/A'}
        </span>
      </p>

      <div className="flex gap-2 items-center mt-2">
        <input
          type="number"
          value={maxEpoch}
          onChange={(e) => setMaxEpoch(e.target.value)}
          placeholder="Enter new value"
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !maxEpoch}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
}
