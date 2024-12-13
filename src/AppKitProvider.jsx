'use client';
import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bsc, bscTestnet } from '@reown/appkit/networks';

// Set up QueryClient
const queryClient = new QueryClient();

// Use your Reown project ID
const projectId = import.meta.env.VITE_PROJECT_ID || '2d7e209a463989cf14adddfe39848648';

// Create metadata object
const metadata = {
  name: 'Pixx-Prototype',
  description: 'Global Alternate Investments Hub',
  url: 'https://pixxproto.netlify.app/',
  icons: ['https://imgur.com/VLyVGwF.png'],
};

// Set the networks
export const networks = [bsc, bscTestnet];
export const defaultNetwork = bsc;

// Create Wagmi Adapter with proper configuration
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
  metadata
});

// Initialize AppKit with proper configuration
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  allWallets: 'SHOW',
  features: {
    analytics: true,
    socials: ['google', 'twitter', 'telegram']
  },
  themeVariables: {
    '--w3m-accent': '#d71921',
  },
  featuredWalletIds: [
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662',
  ]
});

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}