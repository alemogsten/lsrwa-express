'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function WalletInfoCard() {
  const {
    address,
    isConnected,
    disconnect,
    tokenBalance,
    symbol,
    isBalanceLoading,
  } = useWallet();

  const [isVisible, setIsVisible] = useState(false);

  const router = useRouter();

  const handleDepositClick = () => {
    router.push('/originator/deposit');
  };
  const handleBorrowClick = () => {
    router.push('/originator/borrow');
  };
  const handleSwapClick = () => {
    router.push('/swap');
  };
  const handleDisplayClick = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="bg-gradient-to-b from-[#61CD81] to-[#239942] rounded-[20px] shadow-[1px_3px_4px_0px_rgba(0,0,0,0.15)] p-[24px] text-white">
      <div className="relative w-max">
        <button type="button" id="dropdownToggle"
        onClick={handleDisplayClick}
          className="flex gap-2 items-center bg-[#61CD81] px-[4px] py-[2px] rounded-full text-white text-base font-medium  cursor-pointer">
          <Image
            src="/assets/contract.png"
            alt="contract"
            width={24}
            height={24}
            priority
          />
          <p>{address.slice(0, 6)}...{address.slice(-4)}</p>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 fill-white inline ml-3" viewBox="0 0 24 24">
            <path fillRule="evenodd"
              d="M11.99997 18.1669a2.38 2.38 0 0 1-1.68266-.69733l-9.52-9.52a2.38 2.38 0 1 1 3.36532-3.36532l7.83734 7.83734 7.83734-7.83734a2.38 2.38 0 1 1 3.36532 3.36532l-9.52 9.52a2.38 2.38 0 0 1-1.68266.69734z"
              clipRule="evenodd" data-original="#000000" />
          </svg>
        </button>

        <ul id="dropdownMenu" className={`absolute ${isVisible ? '' : 'hidden'} [box-shadow:0_8px_19px_-7px_rgba(6,81,237,0.2)] bg-white py-2 z-[1000] min-w-full w-max divide-y divide-gray-300 max-h-96 overflow-auto`}>
          <li className="dropdown-item py-2.5 px-5 flex items-center hover:bg-slate-100 text-slate-900 text-sm cursor-pointer" onClick={disconnect}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3"
              viewBox="0 0 6.35 6.35">
              <path
                d="M3.172.53a.265.266 0 0 0-.262.268v2.127a.265.266 0 0 0 .53 0V.798A.265.266 0 0 0 3.172.53zm1.544.532a.265.266 0 0 0-.026 0 .265.266 0 0 0-.147.47c.459.391.749.973.749 1.626 0 1.18-.944 2.131-2.116 2.131A2.12 2.12 0 0 1 1.06 3.16c0-.65.286-1.228.74-1.62a.265.266 0 1 0-.344-.404A2.667 2.667 0 0 0 .53 3.158a2.66 2.66 0 0 0 2.647 2.663 2.657 2.657 0 0 0 2.645-2.663c0-.812-.363-1.542-.936-2.03a.265.266 0 0 0-.17-.066z"
                data-original="#000000"></path>
            </svg>
            Disconnect
          </li>
        </ul>
        
      </div>
      <p className='text-[14px] leading-[22px] mt-6'>Your Balance</p>
      <p className='text-[46px] leading-[56px]'>{isConnected ? tokenBalance : 0}</p>
      <div className=' flex  w-max gap-1 items-center bg-[#61CD81] px-[9px] py-[3px] rounded-full text-white'>
        <Image
          src="/assets/invest_hand.png"
          alt="contract"
          width={14}
          height={14}
          priority
        />
        <label htmlFor="">+123$</label>
        <label htmlFor="">(10.53%)</label>
      </div>
      <div className='mt-6 flex justify-center items-center h-[133px] w-full px-2 border border-solid border-transparent rounded-[15px]' 
        style={{
        background: 'linear-gradient(90.37deg, rgba(255, 255, 255, 0.24) 0.16%, rgba(255, 255, 255, 0.12) 99.92%)',
        // borderWidth: '1px',
        // borderImageSource: 'linear-gradient(90.61deg, rgba(255, 255, 255, 0.3) 1.27%, rgba(255, 255, 255, 0.3) 100%)',
        // borderImageSlice: '1',
        // borderRadius: '15px'
      }}>
        <div className='flex justify-between md:w-[400px] w-full'>
          <button className="flex flex-col items-center group" onClick={handleDepositClick}>
            <div className="w-[64px] h-[64px] rounded-full bg-green flex items-center justify-center transition-colors duration-300 group-hover:bg-[#131B3F] overflow-hidden">
              <Image
                src="/assets/plus.png"
                alt="Plus"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="font-medium text-white">Deposit</span>
          </button>
          <button className="flex flex-col items-center group" onClick={handleBorrowClick}>
            <div className="w-[64px] h-[64px] rounded-full bg-green flex items-center justify-center transition-colors duration-300 group-hover:bg-[#131B3F] overflow-hidden">
              <Image
                src="/assets/down.png"
                alt="Plus"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="font-medium text-white">Borrow</span>
          </button>
          <button className="flex flex-col items-center group" onClick={handleSwapClick}>
            <div className="w-[64px] h-[64px] rounded-full bg-green flex items-center justify-center transition-colors duration-300 group-hover:bg-[#131B3F] overflow-hidden">
              <Image
                src="/assets/swap.png"
                alt="Plus"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="font-medium text-white">Harvest Interest</span>
          </button>
        </div>
      </div>
    </div>
  );
}
