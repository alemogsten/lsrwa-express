'use client';

import Image from 'next/image';
import AssetCard from './AssetCard';

export default function BeneficalAssets() {
  return (
    <div className='lg:bg-white w-full px-[16px] md:p-[46px] xl:p-[120px]'>
      <div className="flex items-center gap-[10px] p-[6px] pr-[20px] bg-[#F6F8F9] rounded-[50px] w-max">
        <Image
          src="/assets/unlock.svg"
          alt="Logo"
          width={32}
          height={32}
          priority
        />
        <p className="font-medium">Unlock your opportunity</p>
      </div>
      <div className='mt-6 xl:flex justify-between items-center'>
        <p className='font-bold text-[24px] sm:text-[32px] lg:text-[54px] leading-[64px] lg:whitespace-nowrap'>Our Benefical Assets</p>
        <div className='flex gap-2'>
          <div className='mt-1'>
          <Image
              src="/assets/info.svg"
              alt="Logo"
              width={22}
              height={22}
              priority
            />
          </div>
          <div>
            <p className='flex gap-1 text-gray xl:w-[500px]'>
              Discover the value of investing in real, tangible assets with Landshare. Our portfolio of beneficial assets includes high-quality real estate properties
            </p>
            <p className='text-green font-bold mt-1'>Learn more</p>
          </div>
        </div>
      </div>
      <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
        <AssetCard />
        <AssetCard />
        <AssetCard />
      </div>
    </div>
  );
}
