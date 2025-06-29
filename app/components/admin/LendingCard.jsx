'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';
import { formatUnits } from "ethers";
import { formatNumber } from '@/utils/helper';
import axios from 'axios';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
const decimal = parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6');

export default function LendingCard() {

  // Read borrowingUSDC
  const { data: borrowingUSDC } = useReadContract({
    abi: vaultAbi,
    address: VAULT_ADDRESS,
    functionName: 'borrowingUSDC',
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

  const { data: maxEpoch } = useReadContract({
    abi: vaultAbi,
    address: VAULT_ADDRESS,
    functionName: 'maxEpochsBeforeLiquidation',
  });

  const [loading, setLoading] = useState(false);

  const handleRepayment = () => {
    setLoading(true);
    axios
      .post('/api/admin/require-repayment')
      .then((res) => {
        alert('Required repayment successfully.')
        console.log(res.data.success);
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="p-4 shadow bg-white rounded-xl flex justify-between">
      <div>
        <p className="text-base font-medium">Lending USDC</p>
        <p className='text-lg font-bold'>{borrowingUSDC ? formatNumber(formatUnits(borrowingUSDC, decimal)) : '0.0'}</p>
      </div>
      <div>
      {repaymentRequiredEpochId == 0 || undefined ? 
          <button onClick={handleRepayment} disabled={loading || formatUnits(borrowingUSDC, decimal) == 0} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50'>{loading?'Doing require':'Require Repayment'}</button> 
          : <div><p className='text-red-500'>Required repayment</p>
          {currentEpochId && repaymentRequiredEpochId && <p className='text-black'>Remained Epoch: {parseInt(maxEpoch) - (parseInt(currentEpochId) - parseInt(repaymentRequiredEpochId))}</p>}</div>}
      </div>
    </div>
  );
}
