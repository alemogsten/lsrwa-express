'use client';

import { useEffect, useState } from 'react';
import clsx from "clsx";
import HistoryCard from "./HistoryCard";
import WalletConnectButton from "./WalletConnectButton";

import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';


export default function RequestHistory({isConnected}) {
  const { address } = useAccount();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const loadRequests = async () => {
      setLoading(true);
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_VAULT_ADDRESS, vaultAbi, provider);

        const deposits = await contract.queryFilter(
          contract.filters.DepositRequested(null, address)
        );
        const withdrawals = await contract.queryFilter(
          contract.filters.WithdrawRequested(null, address)
        );
  
        const formatted = [
          ...deposits.map((e) => ({
            id: Number(e.args.requestId),
            amount: ethers.formatUnits(e.args.amount, parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)),
            timestamp: Number(e.args.timestamp),
            isWithdraw: false,
            processed: false,
          })),
          ...withdrawals.map((e) => ({
            id: Number(e.args.requestId),
            amount: ethers.formatUnits(e.args.amount, parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)),
            timestamp: Number(e.args.timestamp),
            isWithdraw: true,
            processed: false,
          })),
        ].sort((a, b) => a.timestamp - b.timestamp);
  
        setRequests(formatted);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
  
    useEffect(() => {
      if (address) loadRequests();
    }, [address]);

  return (
    <div className={clsx('bg-white shadow-[1px_3px_4px_1px_rgba(0,0,0,0.12)] p-[24px] text-center h-full', isConnected ? 'rounded-[16px]' : 'rounded-[70px]')}>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No active requests found.</p>
      ) :
        requests.map(history => (
          <HistoryCard key={history.id} isWithdraw={history.isWithdraw} timestamp={history.timestamp} id={history.id} amount={history.amount} status={history.processed ? 2 : 1} />  
        ))
      }
      <div className="mt-8 justify-items-center">
      <WalletConnectButton />
      </div>
    </div>
  );
}
