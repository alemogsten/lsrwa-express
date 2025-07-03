'use client';

import { useEffect, useState } from 'react';
import clsx from "clsx";
import HistoryCard from "./HistoryCard";
import WalletConnectButton from "./WalletConnectButton";


import { useAccount } from 'wagmi';
import axios from 'axios';


export default function RequestHistory() {
  const { address, isConnected } = useAccount();
  

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    
  
    useEffect(() => {
      if (!isConnected || !address) return;

      setLoading(true);
      fetchRequests();
    }, [address, isConnected]);

    const fetchRequests = () => {
      axios
        .post('/api/requests', { address })
        .then((res) => setRequests(res.data.requests))
        .finally(() => setLoading(false));
    }

    

  return (
    <div className={clsx('bg-white shadow-[1px_3px_4px_1px_rgba(0,0,0,0.12)] p-[24px] text-center h-full', isConnected ? 'rounded-[16px]' : 'rounded-[70px]')}>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No active requests found.</p>
      ) :
        requests.map(history => (
          <HistoryCard fetchRequests={fetchRequests} key={history.requestId} isWithdraw={history.isWithdraw} timestamp={history.timestamp} id={history.requestId} amount={history.amount} processed={history.processed} executed={history.executed} />  
        ))
      }
      <div className="mt-8 justify-items-center">
      <WalletConnectButton />
      </div>
    </div>
  );
}
