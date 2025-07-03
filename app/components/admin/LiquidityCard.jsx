'use client';

import { formatNumber } from '@/utils/helper';
import { useAdminSummary } from '@/hooks/useAdminSummary';

export default function LiquidityCard() {

  const {poolUSDC, isLoading} = useAdminSummary();

  return (
    <div className="p-4 shadow bg-white rounded-xl">
      <p className="text-base font-medium">Pool USDC</p>
      <p className='text-lg font-bold'>{!isLoading ? formatNumber(poolUSDC) : '0.0'}</p>
    </div>
  );
}
