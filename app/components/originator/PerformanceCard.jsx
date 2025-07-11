'use client';

import { useEffect, useState } from 'react'
import { useOriginatorAccount } from '@/hooks/useOriginatorAccount';
import { usePerformance } from '@/hooks/usePerformance'

export default function AccountCard() {
  
  const { collateralRatio, isLoading } = useOriginatorAccount();
  const { collateralValue } = usePerformance()

  const [collateral, setCollateral] = useState('0')

  useEffect(() => {
    const fetchValues = async () => {
      const col = await collateralValue()
      setCollateral(col)
    }

    fetchValues()
  }, [])

  return (
    <div className="flex flex-col justify-between w-full min-h-[175px] border border-green bg-white rounded-[11px] shadow-[1px_3px_4px_0px_rgba(0,0,0,0.15)] p-[14px]">
      <p className='text-base font-medium leading-[22px]'>Performance Metricss</p>
      <div className='flex gap-1 h-[69px]'>
        <div className='flex flex-col items-center justify-center w-full h-full rounded-[6px] bg-[#F6F8F9]'>
          <p className='text-center font-medium leading-[30px] color-[#0A133999]'>Total Value Locked</p>
          <p className='text-center font-bold text-[24px] leading-[30px]'>${collateral}</p>
        </div>
        <div className='flex flex-col items-center justify-center w-full h-full rounded-[6px] bg-[#F6F8F9]'>
          <p className='text-center font-medium leading-[30px] color-[#0A133999]'>Collateral Ratio</p>
          <p className='text-center font-bold text-[24px] leading-[30px]'>{isLoading ? '0' : collateralRatio}%</p>
        </div>
      </div>
    </div>
  );
}
