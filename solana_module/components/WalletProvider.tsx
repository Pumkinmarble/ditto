'use client';

/**
 * Solana Wallet Provider
 * Wraps the app with wallet adapter context
 */

import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { MockWalletAdapter } from '../lib/mockWallet';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
  children: React.ReactNode;
}

export default function WalletProvider({ children }: Props) {
  // Get RPC endpoint from environment
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com',
    []
  );

  // Configure supported wallets (Mock wallet first for easy testing)
  const wallets = useMemo(
    () => [
      new MockWalletAdapter(), // 🎭 Mock wallet for testing (no installation needed!)
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
