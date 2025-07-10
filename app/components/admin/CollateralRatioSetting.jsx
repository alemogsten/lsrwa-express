'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { ethers } from "ethers";
import { connectWallet } from "@/utils/wallet";


const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
import VAULT_ABI from '@/abis/Vault.json';

export default function CollateralRatioSetting() {
  const [collateralRatio, setCollateralRatio] = useState('');
  const [loading, setLoading] = useState(false);

  // Read collateralRatio from contract
  const { data: currentValue, refetch, isLoading: isReading } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'collateralRatio',
  });

  const handleSubmit = async () => {
    if (!collateralRatio) return;
    setLoading(true);
    const {signer} = await connectWallet();
    const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, VAULT_ABI, signer);
    const tx = await vault.setCollateralRatio(collateralRatio);
    await tx.wait();
    setLoading(false);
    refetch();
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
          value={collateralRatio}
          onChange={(e) => setCollateralRatio(e.target.value)}
          placeholder="Enter new value"
          className="flex-1 border px-3 py-2 rounded"
        />%
        <button
          onClick={handleSubmit}
          disabled={loading || !collateralRatio}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
}
