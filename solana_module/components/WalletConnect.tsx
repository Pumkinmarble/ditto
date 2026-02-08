'use client';

/**
 * Wallet Connection Component
 * Handles Solana wallet connection UI and status display
 */

import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function WalletConnect() {
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch wallet balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey]);

  const fetchBalance = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    // Clear wallet adapter's localStorage cache
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletName');
    }
    // Disconnect the wallet
    await disconnect();
  };

  return (
    <div className="space-y-4">
      {/* Wallet Connect Button */}
      <div className="flex flex-col items-center gap-4">
        <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 !rounded-lg !font-semibold hover:!opacity-90 !transition" />

        {/* Connection Status */}
        {connected && publicKey && (
          <div
            className="rounded-xl p-4 border border-white/20 w-full"
            style={{
              background: `
                linear-gradient(90deg,
                  rgba(255, 123, 107, 0.03) 0%,
                  rgba(168, 85, 247, 0.03) 50%,
                  rgba(59, 130, 246, 0.03) 100%
                ),
                linear-gradient(145deg, #FFFFFF, #FFF5E8)
              `,
            }}
          >
            <div className="space-y-2">
              {/* Wallet Address */}
              <div>
                <p className="text-sm text-gray-600">Wallet Address</p>
                <p className="text-xs font-mono text-gray-800 truncate">
                  {publicKey.toBase58()}
                </p>
              </div>

              {/* Balance */}
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                {loading ? (
                  <p className="text-sm text-gray-800">Loading...</p>
                ) : balance !== null ? (
                  <p className="text-sm font-semibold text-gray-800">
                    {balance.toFixed(4)} SOL
                  </p>
                ) : (
                  <p className="text-sm text-gray-800">-</p>
                )}
              </div>

              {/* Network */}
              <div>
                <p className="text-sm text-gray-600">Network</p>
                <p className="text-sm text-gray-800">Devnet</p>
              </div>

              {/* Wallet Name */}
              <div>
                <p className="text-sm text-gray-600">Connected Wallet</p>
                <p className="text-sm text-gray-800">{wallet?.adapter?.name || 'Unknown'}</p>
              </div>
            </div>

            {/* Disconnect/Change Wallet Button */}
            <button
              onClick={handleDisconnect}
              className="mt-3 w-full py-2 px-4 rounded-lg text-sm font-medium text-gray-700 bg-white/50 hover:bg-white/80 border border-gray-300 transition"
            >
              Disconnect & Change Wallet
            </button>
          </div>
        )}

        {/* Info for non-connected users */}
        {!connected && (
          <div className="text-center text-sm text-gray-600 max-w-md">
            <p>Connect your Solana wallet to commit your AI digital twin to the blockchain forever.</p>
            <p className="mt-2 text-xs">Make sure you're on Devnet for testing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
