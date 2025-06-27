'use client';

import { useState } from 'react';
import clsx from "clsx";
import { format } from 'date-fns';
import Image from 'next/image';
import { ethers } from "ethers";

import { connectWallet } from "@/utils/wallet";
import vaultAbi from "@/abis/Vault.json";


export default function HistoryCard({ isWithdraw, id, timestamp, amount, processed, fetchRequests, executed }) {
  const [cancelling, setCancelling] = useState(false);
  const [receiving, setReceiving] = useState(false);

  
  const cancelDeposit = async () => {
    if (cancelling) return;
    const { signer } = await connectWallet();
      try {
        if (!signer) return alert("Connect wallet first");
        setCancelling(true);
  
        const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);
        const tx = await vault.cancelDepositRequest(BigInt(id));
        await tx.wait();
        
        setCancelling(false);
        fetchRequests();
      } catch (err) {
        setCancelling(false);
        alert('Failed deposit cancel:' + (err?.reason || err?.message));
      }
    }

    const executeWithdraw = async () => {
      if(receiving) return;
      try {
        const { signer } = await connectWallet();
        if (!signer) return alert("Connect wallet first");
        setReceiving(true);
        
          const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);
          const tx = await vault.executeWithdraw(BigInt(id));
          await tx.wait();
          setReceiving(false);
          alert("Withdraw executed!");
          fetchRequests();
        } catch (err) {
          console.error(err);
          setReceiving(false);
          alert("Error: " + (err?.reason || err?.message));
        }
      };

  return (
    <div className="flex gap-2 items-center">
      <div className="mt-6 flex items-center w-full justify-between bg-[#F6F8F9] rounded-[12px] py-[8px] px-[12px]">
        <div className="flex items-center gap-10">
          <div className={clsx('w-[116px] border border-solid rounded-[100px] px-[21px] py-[2px]', !isWithdraw ? 'border-[#61CD81] bg-[#E6F7EB] text-[#239942]' : 'border-[#E151414D] bg-[#E1514129] text-[#E15141]')}>
            <p className="text-base leading-[22px] font-medium">{!isWithdraw ? 'Deposit' : 'Withdraw'}</p>
          </div>
          <div>
            <p className="text-base leading-[19px] font-bold text-black">Request id {id}</p>
            <p className="text-base leading-[30px] text-gray">{format(new Date(timestamp * 1000), 'MMMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="mt-2 text-right text-[18px] font-bold leading-[22px] text-black">${amount}</p>
          <div className={clsx('rounded-[100px] px-[12px] py-[2px]', !processed ? 'bg-[#E0710333] text-[#E07103]' : 'bg-[#E6F7EB] text-[#239942]' )}>
            <p className="flex gap-1 text-base leading-[14px] font-medium">
              {!processed && <Image src="/assets/clock.svg" alt="Plus Icon" width={12} height={12} />}
              {!processed ? 'Pending' : 'Completed'}</p>
          </div>
        </div>
      </div>
      {
        !isWithdraw && !processed &&
        <button className="mt-6 flex flex-col items-center space-y-2 hover:opacity-80 transition disabled:opacity-50"
        disabled={cancelling}
        onClick={cancelDeposit}>
          <Image
            src="/assets/cancel.png"
            alt="Icon"
            width={20} height={20}
            className="rounded-full object-cover"
          />
          <span className="text-[12px] text-gray">{cancelling ? 'Canceling' : 'Cancel'}</span>
        </button>
      }
      {
        isWithdraw && processed && !executed && <button className="mt-6 flex flex-col items-center space-y-2 hover:opacity-80 transition disabled:opacity-50 bg-green-300 text-white py-1 px-2 rounded-full"
        disabled={receiving}
        onClick={executeWithdraw}>{receiving ? 'Receiving' : 'Receive'}</button>
      }
    </div>
  );
}
