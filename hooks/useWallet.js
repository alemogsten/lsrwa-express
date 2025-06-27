// hooks/useWallet.ts
'use client';

import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { formatUnits } from 'ethers';
import {formatNumber} from '@/utils/helper';

import dotenv from "dotenv";
dotenv.config();

export function useWallet() {
  const { address, isConnected, connector, status } = useAccount();
  const { disconnect } = useDisconnect();

  // const {
  //   data: balanceData,
  //   isPending: isBalanceLoading,
  //   refetch: refetchBalance,
  // } = useBalance({
  //   address,
  //   enabled: !!address,
  //   watch: true,
  // });

  const {
    data: usdcBalance,
    isPending: isUSDCBalanceLoading,
    refetch: refetchUSDCBalance,
  } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    watch: true,
  });

  const {
    data: tokenBalance,
    isPending: isTokenBalanceLoading,
    refetch: refetchTokenBalance,
  } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
    watch: true,
  });

  const decimals = parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6');

  return {
    address,
    isConnected,
    status,
    connector,
    disconnect,
    balance: usdcBalance?.value ? formatNumber(formatUnits(usdcBalance.value, decimals)) : '0.0',
    symbol: usdcBalance?.symbol ?? '',
    tokenBalance: !isTokenBalanceLoading ? formatNumber(formatUnits(tokenBalance.value, 18)) : '0.0',
    // symbol: balanceData?.symbol ?? '',
    isTokenBalanceLoading,
    isUSDCBalanceLoading,
    refetchUSDCBalance,
    refetchTokenBalance,
  };
}
