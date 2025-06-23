'use client';

import Image from 'next/image';

export default function TradeInfoCard({ title, value }) {
  return (
    <div className="bg-white rounded-[16px] shadow-[1px_3px_4px_1px_rgba(0,0,0,0.12)] p-[24px]">
      <p className="font-medium leading-[22px] text-gray">{title}</p>
      <div className='flex gap-2 items-center mt-2'>
        <Image
          src="/assets/refresh.svg"
          alt="contract"
          width={32}
          height={32}
          priority
        />
        <p className="mt-2 text-[24px] leading-[30px] font-bold">{value}</p>
      </div>
    </div>
  );
}
