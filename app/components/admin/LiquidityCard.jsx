'use client';

import { formatNumber } from '@/utils/helper';
export default function LiquidityCard({poolUSDC}) {

  return (
    <div className="p-4 shadow bg-white rounded-xl">
      <p className="text-base font-medium">Pool USDC</p>
      <p className='text-lg font-bold'>{poolUSDC ? formatNumber(poolUSDC) : 0}</p>
    </div>
  );
}
