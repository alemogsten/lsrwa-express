'use client';

import { useReadContracts } from 'wagmi';
import { formatUnits } from "ethers";
import vaultAbi from '@/abis/Vault.json';
import usdcAbi from "@/abis/ERC20.json"

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const USDC_DECIMAL = parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6');

export function useAdminSummary() {

  const { data, isLoading, refetch, error } = useReadContracts({
    contracts: [
      {
        address: USDC_ADDRESS,
        abi: usdcAbi,
        functionName: 'balanceOf',
        args: [VAULT_ADDRESS],
      },
      {
        abi: vaultAbi,
        address: VAULT_ADDRESS,
        functionName: 'borrowingUSDC',
      },
      {
        address: TOKEN_ADDRESS,
        abi: usdcAbi,
        functionName: 'balanceOf',
        args: [VAULT_ADDRESS],
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'collateralRatio',
      },
      {
        abi: vaultAbi,
        address: VAULT_ADDRESS,
        functionName: 'repaymentRequired',
      },
    ],
    allowFailure: false,
  });

  const poolUSDC = formatUnits(data?.[0] ?? 0n, USDC_DECIMAL);
  const borrowingUSDC = formatUnits(data?.[1] ?? 0n, USDC_DECIMAL);
  const poolLSRWA = formatUnits(data?.[2] ?? 0n, 18);
  const collateralRatio = Number(data?.[3]?? 0n) ;
  const repaymentRequired = data?.[4]?? false ;

  return {
    poolUSDC,
    borrowingUSDC,
    poolLSRWA,
    collateralRatio,
    repaymentRequired,
    refetch,
    isLoading,
    error,
  };
}
