'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAdminSummary } from '@/hooks/useAdminSummary';

export default function TopupUSDC() {
  const {refetch} = useAdminSummary();
  const [amount, setAmount] = useState('');
  const [checked, setCheck] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !checked) return;
    setLoading(true);
    axios
      .post('/api/admin/topup', { amount })
      .then((res) => {
        console.log(res.data.success);
        alert('Added USDC successfully');
        refetch();
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold pb-4">Top up USDC</h2>
        <input
          type="checkbox"
          value={checked}
          onChange={(e) => setCheck(e.target.checked)}
        /> Confirm you sent USDC to contract
      <div className="flex gap-2 items-center mt-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter new value"
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !amount || !checked}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Top up'}
        </button>
      </div>
    </div>
  );
}
