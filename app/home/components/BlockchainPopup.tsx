'use client';

/**
 * Blockchain Popup Component
 * Shows Solana wallet connection and commitment interface
 */

import React from 'react';
import WalletConnect from '@/solana_module/components/WalletConnect';
import BlockchainCommit from '@/solana_module/components/BlockchainCommit';

interface BlockchainPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mousePos: { x: number; y: number };
  isHovering: boolean;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  darkMode: boolean;
}

export default function BlockchainPopup({
  isOpen,
  onClose,
  mousePos,
  isHovering,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  darkMode,
}: BlockchainPopupProps) {
  // Mock twin data - in real app, this would come from completed quiz/diary
  const twinData = {
    personalityAnswers: { mock: 'data' },
    diaryEntries: { mock: 'entries' },
    voiceData: undefined,
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`fixed transition-all duration-300 ease-in-out rounded-2xl shadow-2xl p-8 acrylic-button ${darkMode ? 'dark' : ''}`}
      style={{
        width: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        left: '50%',
        transform: isOpen
          ? 'translate(-50%, -50%)'
          : 'translate(-50%, 50vh)',
        top: isOpen ? '50%' : '100%',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        zIndex: 50,
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle 30px at ${mousePos.x}px ${mousePos.y}px,
            rgba(255, 123, 107, 0.4),
            rgba(168, 85, 247, 0.3) 40%,
            rgba(59, 130, 246, 0.2) 70%,
            transparent 100%)`,
          opacity: isOpen && isHovering ? 1 : 0,
          transition: 'opacity 0.3s ease',
          borderRadius: '1rem',
        }}
      />

      {/* Content */}
      <div className="relative z-10 space-y-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Lock Your Twin Forever
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Commit your AI digital twin to the Solana blockchain for permanent, immutable storage.
          </p>
        </div>

        {/* Wallet Connection */}
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            1. Connect Wallet
          </h3>
          <WalletConnect />
        </div>

        {/* Blockchain Commitment */}
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            2. Commit to Blockchain
          </h3>
          <BlockchainCommit
            twinData={twinData}
            onSuccess={(signature) => {
              console.log('Successfully committed! TX:', signature);
            }}
            onError={(error) => {
              console.error('Commitment failed:', error);
            }}
            darkMode={darkMode}
          />
        </div>

        {/* Info */}
        <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>• Cost: ~0.000005 SOL (~$0.0005)</p>
          <p>• Network: Devnet (for testing)</p>
          <p>• Your data is hashed (SHA-256) before storage</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`w-full py-2 text-sm transition ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
