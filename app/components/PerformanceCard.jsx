'use client';

import { useDepositorAccount } from '@/hooks/useDepositorAccount';
import { useWallet } from '@/hooks/useWallet';
import Progressbar from "./Progressbar";

export default function AccountCard() {
  
  const { rewardAPR, isLoading } = useDepositorAccount();

  return (
    <div className="flex flex-col justify-between w-full h-[175px] border border-green bg-white rounded-[11px] shadow-[1px_3px_4px_0px_rgba(0,0,0,0.15)] p-[14px]">
      <p className='text-base font-medium leading-[22px]'>Performance Metricss</p>
      <div className='flex gap-1 h-[69px]'>
        <div className='flex flex-col items-center justify-center w-full h-full rounded-[6px] bg-[#F6F8F9]'>
          <p className='text-center font-medium leading-[30px] color-[#0A133999]'>Total Value Locked</p>
          <p className='text-center font-bold text-[24px] leading-[30px]'>$2.8M</p>
        </div>
        <div className='flex flex-col items-center justify-center w-full h-full rounded-[6px] bg-[#F6F8F9]'>
          <p className='text-center font-medium leading-[30px] color-[#0A133999]'>Current APR</p>
          <p className='text-center font-bold text-[24px] leading-[30px]'>{isLoading ? '0' : rewardAPR}%</p>
        </div>
      </div>
      <div className='w-full'>
        <Progressbar progress={67} height={9}/>
        <p className='text-center font-medium leading-[20px]'>Vault Capacity: $2.8M / $4.2M (67% filled)</p>
      </div>
    </div>
  );
}
