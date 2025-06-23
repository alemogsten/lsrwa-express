'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export default function RequestQueue() {
  const { address } = useAccount();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(VAULT_ADDRESS, vaultAbi, provider);

      const depositFilter = contract.filters.DepositRequested(null, address);
      const withdrawFilter = contract.filters.WithdrawRequested(null, address);

      const [deposits, withdrawals] = await Promise.all([
        contract.queryFilter(depositFilter),
        contract.queryFilter(withdrawFilter),
      ]);

      const formatted = [
        ...deposits.map((e) => ({
          id: Number(e.args.requestId),
          amount: ethers.formatUnits(e.args.amount, 6),
          timestamp: Number(e.args.timestamp),
          isWithdraw: false,
          processed: false,
        })),
        ...withdrawals.map((e) => ({
          id: Number(e.args.requestId),
          amount: ethers.formatUnits(e.args.amount, 6),
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
    <div className="p-4 bg-white shadow rounded-xl w-full">
      <h2 className="text-xl font-bold mb-4">📋 Request Queue</h2>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No active requests found.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((req) => (
            <li
              key={req.id}
              className="flex justify-between items-center p-4 rounded-md border border-gray-200 bg-gray-50"
            >
              <div>
                <p className="text-sm font-semibold">
                  {req.isWithdraw ? 'Withdraw' : 'Deposit'} #{req.id}
                </p>
                <p className="text-xs text-gray-600">
                  {format(new Date(req.timestamp * 1000), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">${req.amount}</p>
                {req.processed && (
                  <p className="text-xs text-gray-500">✅ Processed</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
