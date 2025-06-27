'use client';

import { useState, useEffect } from 'react';

export default function PendingWithdrawalCard() {
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
        const params = new URLSearchParams({
            status: 'pending',
            type: 'withdraw',
        });

        const res = await fetch(`/api/admin/requests?${params}`);
        const json = await res.json();
        const data = json.data;
        var amount = 0;
        data.forEach(element => {
          amount += parseInt(element.amount);
        });
        setWithdrawAmount(amount);
    };

    fetchRequests();
}, []);


  return (
    <div className="p-4 shadow bg-white rounded-xl">
      <p className="text-base font-medium">Pending Withdrawal Amount</p>
      <p className='text-lg font-bold'>{withdrawAmount}</p>
    </div>
  );
}
