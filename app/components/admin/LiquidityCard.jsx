'use client';

import { formatNumber } from '@/utils/helper';
import { useAdminSummary } from '@/hooks/useAdminSummary';

export default function LiquidityCard() {

  const {poolUSDC, rewardDebt, isLoading} = useAdminSummary();

  return (
    <div className="p-4 shadow bg-white rounded-xl">
      <div className='flex justify-between'>
        <div>
          <p className="text-base font-medium">Pool USDC</p>
          <p className='text-lg font-bold'>{!isLoading ? formatNumber(poolUSDC) : '0.0'}</p>
        </div>
        <div>
          <p className="text-base font-medium">Reward Debt</p>
          <p className='text-lg font-bold'>{!isLoading ? formatNumber(rewardDebt) : '0.0'}</p>
        </div>
      </div>
    </div>
  );
}
