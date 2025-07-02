'use client';

import {useState} from 'react';
import { ethers } from "ethers";
import { connectWallet } from "@/utils/wallet";
import { useWallet } from "@/hooks/useWallet";
import { useOriginatorAccount } from '@/hooks/useOriginatorAccount';
import { useSettings } from '@/hooks/useSettings';
import erc20Abi from "@/abis/ERC20.json";
import vaultAbi from "@/abis/Vault.json";

export default function AccountCard() {

  const [repaying, setRepayLoading] = useState(false);
  const {isConnected} = useWallet();

  const { 
    deposited, 
    borrowed,
    repaymentRequiredEpochId,
    currentEpochId,
    repaid, 
    refetch,
    isLoading
   } = useOriginatorAccount();

  const {maxEpochsBeforeLiquidation} = useSettings();

  const handleRepay = async () => {
    try {
          const { signer } = await connectWallet();
          if (!isConnected) return alert("Wallet not connected");

          setRepayLoading(true);

          const usdc = new ethers.Contract(process.env.NEXT_PUBLIC_USDC_ADDRESS, erc20Abi, signer);
          const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);
    
          const owner = await signer.getAddress();
          const allowance = await usdc.allowance(owner, process.env.NEXT_PUBLIC_VAULT_ADDRESS);
          const parsedAmount = ethers.parseUnits(borrowed, parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS));
          if (allowance < parsedAmount) {
            const approveTx = await usdc.approve(process.env.NEXT_PUBLIC_VAULT_ADDRESS, parsedAmount);
            await approveTx.wait();
          }
    
          const repayTx = await vault.repayBorrow();
          await repayTx.wait();
          alert('Repaid successfully');
          refetch();
        } catch (error) {
          console.error(error);
          alert("Error: " + (error?.reason || error?.message));
        } finally {
          setRepayLoading(false);
        }
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
