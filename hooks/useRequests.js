'use client';

import { useReadContract } from 'wagmi';
import { formatUnits } from "ethers";
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export function useRequests() {

  const { data: currentValue, refetch, isLoading: isReading } = useReadContract({
      address: VAULT_ADDRESS,
      abi: vaultAbi,
      functionName: 'requestCounter',
    });

  const fetchRequests = async (kind, processed, page, limit, owner, isAdmin) => {
    const { data: requests, isLoading, error } = useReadContracts({
      contracts: [
        {
          abi: vaultAbi,
          address: VAULT_ADDRESS,
          functionName: 'getRequests',
          args: [kind, processed, page, limit, owner, isAdmin]
        }
      ],
      allowFailure: false,
    });
    console.log('requests', requests);
    return {requests, isLoading, error}
  }

  return {
    fetchRequests,
  };
}
