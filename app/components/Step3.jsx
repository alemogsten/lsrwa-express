'use client';

import Image from 'next/image';

export default function Step3() {
  return (
    <div className='w-full flex flex-col justify-between rounded-[22px] h-[354px] px-[16px] py-[35px] bg-[linear-gradient(180deg,_#61CD81_30%,_#267E3D_100%)] overflow-hidden text-white items-center'>
      <p className='flex gap-2 font-bold text-[24px]'>
        <Image src="/assets/3.svg"
            alt="contract"
            width={22}
            height={22}
            priority />
          Hold & Earn
      </p>
      <div className='flex flex-col justify-between rounded-[9px] px-[14px] py-[13px] w-[220px] lg:w-full h-[153px] bg-white overflow-hidden text-black'>
         <p className='font-bold text-base leading-[20px]'>Grow Over Time</p>
          <p className='text-[8px] leading-[14px]'>View current properties for sale including pictures, financials, and return estimates</p>
          <Image src="/assets/chart.png"
            alt="contract"
            width={192}
            height={92}
            className='w-full'
            priority />
      </div>
      <button className="h-[48px] flex w-full justify-center items-center gap-4 bg-white text-black font-medium rounded-[100px]">
        Learn More
      </button>
    </div>
  );
}
