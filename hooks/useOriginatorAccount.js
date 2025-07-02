'use client';

import { useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from "ethers";
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export function useOriginatorAccount() {
  const { address } = useAccount();

  const { data, isLoading, refetch, error } = useReadContracts({
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
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'collateralRatio',
      },
      {
        abi: vaultAbi,
        address: VAULT_ADDRESS,
        functionName: 'repaymentRequiredEpochId',
      },
      {
        abi: vaultAbi,
        address: VAULT_ADDRESS,
        functionName: 'currentEpochId',
      }
    ],
    allowFailure: false,
    query: {
      enabled: !!address,
    },
  });

  const deposited = formatUnits(data?.[0] ?? 0n, 18);
  const borrowRequest = data?.[1] ?? null;
  const borrowed = borrowRequest!= null && Number(borrowRequest[1]) != 0 && borrowRequest[2] == false ? formatUnits(borrowRequest[0], 18) : 0;
  const collateralRatio = Number(data?.[2]?? 0n) ;
  const repaymentRequiredEpochId = Number(data?.[3]?? 0n) ;
  const currentEpochId = Number(data?.[4]?? 0n) ;
  const repaid = !isLoading && borrowRequest[2] == false && Number(borrowRequest[1]) != 0 && Number(repaymentRequiredEpochId) != 0;

  return {
    deposited,
    borrowed,
    collateralRatio,
    repaymentRequiredEpochId,
    currentEpochId,
    repaid,
    refetch,
    isLoading,
    error,
  };
}
