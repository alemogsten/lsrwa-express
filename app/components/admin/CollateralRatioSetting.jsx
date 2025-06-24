'use client';

import { useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';


const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
import VAULT_ABI from '@/abis/Vault.json';

export default function CollateralRatioSetting() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Read collateralRatio from contract
  const { data: currentValue, refetch, isLoading: isReading } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'collateralRatio',
  });

  // Write to collateralRatio
  const { writeContractAsync } = useWriteContract();

  const handleSubmit = async () => {
    if (!input) return;
    setLoading(true);
    try {
      await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'setCollateralRatio',
        args: [BigInt(input)],
      });
      await refetch();
      alert('Updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold mb-2">Collateral Ratio</h2>
      <p className="mb-2">
        Current value:{' '}
        <span className="font-mono">
          {isReading ? 'Loading...' : currentValue?.toString() ?? 'N/A'} %
        </span>
      </p>

      <div className="flex gap-2 items-center mt-2">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter new value"
          className="flex-1 border px-3 py-2 rounded"
        />%
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
}
