'use client';

import { useState } from 'react';
import { formatNumber } from '@/utils/helper';
import axios from 'axios';
import { useAdminSummary } from '@/hooks/useAdminSummary';

export default function LiquidityTokenCard() {

  const {borrowingUSDC, poolLSRWA, repaymentRequiredEpochId, currentEpochId, maxEpochsBeforeLiquidation, refetch} = useAdminSummary();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  const handleLiquidate = () => {
      setLoading(true);
      axios
        .post('/api/admin/liquidate-collateral', {address})
        .then((res) => {
          alert('Liquidate collaterals successfully.');
          refetch();
          console.log(res.data.success);
        })
        .finally(() => {
          setLoading(false);
          setAddress('');
        });
  }

  return (
    <div className="p-4 shadow bg-white rounded-xl flex justify-between">
      <div>
        <p className="text-base font-medium">Pool LSRWA</p>
        <p className='text-lg font-bold'>{poolLSRWA ? formatNumber(poolLSRWA) : '0.0'}</p>
      </div>
      <div className='flex flex-col'>
        {borrowingUSDC > 0 && parseInt(repaymentRequiredEpochId) != 0 && parseInt(currentEpochId) >= (parseInt(repaymentRequiredEpochId) + parseInt(maxEpochsBeforeLiquidation)) 
        && <>
          <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" placeholder="Enter address" className='px-2 py-1 border border-gray-300 rounded-sm' />
          <button disabled={loading} onClick={handleLiquidate} className='mt-1 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50'>{loading ? 'Loading' : 'Liquidate Collateral'}</button>
          </> }
      </div>
    </div>
  );
}
