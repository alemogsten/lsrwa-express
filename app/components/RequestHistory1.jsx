'use client';

import { useEffect, useState } from 'react';
import clsx from "clsx";
import HistoryCard from "./HistoryCard";
import WalletConnectButton from "./WalletConnectButton";
import { useDepositorRequests } from "@/hooks/useDepositorRequests";

import { useAccount } from 'wagmi';
import axios from 'axios';


export default function RequestHistory() {
  const { address, isConnected } = useAccount();
  const { requests, isLoading } = useDepositorRequests(address);

  return (
    <div className={clsx('bg-white shadow-[1px_3px_4px_1px_rgba(0,0,0,0.12)] p-[24px] text-center h-full', isConnected ? 'rounded-[16px]' : 'rounded-[70px]')}>
      {isLoading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No active requests found.</p>
      ) :
        requests.map(history => (
          <HistoryCard key={history.requestId} isWithdraw={history.isWithdraw} timestamp={history.timestamp} id={history.requestId} amount={history.amount} status={history.processed ? 2 : 1} />  
        ))
      }
      <div className="mt-8 justify-items-center">
      <WalletConnectButton />
      </div>
    </div>
  );
}
