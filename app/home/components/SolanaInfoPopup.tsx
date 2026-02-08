'use client';

import React, { useState, useEffect } from 'react';

interface SolanaInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

interface ProfileResponse {
  success: boolean;
  user?: {
    solanaTxHash?: string | null;
    blockchainCommittedAt?: string | null;
    showInGallery?: boolean | null;
  };
}

export default function SolanaInfoPopup({
  isOpen,
  onClose,
  darkMode,
}: SolanaInfoPopupProps) {
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });
  const [localHovering, setLocalHovering] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInGallery, setShowInGallery] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user/profile');
        const data: ProfileResponse = await response.json();
        if (data?.user?.solanaTxHash) {
          setTxSignature(data.user.solanaTxHash);
        } else {
          setTxSignature(null);
        }

        setShowInGallery(!!data?.user?.showInGallery);

        if (data?.user?.blockchainCommittedAt) {
          setTimestamp(new Date(data.user.blockchainCommittedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }));
        } else {
          setTimestamp('—');
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setTxSignature(null);
        setTimestamp('—');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isOpen]);

  const displaySignature = (sig: string) => {
    if (sig.length <= 16) return sig;
    return `${sig.slice(0, 6)}...${sig.slice(-6)}`;
  };

  const handleGalleryToggle = async () => {
    const nextValue = !showInGallery;
    setSavingGallery(true);
    setShowInGallery(nextValue);
    try {
      const response = await fetch('/api/user/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showInGallery: nextValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update gallery preference');
      }
    } catch (error) {
      console.error(error);
      setShowInGallery(!nextValue);
      alert('Unable to update gallery preference. Please try again.');
    } finally {
      setSavingGallery(false);
    }
  };

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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-all duration-300"
        style={{
          backdropFilter: isOpen ? 'blur(8px)' : 'blur(0px)',
          backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
          pointerEvents: isOpen ? 'auto' : 'none',
          opacity: isOpen ? 1 : 0,
          zIndex: 55,
        }}
        onClick={onClose}
      />
      {/* Popup */}
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
          width: '480px',
          left: '50%',
          transform: isOpen ? 'translate(-50%, -50%)' : 'translate(-50%, 50vh)',
          top: isOpen ? '45%' : '100%',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          zIndex: 60,
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
        <div className="relative z-10 space-y-5">
          {/* Title */}
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Digital Identity Proof
          </h2>

          {/* Info rows */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Blockchain
              </span>
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Solana (Devnet)
              </span>
            </div>
            <div style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }} />

            <div className="flex justify-between items-center">
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Status
              </span>
              <span className={`text-sm font-semibold ${txSignature ? 'text-green-500' : 'text-orange-500'}`}>
                {txSignature ? 'Identity Committed' : 'Not Committed'}
              </span>
            </div>
            <div style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }} />

            <div className="flex justify-between items-center">
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Timestamp
              </span>
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {loading ? 'Loading…' : timestamp}
              </span>
            </div>
          </div>

          {/* Gallery opt-in */}
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Community Gallery
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Show your verified twin publicly
              </p>
            </div>
            <button
              onClick={handleGalleryToggle}
              disabled={savingGallery}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                showInGallery
                  ? 'bg-green-500 text-white'
                  : darkMode ? 'bg-white/10 text-gray-300' : 'bg-black/[0.04] text-gray-700'
              } ${savingGallery ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {showInGallery ? 'Visible' : 'Hidden'}
            </button>
          </div>

          {/* Transaction signatures */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Transaction Signatures
            </h3>
            <div className="space-y-2">
              {txSignature ? (
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg px-3 py-2 font-mono text-xs break-all block ${
                    darkMode ? 'bg-white/5 text-gray-300' : 'bg-black/[0.03] text-gray-700'
                  }`}
                >
                  {displaySignature(txSignature)}
                </a>
              ) : (
                <div
                  className={`rounded-lg px-3 py-2 text-xs ${
                    darkMode ? 'bg-white/5 text-gray-400' : 'bg-black/[0.03] text-gray-500'
                  }`}
                >
                  No transactions found yet.
                </div>
              )}
            </div>
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
    </>
  );
}
