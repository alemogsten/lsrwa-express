'use client';

import { useState } from 'react';
import { ethers } from "ethers";
import { formatNumber } from '@/utils/helper';
import { useAdminSummary } from '@/hooks/useAdminSummary';
import { connectWallet } from "@/utils/wallet";
import vaultAbi from '@/abis/Vault.json';

export default function LendingCard() {

  const {borrowingUSDC, repaymentRequired, refetch} = useAdminSummary();

  const [loading, setLoading] = useState(false);

  const handleRepayment = async () => {
    setLoading(true);
    try {
      
      const {signer} = await connectWallet();
      const vault = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, signer);
      const tx = await vault.RequireRepay();
      await tx.wait();
      alert('Required repayment successfully.')
      refetch();
    } catch (error) {
      alert("Failed: "+error.message);
    }
    setLoading(false);
  }

  return (
    <div className="p-4 shadow bg-white rounded-xl flex justify-between">
      <div>
        <p className="text-base font-medium">Lending USDC</p>
        <p className='text-lg font-bold'>{borrowingUSDC ? formatNumber(borrowingUSDC) : '0.0'}</p>
      </div>
      <div>
      {borrowingUSDC > 0 && repaymentRequired ? <p className='text-red-500'>Required repayment</p> :
          <button onClick={handleRepayment} disabled={loading || borrowingUSDC == 0} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50'>{loading?'Doing require':'Require Repayment'}</button> 
      }
      </div>
    </div>
  );
}
