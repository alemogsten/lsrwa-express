'use client';

import { useOriginatorAccount } from '@/hooks/useOriginatorAccount';

export default function AccountCard() {

  const { 
    deposited, 
    borrowed,
    repaymentRequiredEpochId,
    maxEpochsBeforeLiquidation,
    currentEpochId,
    repaid, 
    writeRepay,
    repaying,
    repayStatus,
    isLoading
   } = useOriginatorAccount();


  const handleRepay = async () => {
    await writeRepay();
    alert(repayStatus);
  };

  return (
      <div className="flex flex-col justify-between gap-6 w-full min-h-[175px] border border-green bg-white rounded-[11px] shadow-[1px_3px_4px_0px_rgba(0,0,0,0.15)] p-[14px]">
        <div className='flex justify-between w-full'>
          <p className='text-base font-medium leading-[22px]'>Account Details</p>
          {borrowed > 0 && <button onClick={handleRepay} disabled={repaying} className='bg-blue-500 text-white py-1 px-2 rounded disabled:opacity-50'>{repaying?'Repaying':'Repay'}</button>}
        </div>
        <div className='flex justify-between w-full'>
          <div className='text-center'>
            <p className='text-base font-medium leading-[22px]'>Current Balance</p>
            <p className='text-[24px] font-bold leading-[30px]'>{isLoading ? 0 : deposited}</p>
            <p className='text-[14px] text-gray font-medium leading-[22px]'>Currently Deposited</p>
          </div>
          <div className='text-center'>
            <p className='text-base font-medium leading-[22px]'>Current Balance</p>
            <p className='text-[24px] font-bold leading-[30px]'>$ {isLoading ? 0 : borrowed}</p>
            <p className='text-[14px] text-gray font-medium leading-[22px]'>Currently Borrowed</p>
          </div>
        </div>
        {repaid && <div>
          <p className='text-red-600 text-right'>Repayment required</p>
         <p className='text-right'>Until liquidate collaterals, Epoch remained:  {Math.max(0, maxEpochsBeforeLiquidation-(currentEpochId-repaymentRequiredEpochId))}</p>
        </div>}
      </div>
  );
}
