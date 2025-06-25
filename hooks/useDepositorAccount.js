'use client';

import { useAccount, useReadContracts } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';
import { formatUnits } from 'ethers';

const decimals = parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6');
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export function useDepositorAccount() {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'activeDeposits',
        args: [address],
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'unclaimedRewards',
        args: [address],
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'rewardAPR',
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!address,
    },
  });

  const deposited = formatUnits(data?.[0]?? 0n, decimals) ;
  const reward = formatUnits(data?.[1]?? 0n, decimals) ;
  const rewardAPR = parseInt(data?.[2]?? 0n) ;

  return {
    deposited,
    reward,
    rewardAPR,
    isLoading,
    error,
  };
}
