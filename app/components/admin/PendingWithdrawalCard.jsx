'use client';

import { useState, useEffect } from 'react';
import { formatNumber } from '@/utils/helper';
import { useRequests } from '@/hooks/useRequests';
import { connectWallet } from "@/utils/wallet";

export default function PendingWithdrawalCard() {
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const {fetchRequests} = useRequests();

  useEffect(() => {
    const fetchRequest = async () => {
      const { signer } = await connectWallet();
        const {data, total} = await fetchRequests(signer, 2, false, 0);
        
        var amount = 0;
        data.forEach(element => {
          amount += parseFloat(element.amount);
        });
        setWithdrawAmount(amount);
    };

    fetchRequest();
}, []);


  return (
    <div className="p-4 shadow bg-white rounded-xl">
      <p className="text-base font-medium">Pending Withdrawal Amount</p>
      <p className='text-lg font-bold'>{formatNumber(withdrawAmount)}</p>
    </div>
  );
}
