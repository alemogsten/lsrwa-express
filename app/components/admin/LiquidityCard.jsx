'use client';

import { useReadContract } from 'wagmi';
import { formatUnits } from "ethers";
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export default function LiquidityCard() {

  // Read poolUSDC
  const { data: poolUSDC, isLoading: loading } = useReadContract({
    abi: vaultAbi,
    address: VAULT_ADDRESS,
    functionName: 'poolUSDC',
  });


  return (
    <div className="p-4 shadow bg-white rounded-xl">
      <p className="text-base font-medium">Pool USDC</p>
      <p className='text-lg font-bold'>{!loading ? formatUnits(poolUSDC, parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6')) : '0.0'}</p>
    </div>
  );
}
