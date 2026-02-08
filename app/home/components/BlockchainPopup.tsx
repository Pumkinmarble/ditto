'use client';

/**
 * Blockchain Popup Component
 * Shows Solana wallet connection and commitment interface
 */

import React, { useState } from 'react';
import WalletConnect from '@/solana_module/components/WalletConnect';
import BlockchainCommit from '@/solana_module/components/BlockchainCommit';

interface BlockchainPopupProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function BlockchainPopup({
  isOpen,
  onClose,
  darkMode,
}: BlockchainPopupProps) {
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });
  const [localHovering, setLocalHovering] = useState(false);

  // Mock twin data - in real app, this would come from completed quiz/diary
  const twinData = {
    personalityAnswers: { mock: 'data' },
    diaryEntries: { mock: 'entries' },
    voiceData: undefined,
  };

  // Theme-dependent styles (matching other popups)
  const popupBg = darkMode
    ? `linear-gradient(90deg, rgba(192,192,192,0.06) 0%, rgba(160,170,180,0.06) 50%, rgba(140,150,165,0.06) 100%), linear-gradient(145deg, #2a2a2e, #1e1e22)`
    : `linear-gradient(90deg, rgba(255,123,107,0.03) 0%, rgba(168,85,247,0.03) 50%, rgba(59,130,246,0.03) 100%), linear-gradient(145deg, #FFFFFF, #FFF5E8)`;

  const popupShadow = darkMode
    ? `0 10px 30px rgba(0,0,0,0.4), 0 1px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.3)`
    : `0 10px 30px rgba(0,0,0,0.12), 0 1px 8px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,1), inset 0 -2px 4px rgba(0,0,0,0.08)`;

  const glowGradient = darkMode
    ? `radial-gradient(circle 30px at ${localMousePos.x}px ${localMousePos.y}px, rgba(192,192,192,0.3), rgba(160,170,180,0.2) 40%, rgba(140,150,165,0.1) 70%, transparent 100%)`
    : `radial-gradient(circle 30px at ${localMousePos.x}px ${localMousePos.y}px, rgba(255,123,107,0.4), rgba(168,85,247,0.3) 40%, rgba(59,130,246,0.2) 70%, transparent 100%)`;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseMove={(e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setLocalMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseEnter={() => setLocalHovering(true)}
      onMouseLeave={() => setLocalHovering(false)}
      className="fixed transition-all duration-300 ease-in-out rounded-2xl shadow-2xl p-8"
      style={{
        background: popupBg,
        boxShadow: popupShadow,
        width: '500px',
        maxHeight: '85vh',
        overflowY: 'auto',
        left: '50%',
        transform: isOpen ? 'translate(-50%, -50%)' : 'translate(-50%, 50vh)',
        top: isOpen ? '45%' : '100%',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        zIndex: 50,
      }}
    >
      {/* Gradient glow that follows cursor */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          background: glowGradient,
          opacity: isOpen && localHovering ? 1 : 0,
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
          <p>• Cost: ~0.000005 SOL (~CAD $0.0006)</p>
          <p>• Network: Devnet (for testing)</p>
          <p>• Your data is hashed (SHA-256) before storage</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`w-full px-6 py-2.5 rounded-xl font-semibold transition ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
          style={{ background: popupBg, boxShadow: popupShadow }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = darkMode
              ? 'linear-gradient(90deg, rgba(192,192,192,0.15) 0%, rgba(160,170,180,0.15) 50%, rgba(140,150,165,0.15) 100%), linear-gradient(145deg, #333338, #28282c)'
              : 'linear-gradient(90deg, rgba(255,123,107,0.12) 0%, rgba(168,85,247,0.12) 50%, rgba(59,130,246,0.12) 100%), linear-gradient(145deg, #FFFFFF, #FFF5E8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = popupBg;
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
