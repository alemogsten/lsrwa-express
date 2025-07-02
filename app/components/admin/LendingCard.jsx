'use client';

import { useState } from 'react';
import { formatNumber } from '@/utils/helper';
import axios from 'axios';

export default function LendingCard({
        borrowingUSDC, 
        repaymentRequiredEpochId,
        currentEpochId, 
        maxEpochsBeforeLiquidation, 
        refetch
    }
) {  

  const [loading, setLoading] = useState(false);

  const handleRepayment = () => {
    setLoading(true);
    axios
      .post('/api/admin/require-repayment')
      .then((res) => {
        alert('Required repayment successfully.');
        refetch();
        console.log(res.data.success);
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="p-4 shadow bg-white rounded-xl flex justify-between">
      <div>
        <p className="text-base font-medium">Lending USDC</p>
        <p className='text-lg font-bold'>{borrowingUSDC ? formatNumber(borrowingUSDC) : '0.0'}</p>
      </div>
      <div>
      {repaymentRequiredEpochId == 0 || undefined ? 
          <button onClick={handleRepayment} disabled={loading || borrowingUSDC == 0} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50'>{loading?'Doing require':'Require Repayment'}</button> 
          : <div><p className='text-red-500'>Required repayment</p>
          {currentEpochId && repaymentRequiredEpochId && <p className='text-black'>Remained Epoch: {parseInt(maxEpochsBeforeLiquidation) - (parseInt(currentEpochId) - parseInt(repaymentRequiredEpochId))}</p>}</div>}
      </div>
    </div>
  );
}
