'use client';

import { useState } from "react";
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';
import { formatUnits } from 'ethers';

const decimals = parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6');
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export function useDepositorAccount() {
  const [compounding, setCompounding] = useState(false);
  const [harvesting, setHarvesting] = useState(false);
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'users',
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

  const setAutoCompound = async (status) => {
    const { writeContractAsync } = useWriteContract();
    try {
      await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'setAutoCompound',
        args: [status],
      });
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
    }
  }
  const compound = async () => {
    const { writeContractAsync } = useWriteContract();
    setCompounding(true);
    try {
      await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'compound',
      });
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setCompounding(false);
    }
  }
  const harvestReward = async () => {
    const { writeContractAsync } = useWriteContract();
    setHarvesting(true);
    try {
      await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'harvestReward',
      });
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setHarvesting(false);
    }
  }

  const deposited = formatUnits(data?.[0]?.deposit ?? 0n, decimals) ;
  const reward = formatUnits(data?.[0]?.reward ?? 0n, decimals) ;
  const autoCompound = data?.[0]?.autoCompound ?? false ;
  const rewardAPR = Number(data?.[1] ?? 0n) ;

  return {
    deposited,
    reward,
    rewardAPR,
    autoCompound,
    setAutoCompound,
    compound,
    compounding,
    harvestReward,
    harvesting,
    isLoading,
    error,
  };
}
