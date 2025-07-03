'use client';

import { useState } from "react";
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';
import { formatUnits } from 'ethers';
import {formatNumber} from '@/utils/helper'

const decimals = parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6');
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export function useDepositorAccount() {
  const [compounding, setCompounding] = useState(false);
  const [harvesting, setHarvesting] = useState(false);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data, isLoading, refetch, error } = useReadContracts({
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
    setCompounding(true);
    try {
      await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'compound',
      });
      refetch();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setCompounding(false);
    }
  }
  const harvestReward = async () => {
    setHarvesting(true);
    try {
      await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'harvestReward',
      });
      await refetch();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setHarvesting(false);
    }
  }

  const deposited = formatNumber(formatUnits(data?.[0][0] ?? 0n, decimals)) ;
  const reward = formatNumber(formatUnits(data?.[0][1] ?? 0n, decimals)) ;
  const autoCompound = data?.[0][2] ?? false ;
  const rewardAPR = Number(data?.[1] ?? 0n) * 0.01 ;

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
