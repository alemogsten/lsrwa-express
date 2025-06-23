'use client';

import Image from 'next/image';

export default function Step1() {
  return (
    <div className='w-full flex flex-col justify-between rounded-[22px] h-[354px] px-[16px] py-[35px] bg-[linear-gradient(180deg,_#61CD81_30%,_#267E3D_100%)] overflow-hidden text-white items-center'>
      <p className='flex gap-2 font-bold text-[24px]'>
        <Image src="/assets/1.svg"
            alt="contract"
            width={22}
            height={22}
            priority />
          Sign Up
      </p>
      <div className='flex flex-col justify-between rounded-[9px] px-[14px] py-[13px] w-[220px] lg:w-full h-[180px] bg-white overflow-hidden text-black'>
        <p className='text-center py-[6px] border border-[#E4E4E7] rounded-[5px]'>Email Address</p>
        <p className='text-center py-[6px] border border-[#E4E4E7] rounded-[5px]'>Create Password</p>
        <p className='text-center py-[6px] bg-green rounded-[5px] text-white'>Sign In</p>
        <div className='justify-items-center'>
        <p className="flex gap-2 font-medium text-[8px] items-center">
          <Image src="/assets/google.svg"
            alt="contract"
            width={10}
            height={10}
            priority />
            Sign in with Google
          </p>
        </div>
      </div>
      <button className="h-[48px] flex w-full justify-center items-center gap-4 bg-white text-black font-medium rounded-[100px]">
        Verify Now!
      </button>
    </div>
  );
}
