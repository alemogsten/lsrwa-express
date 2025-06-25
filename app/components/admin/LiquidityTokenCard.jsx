'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export default function LiquidityTokenCard() {

  // Read poolLSRWA
  const { data: poolLSRWA } = useReadContract({
    abi: vaultAbi,
    address: VAULT_ADDRESS,
    functionName: 'poolLSRWA',
  });

  const { data: repaymentRequiredEpochId } = useReadContract({
      abi: vaultAbi,
      address: VAULT_ADDRESS,
      functionName: 'repaymentRequiredEpochId',
    });

  const { data: currentEpochId } = useReadContract({
      abi: vaultAbi,
      address: VAULT_ADDRESS,
      functionName: 'currentEpochId',
    });

  const { data: maxEpochsBeforeLiquidation } = useReadContract({
      abi: vaultAbi,
      address: VAULT_ADDRESS,
      functionName: 'maxEpochsBeforeLiquidation',
    });

  return (
    <div className="p-4 shadow bg-white rounded-xl flex justify-between">
      <div>
        <p className="text-base font-medium">Pool LSRWA</p>
        <p className='text-lg font-bold'>{poolLSRWA ? `${poolLSRWA.toString()}%` : '0.0'}</p>
      </div>
      <div>
      {parseInt(currentEpochId) > (parseInt(repaymentRequiredEpochId) + parseInt(maxEpochsBeforeLiquidation)) && <button className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50'>Liquidate Collateral</button> }
      </div>
    </div>
  );
}
