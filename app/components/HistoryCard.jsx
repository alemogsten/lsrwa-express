'use client';

import clsx from "clsx";
import { format } from 'date-fns';
import Image from 'next/image';


export default function HistoryCard({ type, id, timestamp, amount, status }) {
   const handleCancelClick = () => {
      console.log(id);
    };
  return (
    <div className="flex gap-2 items-center">
      <div className="mt-6 flex items-center w-full justify-between bg-[#F6F8F9] rounded-[12px] py-[8px] px-[12px]">
        <div className="flex items-center gap-10">
          <div className={clsx('w-[116px] border border-solid rounded-[100px] px-[21px] py-[2px]', type === 1 ? 'border-[#61CD81] bg-[#E6F7EB] text-[#239942]' : 'border-[#E151414D] bg-[#E1514129] text-[#E15141]')}>
            <p className="text-base leading-[22px] font-medium">{type === 1? 'Deposit' : 'Withdraw'}</p>
          </div>
          <div>
            <p className="text-base leading-[19px] font-bold text-black">Request id {id}</p>
            <p className="text-base leading-[30px] text-gray">{format(new Date(timestamp * 1000), 'MMMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="mt-2 text-right text-[18px] font-bold leading-[22px] text-black">${amount}</p>
          <div className={clsx('rounded-[100px] px-[12px] py-[2px]', status === 1 ? 'bg-[#E0710333] text-[#E07103]' : (status === 2 ? 'bg-[#E6F7EB] text-[#239942]' : 'bg-[#E1514129] text-[#E15141]'))}>
            <p className="flex gap-1 text-base leading-[14px] font-medium">
              {status === 1 && <Image src="/assets/clock.svg" alt="Plus Icon" width={12} height={12} />}
              {status === 1? 'Pending' : (status === 2? 'Completed' : 'Failed')}</p>
          </div>
        </div>
      </div>
      {
        status === 1 &&
        <button className="mt-6 flex flex-col items-center space-y-2 hover:opacity-80 transition"
        onClick={handleCancelClick}>
          <Image
            src="/assets/cancel.png"
            alt="Icon"
            width={20} height={20}
            className="rounded-full object-cover"
          />
          <span className="text-[12px] text-gray">Cancel</span>
        </button>
      }
    </div>
  );
}
