'use client';

import Image from 'next/image';
import Progressbar from './Progressbar';

export default function CalcCard() {
  return (
    <div className="bg-white rounded-[32px] border border-green grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
      <div className='lg:col-span-2 px-[20px] lg:px-[62px] py-[30px]'>
        <p className="font-bold leading-[24px] text-gray text-[32px]">Calculate returns</p>
        <p className='text-gray mt-1'>Estimate your potential earnings with ease using our returns calculator. By simply entering your investment amount.</p>
        <div className='lg:flex justify-between mt-18'>
          <p className='font-bold mt-2'>Initial Investment</p>
          <div className='mt-2 w-full lg:w-[310px]'>
            <Progressbar progress={60} />
          </div>
          <p className='mt-2 font-bold text-green'>$3000</p>
        </div>
        <div className='flex gap-6 mt-20'>
          <div>
            <p className='text-[12px]'>Annual rent return</p>
            <p className='text-[18px] font-bold'>14.4%</p>
          </div>
          <div>
            <p className='text-[12px]'>Annual value growth</p>
            <p className='text-[18px] font-bold'>14.4%</p>
          </div>
          <div>
            <p className='text-[12px]'>Total annual return</p>
            <p className='text-[18px] font-bold'>14.4%</p>
          </div>
        </div>
      </div>
      <div className='lg:col-span-1 p-[20px] text-white bg-[linear-gradient(180deg,_#61CD81_30%,_#267E3D_100%)] md:justify-items-center'>
        <div className='md:w-[300px]'>
          <div className='text-center justify-items-center'>
            <Image
              src="/logo1.png"
              alt="contract"
              width={32}
              height={32}
              priority
            />
          <p className='font-bold text-[22px] mt-4'>Projected returns in 5 years</p>
          <p className='font-bold text-[40px] mt-1'>$5000</p>
          <button className="mt-6 h-[48px] flex w-full justify-center items-center gap-4 bg-white text-black rounded-[100px]">
            Invest Now 
            <Image
              src="/assets/right_icon.svg"
              alt="contract"
              width={14}
              height={14}
              priority
            />
          </button>
          </div>
          <p className='mt-4'>*Estimated annual returns, using yield statistics from all properties on the platform.</p>
        </div>
      </div>
    </div>
  );
}
