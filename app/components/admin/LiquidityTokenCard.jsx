'use client';

import { useState } from 'react';
import { ethers } from "ethers";
import { formatNumber } from '@/utils/helper';
import { useAdminSummary } from '@/hooks/useAdminSummary';
import { connectWallet } from "@/utils/wallet";
import vaultAbi from '@/abis/Vault.json';

export default function LiquidityTokenCard() {

  const {borrowingUSDC, poolLSRWA, repaymentRequired, refetch} = useAdminSummary();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  const handleLiquidate = async () => {
    setLoading(true);
    try {
      const {signer} = await connectWallet();
      const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);
      
      let borrowers = [];
      const borrowEvents = await vault.queryFilter("BorrowRequested", 0, "latest");
      
      for (const event of borrowEvents) {
        const { originator, amount } = event.args;
        borrowers.push(originator);
      }
      const pending = false;
      const [borrowerList] = await vault.getUnpaidBorrowList(borrowers, pending);
  
      const tx = await vault.liquidateCollateral(address, [...borrowerList]);
      await tx.wait();
      refetch();
      setAddress('');
      
    } catch (error) {
      alert("Failed: "+error.message);
    }
      
    setLoading(false);
  }

  return (
    <div className="p-4 shadow bg-white rounded-xl flex justify-between">
      <div>
        <p className="text-base font-medium">Pool LSRWA</p>
        <p className='text-lg font-bold'>{poolLSRWA ? formatNumber(poolLSRWA) : '0.0'}</p>
      </div>
      <div className='flex flex-col'>
        {borrowingUSDC > 0 && repaymentRequired 
        && <>
          <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" placeholder="Enter address" className='px-2 py-1 border border-gray-300 rounded-sm' />
          <button disabled={loading} onClick={handleLiquidate} className='mt-1 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50'>{loading ? 'Loading' : 'Liquidate Collateral'}</button>
          </> }
      </div>
    </div>
  );
}
