'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';
import axios from 'axios';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export default function RewardAPRManager({rewardAPR, refetch}) {
  const [newAPR, setNewAPR] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSetRewardAPR = async () => {
      setIsPending(true);
    axios
            .post('/api/admin/set_rewardapr', { value: newAPR })
            .then((res) => {
              console.log(res.data.status);
              setNewAPR('');
              refetch(); // refresh rewardAPR after update
            })
            .finally(() => setIsPending(false));
  };

  return (
    <div className="max-w-md">
      <p className="text-lg font-semibold mb-0">Reward APR</p>
      <p className='mb-2'>Current Reward APR: {rewardAPR ? `${rewardAPR}%` : 'Loading...'}</p>

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
