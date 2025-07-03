'use client';

import EpochProgressBar from "./EpochProgressBar";

export default function EpochInfoCard() {

  return (
    <div className="flex flex-col justify-between w-full bg-white rounded-[11px] shadow-[1px_3px_4px_0px_rgba(0,0,0,0.15)] p-[14px]">
      <p className='text-[24px] font-bold leading-[30px]'>Epoch Information</p>
      <p className='text-gray font-medium leading-[20px]'>At LSRWA Express, we operate in weekly epochs that process deposits, withdrawals, and borrowing in an orderly cycle. This ensures fairness and liquidity availability for everyone,</p>
      <EpochProgressBar />
    </div>
  );
}
