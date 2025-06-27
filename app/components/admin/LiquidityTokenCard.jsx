'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { formatUnits } from "ethers";
import vaultAbi from '@/abis/Vault.json';
import { formatNumber } from '@/utils/helper';

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

    console.log('repaymentRequiredEpochId', repaymentRequiredEpochId);
    

  return (
    <div className="p-4 shadow bg-white rounded-xl flex justify-between">
      <div>
        <p className="text-base font-medium">Pool LSRWA</p>
        <p className='text-lg font-bold'>{poolLSRWA ? formatNumber(formatUnits(poolLSRWA, 18)) : '0.0'}</p>
      </div>
      <div>
      {parseInt(repaymentRequiredEpochId) != 0 && parseInt(currentEpochId) > (parseInt(repaymentRequiredEpochId) + parseInt(maxEpochsBeforeLiquidation)) && <button className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50'>Liquidate Collateral</button> }
      </div>
    </div>
  );
}
