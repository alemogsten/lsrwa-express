'use client';

import Image from 'next/image';

export default function AssetCard() {

  return (
    <div className='relative  w-full   mx-auto'>
        <div className="aspect-[3/2] rounded-tl-[24px] rounded-tr-[24px] overflow-hidden w-full">
          <Image
              src="/assets/asset_placeholder.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-full h-full object-cover"
              priority
            />
        </div>
        <p className='absolute top-[30px] left-[24px] text-white text-[12px] flex gap-2 items-center'>
          <Image
              src="/assets/map_pointer.svg"
              alt="Logo"
              width={20}
              height={20}
              priority
            />
          3406 Parkview DriveRapid City,...</p>
        <p className='absolute top-[45px] right-[-10px] text-white text-[12px] font-bold px-[15px] py-[4px] bg-[#FF5454] rounded-tl-[100px] rounded-tr-[50px] rounded-br-[50px] rounded-bl-[100px]'>
          Rental Property</p>
        <div className='p-[24px] bg-[#F7FCFC] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]'>
          <div className='flex justify-between'>
            <div>
              <p className='text-gray text-[12px]'>Total Investment</p>
              <p className='font-bold text-[18px]'>$1234</p>
            </div>
            <div>
              <p className='text-gray text-[12px]'>APR Equivalen</p>
              <p className='font-bold text-[18px]'>27% - 52%</p>
            </div>
            <div>
              <p className='text-gray text-[12px]'>Token Price</p>
              <p className='font-bold text-[18px]'>$1234</p>
            </div>
          </div>
          <div className='flex mt-[24px] justify-between items-center'>
            <p className='font-medium text-[#428B58] bg-[#F4FCF6] rounded-full px-[16px] py-[4px]'>Single Family</p>
            <div className='flex gap-4'>
              <p className='flex gap-2 font-medium items-center'>
                <Image
                  src="/assets/Sofa.svg"
                  alt="Logo"
                  width={20}
                  height={20}
                  priority
                />4
              </p>
              <p className='flex gap-2 font-medium items-center'>
                <Image
                  src="/assets/Spoon.svg"
                  alt="Logo"
                  width={20}
                  height={20}
                  priority
                />1
              </p>
              <p className='flex gap-2 font-medium items-center'>
                <Image
                  src="/assets/Bathroom.svg"
                  alt="Logo"
                  width={20}
                  height={20}
                  priority
                />2
              </p>
              <p className='p-[12px] rounded-full bg-[#F0FAF9] text-green text-[12px] font-medium'>+2</p>
            </div>
          </div>
        </div>
        <div className='h-[56px] bg-green flex justify-between items-center p-[24px] rounded-bl-[24px] rounded-br-[24px]'>
          <p className='text-base text-white font-bold'>LSRWA Holders Earn</p>
          <p className='text-base text-white font-bold'>$20</p>
        </div>
    </div>
  );
}
