'use client';

import { useEffect, useState } from 'react';
import clsx from "clsx";
import HistoryCard from "./HistoryCard";
import WalletConnectButton from "./WalletConnectButton";
import { useRequests } from '@/hooks/useRequests';
import { connectWallet } from "@/utils/wallet";

import { useAccount } from 'wagmi';


export default function RequestHistory() {
  
  const {fetchRequests} = useRequests();
  const { address, isConnected } = useAccount();
  

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    
  
    useEffect(() => {
      if (!isConnected || !address) return;
      fetchRequest();
    }, [address, isConnected]);
    
    const fetchRequest = async () => {
      const { signer } = await connectWallet();
      setLoading(true);
      const {data, total} = await fetchRequests(signer, 0,false, 1, 10, address, false);
      setRequests(data)
      setLoading(false)
    }

  return (
    <div className={clsx('bg-white shadow-[1px_3px_4px_1px_rgba(0,0,0,0.12)] p-[24px] text-center h-full', isConnected ? 'rounded-[16px]' : 'rounded-[70px]')}>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No active requests found.</p>
      ) :
        requests.map(history => (
          <HistoryCard fetchRequests={fetchRequest} key={history.requestId} isWithdraw={history.isWithdraw} timestamp={history.timestamp} id={history.requestId} amount={history.amount} processed={history.processed} executed={history.executed} />  
        ))
      }
      <div className="mt-8 justify-items-center">
      <WalletConnectButton />
      </div>
    </div>
  );
}
