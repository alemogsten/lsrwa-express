'use client';

import { useReadContract } from 'wagmi';
import vaultAbi from '@/abis/Vault.json';
import { formatUnits } from "ethers";

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

  return (
    <div className="p-4 shadow bg-white rounded-xl flex justify-between">
      <div>
        <p className="text-base font-medium">Lending USDC</p>
        <p className='text-lg font-bold'>{borrowingUSDC ? formatUnits(borrowingUSDC, decimal) : '0.0'}</p>
      </div>
      <div>
      {repaymentRequiredEpochId == 0 || undefined ? 
          <button disabled={formatUnits(borrowingUSDC, decimal) == 0} className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50'>Require Repayment</button> 
          : <div><p className='text-red-500'>Required repayment</p>{currentEpochId && repaymentRequiredEpochId && <p className='text-red-500'>{parseInt(currentEpochId) - parseInt(repaymentRequiredEpochId)}</p>}</div>}
      </div>
    </div>
  );
}
