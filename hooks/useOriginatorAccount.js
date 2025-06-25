'use client';

import { useAccount, useReadContracts } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export function useOriginatorAccount() {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'collateralDeposits',
        args: [address],
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'borrowRequests',
        args: [address],
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!address,
    },
  });

  const deposited = data?.[0] ?? 0n;
  const borrowRequest = data?.[2] ?? null;

  return {
    deposited,
    borrowRequest,
    isLoading,
    error,
  };
}
