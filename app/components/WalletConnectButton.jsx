'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Connector, useConnect } from 'wagmi';
import { walletConnect } from 'wagmi/connectors';
import Image from 'next/image';

export default function WalletConnectButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    address,
    isConnected,
    disconnect,
    balance,
    symbol,
    isBalanceLoading,
  } = useWallet();

  const { connectors, isPending, connect } = useConnect()

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <>
      {isConnected ? (
        <></>
      ) : (
        <button
          onClick={() => connect({ connector: connectors[1] })}
          disabled={isPending}
          className="flex gap-4 px-4 py-2 bg-green text-white rounded-[100px]"
        >
          {isPending ? 'Connecting...' : 'Invest now'}
          <Image
            src="/assets/right_icon.svg"
            alt="contract"
            width={14}
            height={14}
            priority
          />
        </button>
      )}
    </>
  );
}
