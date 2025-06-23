'use client';

import Image from 'next/image';

export default function Step2() {
  return (
    <div className='w-full flex flex-col justify-between rounded-[22px] h-[354px] px-[16px] py-[35px] bg-[linear-gradient(180deg,_#61CD81_30%,_#267E3D_100%)] overflow-hidden text-white items-center'>
      <p className='flex gap-2 font-bold text-[24px] whitespace-nowrap'>
        <Image src="/assets/2.svg"
            alt="contract"
            width={22}
            height={22}
            priority />
          Purchase Tokens
      </p>
      <div className='flex flex-col justify-between rounded-[9px] px-[14px] py-[13px] w-[220px] lg:w-full h-[115px] bg-white overflow-hidden text-black'>
        <p className='font-bold text-base leading-[20px]'>Swap Token</p>
        <p className='text-gray text-[9px] leading-[15px]'>Trade tokens in an instant</p>
        <div className='flex gap-4'>
          <button className="h-[33px] flex w-full justify-center items-center gap-4 bg-[#F6F8F9] text-black font-medium rounded-[100px]">
            Buy
          </button>
          <button className="h-[33px] flex w-full justify-center items-center gap-4 bg-[#0A1339] text-white font-medium rounded-[100px]">
            Sell
          </button>
        </div>
      </div>
      <button className="h-[48px] flex w-full justify-center items-center gap-4 bg-white text-black font-medium rounded-[100px]">
        View Details
      </button>
    </div>
  );
}
