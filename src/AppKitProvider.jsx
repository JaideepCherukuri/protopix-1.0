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
const projectId = import.meta.env.VITE_PROJECT_ID;
if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Create metadata object
const metadata = {
  name: 'Pixx-Prototype',
  description: 'Global Alternate Investments Hub',
  url: 'https://pixxproto.netlify.app/',
  icons: ['https://imgur.com/VLyVGwF.png'],
};

// Set the networks
const networks = [bsc, bscTestnet];
const defaultNetwork = bsc;

// Create Wagmi Adapter with proper configuration
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: false,
  metadata
});

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork,
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
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662',
    
  ]
});

// Add this after the modal creation
modal.subscribeEvents((event) => {
  if (event.name === 'MODAL_ERROR') {
    console.error('Wallet connection error:', event.data);
    // Keep existing error handling
  }
});

export function AppKitProvider({ children, cookies = null }) {
  // Get initial state from cookies if available
  const initialState = cookies ? cookieToInitialState(wagmiAdapter.wagmiConfig, cookies) : undefined;

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { modal as appKit };