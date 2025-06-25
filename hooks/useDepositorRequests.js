'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';
import { formatUnits } from 'ethers';

const decimals = parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6');
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export function useDepositorRequests(address=undefined) {

  const { data: depositCount, isLoading: loadingDeposits } = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: 'depositCounter',
  });

  const {
    data: withdrawCount,
    isLoading: loadingWithdraws,
  } = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: 'withdrawCounter',
  });


  const depositCalls = Array.from({ length: Number(depositCount || 0) }, (_, i) => ({
    address: VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: 'depositRequests',
    args: [BigInt(i + 1)],
  }));

  const withdrawCalls = Array.from({ length: Number(withdrawCount || 0) }, (_, i) => ({
    address: VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: 'withdrawRequests',
    args: [BigInt(i + 1)],
  }));

  const { data: combinedData, isLoading, error } = useReadContracts({
    contracts: [...depositCalls, ...withdrawCalls],
  });

  const deposits = combinedData
    ?.slice(0, depositCalls.length)
    .map((r, i) => ({
      isWithdraw: false,
      requestId: i + 1,
      user: r.result[0],
      amount: formatUnits(r.result[1], decimals),
      timestamp: parseInt(r.result[2]),
      process: r.result[3],
    }))
    .filter((r) => address && r.user?.toLowerCase() === address?.toLowerCase());

  const withdrawals = combinedData
    ?.slice(depositCalls.length)
    .map((r, i) => ({
      isWithdraw: true,
      requestId: i + 1,
      user: r.result[0],
      amount: formatUnits(r.result[1], decimals),
      timestamp: parseInt(r.result[2]),
      process: r.result[3],
    }))
    .filter((r) => address && r.user?.toLowerCase() === address?.toLowerCase());

  return {
    isLoading: isLoading || loadingDeposits || loadingWithdraws,
    error,
    requests: [...(deposits || []), ...(withdrawals || [])].sort(
      (a, b) => Number(b.timestamp) - Number(a.timestamp)
    ),
  };
}
