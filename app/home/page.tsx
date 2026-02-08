'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@auth0/nextjs-auth0/client';
import PersonalityQuizPopup from './components/PersonalityQuizPopup';
import DiaryPopup from './components/DiaryPopup';
import VoiceClonePopup from './components/VoiceClonePopup';
import BlockchainPopup from './components/BlockchainPopup';
import SolanaInfoPopup from './components/SolanaInfoPopup';

const DittoCharacter = dynamic(() => import('./components/DittoCharacter'), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  const { user } = useUser();
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [audioLevel, setAudioLevel] = useState(0);
  const mouthTargetRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const wordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionSaving, setQuestionSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showSolanaInfo, setShowSolanaInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [dittoName, setDittoName] = useState('Ditto');
  const nameSpanRef = useRef<HTMLSpanElement>(null);
  const [nameInputWidth, setNameInputWidth] = useState(160);
  const [diarySaving, setDiarySaving] = useState(false);
  const [voiceSaving, setVoiceSaving] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Close settings submenu when hamburger menu closes
  useEffect(() => {
    if (!menuOpen) setSettingsOpen(false);
  }, [menuOpen]);

  // Loading cursor: track mouse and toggle cursor style when any submission is in progress
  const isAnySubmitting = questionSaving || diarySaving || voiceSaving;

  useEffect(() => {
    if (!isAnySubmitting) return;
    const handleMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    document.documentElement.classList.add('submitting-cursor');
    document.addEventListener('mousemove', handleMove);
    return () => {
      document.documentElement.classList.remove('submitting-cursor');
      document.removeEventListener('mousemove', handleMove);
    };
  }, [isAnySubmitting]);

  // Auto-resize name input based on text width
  useEffect(() => {
    if (nameSpanRef.current) {
      const measured = nameSpanRef.current.offsetWidth;
      setNameInputWidth(Math.max(160, measured + 16));
    }
  }, [dittoName]);

  // Fetch user ID when user logs in
  useEffect(() => {
    if (user) {
      fetch('/api/user/current')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserId(data.id);
          }
        })
        .catch(err => {
          console.error('Failed to fetch user ID:', err);
        });
    } else {
      setUserId(null);
    }
  }, [user]);

  // Handle Escape key to close popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close topmost popup first (highest z-index wins)
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
          setDeleteConfirmText('');
          return;
        }
        if (showClearConfirm) {
          setShowClearConfirm(false);
          return;
        }
        if (showSolanaInfo) {
          setShowSolanaInfo(false);
          return;
        }
        if (selectedButton) {
          e.preventDefault();
          setShowPopup(false);
          setTimeout(() => setSelectedButton(null), 400);
          return;
        }
        if (showProfileMenu) {
          setShowProfileMenu(false);
          return;
        }
        if (menuOpen) {
          setMenuOpen(false);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedButton, showProfileMenu, menuOpen, showSolanaInfo, showDeleteConfirm, showClearConfirm]);

  // Smooth mouth animation loop — lerps toward mouthTargetRef
  const startMouthLoop = useCallback(() => {
    const animate = () => {
      setAudioLevel((prev) => {
        const target = mouthTargetRef.current;
        const next = prev + (target - prev) * 0.35;
        // Snap to 0 when close enough
        if (target === 0 && next < 0.02) return 0;
        return next;
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const stopMouthAnim = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    mouthTargetRef.current = 0;
    setAudioLevel(0);
  }, []);

  const handleButtonClick = (e: React.MouseEvent, buttonName: string) => {
    e.stopPropagation(); // Prevent background click

    if (selectedButton === buttonName) {
      // Close popup first, then reset button
      setShowPopup(false);
      setTimeout(() => {
        setSelectedButton(null);
      }, 400); // Wait for popup to close
    } else {
      // Select button, then show popup
      setSelectedButton(buttonName);
      setTimeout(() => {
        setShowPopup(true);
      }, 300); // Faster popup appearance
    }
  };

  const handleBackgroundClick = () => {
    // Don't close the menu if a popup triggered from the menu is open
    if (menuOpen && !showSolanaInfo && !showClearConfirm && !showDeleteConfirm && selectedButton !== 'blockchain') {
      setMenuOpen(false);
    }
    if (showProfileMenu) {
      setShowProfileMenu(false);
    }
    if (selectedButton) {
      // Close popup first, then reset button
      setShowPopup(false);
      setTimeout(() => {
        setSelectedButton(null);
      }, 400); // Wait for popup to close
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getButtonStyle = (buttonName: string) => {
    if (!selectedButton) return {};

    if (buttonName === selectedButton) {
      // Selected button slides to middle position (accounting for 10px left offset)
      if (buttonName === 'quiz') {
        // Left button (A) slides RIGHT to middle (B's position)
        return { transform: 'translateX(190px)' };
      } else if (buttonName === 'voice') {
        // Right button (C) slides LEFT to middle (B's position)
        return { transform: 'translateX(-170px)' };
      }
      // Middle button (B) already centered, stays in place
      return {};
    } else {
      // Non-selected buttons fade and slide away
      if (buttonName === 'quiz') {
        // Left button slides further left and fades
        return { transform: 'translateX(-200px)', opacity: 0, pointerEvents: 'none' as const };
      } else if (buttonName === 'voice') {
        // Right button slides further right and fades
        return { transform: 'translateX(200px)', opacity: 0, pointerEvents: 'none' as const };
      } else {
        // Middle button fades
        return { opacity: 0, pointerEvents: 'none' as const };
      }
    }
  };

  return (
    <main
      className={`min-h-screen flex items-end justify-center pb-16 relative transition-colors duration-500 overflow-hidden ${darkMode ? 'dark' : ''}`}
      style={{ background: darkMode ? '#1a1a1e' : '#FFF8F0' }}
      onClick={handleBackgroundClick}
      onMouseMove={handleMouseMove}
    >
      {/* Hamburger Menu - Top Left */}
      <div className="absolute top-6 left-6 z-30">
        <div
          className="acrylic-button rounded-lg overflow-hidden"
          style={{
            width: menuOpen ? '280px' : '48px',
            height: menuOpen ? (settingsOpen ? '290px' : '220px') : '48px',
            padding: 0,
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top row: toggle button */}
          <div className="flex items-center h-12">
            <button
              className="w-12 h-12 flex-shrink-0 flex flex-col items-center justify-center relative z-10"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {/* Line 1 → top of X */}
              <span
                className={`block w-5 h-[2px] rounded-full absolute transition-all duration-300 ${darkMode ? 'bg-gray-300' : 'bg-gray-700'}`}
                style={{
                  transform: menuOpen ? 'rotate(45deg)' : 'translateY(-6px)',
                }}
              />
              {/* Line 2 → fades out */}
              <span
                className={`block w-5 h-[2px] rounded-full absolute transition-all duration-300 ${darkMode ? 'bg-gray-300' : 'bg-gray-700'}`}
                style={{
                  opacity: menuOpen ? 0 : 1,
                  transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)',
                }}
              />
              {/* Line 3 → bottom of X */}
              <span
                className={`block w-5 h-[2px] rounded-full absolute transition-all duration-300 ${darkMode ? 'bg-gray-300' : 'bg-gray-700'}`}
                style={{
                  transform: menuOpen ? 'rotate(-45deg)' : 'translateY(6px)',
                }}
              />
            </button>
          </div>

          {/* Menu content */}
          <div
            className="flex flex-col"
            style={{
              opacity: menuOpen ? 1 : 0,
              transition: 'opacity 0.2s ease',
              transitionDelay: menuOpen ? '0.2s' : '0s',
              pointerEvents: menuOpen ? 'auto' : 'none',
              height: menuOpen ? 'calc(100% - 48px)' : '0',
            }}
          >
            {/* Blockchain button */}
            <button
              className={`flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-left transition-colors relative z-10 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode
                  ? 'rgba(192, 192, 192, 0.1)'
                  : 'linear-gradient(90deg, rgba(255,123,107,0.12) 0%, rgba(168,85,247,0.12) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedButton === 'blockchain') {
                  setShowPopup(false);
                  setTimeout(() => setSelectedButton(null), 400);
                } else {
                  setSelectedButton('blockchain');
                  setTimeout(() => setShowPopup(true), 300);
                }
              }}
            >
              <span>Blockchain</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
            <div style={{ borderTop: `1px solid ${darkMode ? 'rgba(192,192,192,0.1)' : 'rgba(168, 85, 247, 0.1)'}` }} />
            {/* Dark/Light mode toggle */}
            <button
              className={`flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-left transition-colors relative z-10 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode
                  ? 'rgba(192, 192, 192, 0.1)'
                  : 'linear-gradient(90deg, rgba(255,123,107,0.12) 0%, rgba(168,85,247,0.12) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              onClick={() => setDarkMode(!darkMode)}
            >
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              <span className="text-base">{darkMode ? '\u2600' : '\u263E'}</span>
            </button>
            <div style={{ borderTop: `1px solid ${darkMode ? 'rgba(192,192,192,0.1)' : 'rgba(168, 85, 247, 0.1)'}` }} />
            {/* Settings & Privacy button */}
            <button
              className={`flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-left transition-colors relative z-10 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode
                  ? 'rgba(192, 192, 192, 0.1)'
                  : 'linear-gradient(90deg, rgba(255,123,107,0.12) 0%, rgba(168,85,247,0.12) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSettingsOpen(!settingsOpen);
              }}
            >
              <span>Settings & Privacy</span>
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: settingsOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            {/* Settings submenu */}
            <div
              style={{
                maxHeight: settingsOpen ? '80px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.25s ease',
              }}
            >
              <button
                className={`flex items-center w-full px-3 py-2 pl-6 text-sm text-left transition-colors relative z-10 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode
                    ? 'rgba(192, 192, 192, 0.1)'
                    : 'linear-gradient(90deg, rgba(255,123,107,0.12) 0%, rgba(168,85,247,0.12) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSolanaInfo(true);
                }}
              >
                Solana
              </button>
              <button
                className={`flex items-center w-full px-3 py-2 pl-6 text-sm text-left transition-colors relative z-10 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                  setDeleteConfirmText('');
                }}
              >
                Delete Account
              </button>
            </div>
            <div style={{ borderTop: `1px solid ${darkMode ? 'rgba(192,192,192,0.1)' : 'rgba(168, 85, 247, 0.1)'}` }} />
            <button
              className={`block w-full px-3 py-2 text-sm font-semibold text-left transition-colors relative z-10 rounded-b-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '';
              }}
              onClick={() => setShowClearConfirm(true)}
            >
              Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* Profile Picture - Top Right */}
      <div className="absolute top-6 right-6 z-30">
        {user ? (
          <div className="relative flex flex-col items-end">
            {/* Circular Profile Picture */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileMenu(!showProfileMenu);
              }}
              className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-lg hover:shadow-xl transition-shadow duration-200 focus:outline-none focus:ring-2 relative z-10 ${darkMode ? 'border-gray-600 focus:ring-white' : 'border-white focus:ring-purple-500'}`}
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-lg">
                  {(user.name || user.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {/* Dropdown Menu - speech bubble style */}
            <div
              className="absolute"
              style={{
                top: '50px',
                right: '50px',
                transformOrigin: 'top right',
                transform: showProfileMenu ? 'scale(1)' : 'scale(0)',
                opacity: showProfileMenu ? 1 : 0,
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
                pointerEvents: showProfileMenu ? 'auto' : 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-52 rounded-lg rounded-tr-none acrylic-button"
                style={{ padding: 0, transform: 'none' }}
              >
                <div className="px-3 py-2" style={{ borderBottom: `1px solid ${darkMode ? 'rgba(192,192,192,0.1)' : 'rgba(168, 85, 247, 0.1)'}` }}>
                  <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user.name || 'User'}
                  </p>
                  <p className={`text-xs truncate ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {user.email}
                  </p>
                </div>
                <a
                  href="/api/auth/logout"
                  className={`block px-3 py-2 text-sm font-semibold transition-colors relative z-10 rounded-b-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode
                      ? 'rgba(192, 192, 192, 0.1)'
                      : 'linear-gradient(90deg, rgba(255,123,107,0.12) 0%, rgba(168,85,247,0.12) 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Logout
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Dev Mode - Back to Login Button */
          <a
            href="/login"
            className="w-12 h-12 rounded-full bg-white/70 backdrop-blur-md border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="Back to Login"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </a>
        )}
      </div>

      {/* Name input - centered above Ditto */}
      <div
        className="absolute left-1/2 z-30"
        style={{ top: '8%', transform: 'translateX(-50%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden span to measure text width */}
        <span
          ref={nameSpanRef}
          className="absolute invisible whitespace-pre text-xl font-semibold px-4"
          style={{ pointerEvents: 'none' }}
        >
          {dittoName || 'Enter your name...'}
        </span>
        <div
          className="rounded-xl p-[2px] transition-all duration-200"
          style={{ background: 'transparent' }}
          onMouseEnter={(e) => {
            const input = e.currentTarget.querySelector('input');
            if (document.activeElement === input) return;
            e.currentTarget.style.background = darkMode
              ? 'rgba(192,192,192,0.5)'
              : 'linear-gradient(90deg, rgba(255,123,107,0.6), rgba(168,85,247,0.6), rgba(59,130,246,0.6))';
          }}
          onMouseLeave={(e) => {
            const input = e.currentTarget.querySelector('input');
            if (document.activeElement === input) return;
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <input
            type="text"
            value={dittoName}
            onChange={(e) => setDittoName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className={`text-xl font-semibold text-center rounded-[10px] focus:outline-none transition-all duration-200 ${
              darkMode
                ? 'bg-[#1a1a1e] text-gray-200 placeholder-gray-500'
                : 'bg-[#FFF8F0] text-gray-800 placeholder-gray-400'
            }`}
            style={{
              width: `${nameInputWidth}px`,
              padding: '8px 16px',
            }}
            onFocus={(e) => {
              const wrapper = e.currentTarget.parentElement!;
              wrapper.style.background = darkMode
                ? 'rgba(255,255,255,0.7)'
                : 'linear-gradient(90deg, rgba(255,123,107,0.8), rgba(168,85,247,0.8), rgba(59,130,246,0.8))';
            }}
            onBlur={(e) => {
              const wrapper = e.currentTarget.parentElement!;
              wrapper.style.background = 'transparent';
            }}
            placeholder="Enter your name..."
          />
        </div>
      </div>

      {/* Ditto Character - centered in viewport */}
      <DittoCharacter
        mousePos={mousePos}
        isPopupOpen={selectedButton !== null}
        audioLevel={audioLevel}
      />

      {/* Question input below Ditto */}
      <div
        className="absolute left-1/2 z-30"
        style={{ top: '68%', transform: 'translateX(-50%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <form
          className="flex items-end gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!questionText.trim() || questionSaving) return;
            if (!userId) return;
            setQuestionSaving(true);
            try {
              // Get text answer from Backboard
              const res = await fetch('/api/save-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: questionText, userId }),
              });
              const data = await res.json();
              if (data.success) {
                setQuestionText('');

                // Speak the answer with cloned voice
                try {
                  const audioRes = await fetch('/api/voice/speak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: data.answer, userId }),
                  });

                  if (audioRes.ok) {
                    const audioBlob = await audioRes.blob();
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);

                    // Animate mouth using audio analysis
                    const audioCtx = new AudioContext();
                    const source = audioCtx.createMediaElementSource(audio);
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 256;
                    source.connect(analyser);
                    analyser.connect(audioCtx.destination);
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);

                    audio.onplay = () => {
                      const animateMouth = () => {
                        if (audio.paused || audio.ended) return;
                        analyser.getByteFrequencyData(dataArray);
                        const avg = dataArray.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
                        mouthTargetRef.current = Math.min(1, avg / 128);
                        requestAnimationFrame(animateMouth);
                      };
                      startMouthLoop();
                      animateMouth();
                    };

                    audio.onended = () => {
                      stopMouthAnim();
                      audioCtx.close();
                      URL.revokeObjectURL(audioUrl);
                    };

                    audio.play();
                  }
                } catch (voiceErr) {
                  console.warn('Voice playback failed:', voiceErr);
                }
              } else {
                setQuestionText('');
              }
            } catch (err) {
              console.error('Failed to ask question:', err);
            }
            setQuestionSaving(false);
          }}
        >
          <textarea
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value);
              // Auto-resize: reset height then set to scrollHeight
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, window.innerHeight * 0.15) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder={`Ask ${dittoName || 'Ditto'} a question...`}
            rows={1}
            className={`rounded-lg px-4 py-3 text-sm outline-none w-80 backdrop-blur-md border shadow-md resize-none ${darkMode ? 'bg-white/10 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white/60 border-gray-200 text-gray-800'}`}
            style={{ maxHeight: 'calc(100vh - 68% - 80px)', overflow: 'auto' }}
          />
          <button
            type="submit"
            disabled={questionSaving || !questionText.trim()}
            className={`acrylic-button rounded-lg px-4 py-3 font-semibold text-sm relative z-10 disabled:opacity-40 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
            style={{ transform: 'none' }}
          >
            {questionSaving ? '...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Backdrop blur when popup is open */}
      <div
        className="fixed inset-0 transition-all duration-300"
        style={{
          backdropFilter: selectedButton ? 'blur(8px)' : 'blur(0px)',
          backgroundColor: selectedButton ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
          pointerEvents: selectedButton ? 'auto' : 'none',
          zIndex: 40,
        }}
      />

      {/* Buttons at the bottom */}
      <div className="flex gap-8 relative" style={{ zIndex: 45, transform: 'translateX(-15px)' }}>
        <button
          onClick={(e) => handleButtonClick(e, 'quiz')}
          className={`acrylic-button px-8 py-4 rounded-lg font-semibold relative z-0 transition-all duration-700 ease-in-out ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
          style={getButtonStyle('quiz')}
        >
          <span className="relative z-10">Personality Quiz</span>
        </button>
        <button
          onClick={(e) => handleButtonClick(e, 'diary')}
          className={`acrylic-button px-8 py-4 rounded-lg font-semibold relative z-0 transition-all duration-700 ease-in-out ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
          style={getButtonStyle('diary')}
        >
          <span className="relative z-10">Diary</span>
        </button>
        <button
          onClick={(e) => handleButtonClick(e, 'voice')}
          className={`acrylic-button px-8 py-4 rounded-lg font-semibold relative z-0 transition-all duration-700 ease-in-out ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
          style={getButtonStyle('voice')}
        >
          <span className="relative z-10">Voice Cloning</span>
        </button>
      </div>

      {/* Popups */}
      {selectedButton === 'quiz' && (
        <PersonalityQuizPopup
          isOpen={showPopup}
          onClose={() => {
            setShowPopup(false);
            setTimeout(() => setSelectedButton(null), 400);
          }}
          userId={userId}
          darkMode={darkMode}
        />
      )}

      {/* Diary popup */}
      {selectedButton === 'diary' && (
        <DiaryPopup
          isOpen={showPopup}
          onClose={() => {
            setShowPopup(false);
            setTimeout(() => setSelectedButton(null), 400);
          }}
          userId={userId}
          darkMode={darkMode}
          onSavingChange={setDiarySaving}
        />
      )}

      {/* Voice Clone popup */}
      {selectedButton === 'voice' && (
        <VoiceClonePopup
          isOpen={showPopup}
          onClose={() => {
            setShowPopup(false);
            setTimeout(() => setSelectedButton(null), 400);
          }}
          userId={userId}
          darkMode={darkMode}
          onSavingChange={setVoiceSaving}
        />
      )}

      {/* Blockchain popup */}
      {selectedButton === 'blockchain' && (
        <BlockchainPopup
          isOpen={showPopup}
          onClose={() => {
            setShowPopup(false);
            setTimeout(() => setSelectedButton(null), 400);
          }}
          darkMode={darkMode}
        />
      )}

      {/* Solana Info Popup */}
      <SolanaInfoPopup
        isOpen={showSolanaInfo}
        onClose={() => setShowSolanaInfo(false)}
        darkMode={darkMode}
      />

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center pb-24"
          style={{ zIndex: 60 }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="fixed inset-0"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
            }}
          />
          <div
            className="acrylic-button rounded-lg relative"
            style={{ padding: 0, transform: 'none', width: '320px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 text-center">
              <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                Clear all data?
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                This deletes all data inputted for this instance. This action cannot be undone.
              </p>
            </div>
            <div
              className="flex"
              style={{ borderTop: `1px solid ${darkMode ? 'rgba(192,192,192,0.1)' : 'rgba(168, 85, 247, 0.1)'}` }}
            >
              <button
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative z-10 rounded-bl-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode
                    ? 'rgba(192, 192, 192, 0.1)'
                    : 'linear-gradient(90deg, rgba(255,123,107,0.12) 0%, rgba(168,85,247,0.12) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <div style={{ width: '1px', background: darkMode ? 'rgba(192,192,192,0.1)' : 'rgba(168, 85, 247, 0.1)' }} />
              <button
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative z-10 rounded-br-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '';
                }}
                onClick={() => {
                  // TODO: Add clear data logic
                  setShowClearConfirm(false);
                  setMenuOpen(false);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center pb-24"
          style={{ zIndex: 60 }}
          onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
        >
          <div
            className="fixed inset-0"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
            }}
          />
          <div
            className="acrylic-button rounded-lg relative"
            style={{ padding: 0, transform: 'none', width: '380px', zIndex: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 text-center relative z-10">
              <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                Delete your account?
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Type <span className="font-semibold" style={{ color: '#ef4444' }}>I want to delete my account</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="I want to delete my account"
                className={`w-full mt-2 px-3 py-2 text-sm rounded-lg border focus:outline-none ${
                  darkMode
                    ? 'bg-white/10 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-white'
                    : 'bg-white/60 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>
            <div
              className="flex"
              style={{ borderTop: `1px solid ${darkMode ? 'rgba(192,192,192,0.1)' : 'rgba(168, 85, 247, 0.1)'}` }}
            >
              <button
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative z-10 rounded-bl-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode
                    ? 'rgba(192, 192, 192, 0.1)'
                    : 'linear-gradient(90deg, rgba(255,123,107,0.12) 0%, rgba(168,85,247,0.12) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
              >
                Cancel
              </button>
              <div style={{ width: '1px', background: darkMode ? 'rgba(192,192,192,0.1)' : 'rgba(168, 85, 247, 0.1)' }} />
              <button
                disabled={deleteConfirmText !== 'I want to delete my account'}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative z-10 rounded-br-lg ${
                  deleteConfirmText === 'I want to delete my account'
                    ? ''
                    : 'opacity-30 cursor-not-allowed'
                } ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => {
                  if (deleteConfirmText === 'I want to delete my account') {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                    e.currentTarget.style.color = '#ef4444';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '';
                }}
                onClick={() => {
                  if (deleteConfirmText === 'I want to delete my account') {
                    // TODO: Add delete account logic
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                    setMenuOpen(false);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purple loading cursor overlay */}
      {isAnySubmitting && (
        <div
          ref={cursorRef}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 99999,
            transform: 'translate(-50%, -50%)',
            top: 0,
            left: 0,
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              border: darkMode ? '3px solid rgba(255,255,255,0.2)' : '3px solid rgba(168, 85, 247, 0.25)',
              borderTopColor: darkMode ? '#FFFFFF' : '#A855F7',
              borderRadius: '50%',
              animation: 'cursor-spin 0.7s linear infinite',
            }}
          />
        </div>
      )}
    </main>
  );
}
