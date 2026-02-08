'use client';

/**
 * Blockchain Commitment Component
 * Handles the commitment of AI twin data to Solana blockchain
 */

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';

interface CommitData {
  personalityAnswers?: any;
  diaryEntries?: any;
  voiceData?: any;
}

interface Props {
  twinData: CommitData;
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
  darkMode?: boolean;
}

export default function BlockchainCommit({ twinData, onSuccess, onError, darkMode = false }: Props) {
  const [committing, setCommitting] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const { publicKey, sendTransaction, wallet } = useWallet();
  const { connection } = useConnection();

  const handleCommit = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!twinData.personalityAnswers || !twinData.diaryEntries) {
      alert('Please complete personality quiz and diary entries first');
      return;
    }

    // Check if using mock wallet
    const usingMockWallet = wallet?.adapter?.name === 'Mock Wallet (Dev Only)';
    setIsMockMode(usingMockWallet);

    setCommitting(true);
    try {
      // Prepare commitment data
      const commitData = {
        walletAddress: publicKey.toBase58(),
        personalityAnswers: twinData.personalityAnswers,
        diaryEntries: twinData.diaryEntries,
        voiceData: twinData.voiceData,
      };

      if (usingMockWallet) {
        // Mock wallet mode - simulate transaction
        console.log('🎭 Mock Wallet Mode: Simulating blockchain commitment');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

        // Generate a mock transaction signature
        const mockSignature = 'MOCK_TX_' + Math.random().toString(36).substring(2, 15) +
                             Math.random().toString(36).substring(2, 15);

        console.log('🎭 Mock Transaction Signature:', mockSignature);
        console.log('🎭 Commitment Data:', commitData);

        setTxSignature(mockSignature);
        onSuccess?.(mockSignature);
      } else {
        // Real wallet mode - actual blockchain transaction
        // Call API to create transaction
        const response = await fetch('/api/blockchain/commit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commitData),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to create transaction');
        }

        // Deserialize and send transaction
        const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));
        const signature = await sendTransaction(transaction, connection);

        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');

        setTxSignature(signature);
        onSuccess?.(signature);
      }
    } catch (error) {
      console.error('Error committing to blockchain:', error);
      onError?.(error as Error);
      alert('Commitment failed: ' + (error as Error).message);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Commit Button */}
      <button
        onClick={handleCommit}
        disabled={!publicKey || committing}
        className={`w-full py-4 rounded-lg font-semibold transition-all duration-700 ease-in-out relative z-0 ${
          !publicKey || committing
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-50'
            : `acrylic-button ${darkMode ? 'text-gray-200' : 'text-gray-800'}`
        }`}
        style={!publicKey || committing ? {} : { transform: 'none' }}
      >
        <span className="relative z-10">
          {committing ? 'Committing to Blockchain...' : 'Lock Your Twin Forever on Blockchain'}
        </span>
      </button>

      {/* Success Message */}
      {txSignature && (
        <div
          className="rounded-xl p-4 border border-green-200"
          style={{
            background: 'linear-gradient(145deg, #F0FFF4, #E6FFED)',
          }}
        >
          <p className="text-sm font-semibold text-green-800 mb-2">
            {isMockMode ? '🎭 Mock commitment successful!' : '✅ Successfully committed to blockchain!'}
          </p>
          <p className="text-xs text-green-700 mb-2 font-mono break-all">
            Transaction: {txSignature}
          </p>
          {isMockMode ? (
            <p className="text-xs text-orange-600">
              ⚠️ This is a simulated transaction (Mock Wallet mode). Install Phantom for real blockchain commits.
            </p>
          ) : (
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View on Solana Explorer →
            </a>
          )}
        </div>
      )}

      {/* Info */}
      {!publicKey && (
        <p className="text-xs text-gray-600 text-center">
          Connect your wallet above to commit your AI twin to the blockchain
        </p>
      )}

      {publicKey && !txSignature && (
        <p className="text-xs text-gray-600 text-center">
          This will create a permanent record of your digital twin on the Solana blockchain
        </p>
      )}
    </div>
  );
}
