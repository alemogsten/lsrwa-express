'use client';

import Image from 'next/image';
import { useWallet } from '@/hooks/useWallet';
import Progressbar from "./Progressbar";

export default function EpochInfoCard() {
  const {
    address,
    isConnected,
    disconnect,
    balance,
    symbol,
    isBalanceLoading,
  } = useWallet();

  return (
    <div className="flex flex-col justify-between w-full bg-white rounded-[11px] shadow-[1px_3px_4px_0px_rgba(0,0,0,0.15)] p-[14px]">
      <p className='text-[24px] font-bold leading-[30px]'>Epoch Information</p>
      <p className='text-gray font-medium leading-[20px]'>At LSRWA Express, we operate in weekly epochs that process deposits, withdrawals, and borrowing in an orderly cycle. This ensures fairness and liquidity availability for everyone,</p>
      <div className='flex justify-between gap-2 w-full mt-4 items-center whitespace-nowrap'>
        <div className='text-center'>
          <p className='font-bold text-center'>May 26, 2025</p>
          <p className='font-medium text-gray text-center'>Start Date</p>
        </div>
        <div className='text-center'>
          <p className='font-bold text-center'>09:00 UTC</p>
          <p className='font-medium text-gray text-center'>Start Time</p>
        </div>
        <Progressbar progress={80} height={24}/>
        <div className='text-center'>
          <p className='font-bold text-center'>2d 14h 32m</p>
          <p className='font-medium text-gray text-center'>Expected Next Epoch In</p>
        </div>
      </div>
    </div>
  );
}
