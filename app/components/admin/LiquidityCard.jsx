'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export default function LiquidityCard() {

  // Read poolUSDC
  const { data: poolUSDC } = useReadContract({
    abi: vaultAbi,
    address: VAULT_ADDRESS,
    functionName: 'poolUSDC',
  });


  return (
    <div className="p-4 shadow bg-white rounded-xl">
      <p className="text-base font-medium">Pool USDC</p>
      <p className='text-lg font-bold'>{poolUSDC ? `${poolUSDC.toString()}%` : '0.0'}</p>
    </div>
  );
}
