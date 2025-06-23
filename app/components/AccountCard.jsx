'use client';

import Image from 'next/image';
import { useWallet } from '@/hooks/useWallet';
import ToggleSwitchButton from "./ToggleSwitchButton";

export default function AccountCard() {
  const {
    address,
    isConnected,
    disconnect,
    balance,
    symbol,
    isBalanceLoading,
  } = useWallet();


  const handleAutoCompoundClick = () => {
  };

  return (
    <div className="flex flex-col justify-between w-full h-[175px] border border-green bg-white rounded-[11px] shadow-[1px_3px_4px_0px_rgba(0,0,0,0.15)] p-[14px]">
      <div className='flex justify-between w-full'>
        <p className='text-base font-medium leading-[22px]'>Account Details</p>
        <div className='text-right'>
          <ToggleSwitchButton />
          <p className='text-[14px] font-medium leading-[22px]'>Auto-compound </p>
        </div>
      </div>
      <div className='flex justify-between w-full'>
        <div className='text-center'>
          <p className='text-base font-medium leading-[22px]'>Current Balance</p>
          <p className='text-[24px] font-bold leading-[30px]'>$ {balance}</p>
          <p className='text-[14px] text-gray font-medium leading-[22px]'>Currently Deposited</p>
        </div>
        <div className='text-center'>
          <p className='text-base font-medium leading-[22px]'>Available Yield</p>
          <p className='text-[24px] font-bold leading-[30px]'>$ {balance}</p>
          <p className='text-[14px] text-gray font-medium leading-[22px]'>Total earnings To date</p>
        </div>
      </div>
    </div>
  );
}
