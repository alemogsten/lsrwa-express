'use client';

import { useReadContracts } from 'wagmi';
import { formatUnits } from "ethers";
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
const USDC_DECIMAL = parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6');

export function useAdminSummary() {

  const { data, isLoading, refetch, error } = useReadContracts({
    contracts: [
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'poolUSDC',
      },
      {
        abi: vaultAbi,
        address: VAULT_ADDRESS,
        functionName: 'borrowingUSDC',
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'poolLSRWA',
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
        functionName: 'maxEpochsBeforeLiquidation',
      },
      {
        abi: vaultAbi,
        address: VAULT_ADDRESS,
        functionName: 'currentEpochId',
      }
    ],
    allowFailure: false,
  });

  const poolUSDC = formatUnits(data?.[0] ?? 0n, USDC_DECIMAL);
  const borrowingUSDC = formatUnits(data?.[1] ?? 0n, USDC_DECIMAL);
  const poolLSRWA = formatUnits(data?.[2] ?? 0n, 18);
  const collateralRatio = Number(data?.[3]?? 0n) ;
  const repaymentRequiredEpochId = Number(data?.[4]?? 0n) ;
  const maxEpochsBeforeLiquidation = Number(data?.[5]?? 0n) ;
  const currentEpochId = Number(data?.[6]?? 0n) ;

  return {
    poolUSDC,
    borrowingUSDC,
    poolLSRWA,
    collateralRatio,
    repaymentRequiredEpochId,
    maxEpochsBeforeLiquidation,
    currentEpochId,
    refetch,
    isLoading,
    error,
  };
}
