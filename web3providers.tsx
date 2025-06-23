'use client';

import { WagmiProvider, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { walletConnect, metaMask } from 'wagmi/connectors';

import dotenv from "dotenv";
dotenv.config();

const queryClient = new QueryClient();

const config = createConfig({
  chains: [sepolia],
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      // metadata: {
      //   name: 'LSRWA Express',
      //   description: 'DeFi Vault DApp',
      //   url: 'https://yourdomain.com',
      //   icons: ['https://yourdomain.com/icon.png'],
      // },
    }),
    metaMask()
  ],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
