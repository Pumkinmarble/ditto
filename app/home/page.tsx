'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@auth0/nextjs-auth0/client';
import PersonalityQuizPopup from './components/PersonalityQuizPopup';
import DiaryPopup from './components/DiaryPopup';
import VoiceClonePopup from './components/VoiceClonePopup';

const DittoCharacter = dynamic(() => import('./components/DittoCharacter'), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  const { user } = useUser();
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mouthTargetRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const wordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
        if (menuOpen) {
          setMenuOpen(false);
        }
        if (showProfileMenu) {
          setShowProfileMenu(false);
        }
        if (selectedButton) {
          e.preventDefault();
          setShowPopup(false);
          setTimeout(() => setSelectedButton(null), 400);
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedButton, showProfileMenu, menuOpen]);

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
    setIsSpeaking(false);
  }, []);

  const handleTestVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) return;

    const text = "Hi! I'm Ditto, your digital twin. I can talk, move, and even jiggle when you get close to me!";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.2;

    utterance.onstart = () => {
      setIsSpeaking(true);
      startMouthLoop();
    };

    // Word boundary events — fire at each word during speech
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Get the word being spoken
        const word = text.substring(event.charIndex, event.charIndex + (event.charLength || 4));
        // Estimate openness from word length — longer words = wider mouth
        const openness = Math.min(1, 0.4 + word.length * 0.08);
        mouthTargetRef.current = openness;

        // Close mouth briefly after each word (natural pause between words)
        if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
        wordTimerRef.current = setTimeout(() => {
          mouthTargetRef.current = 0.05;
        }, Math.max(80, word.length * 50));
      }
    };

    utterance.onend = stopMouthAnim;
    utterance.onerror = stopMouthAnim;
    speechSynthesis.speak(utterance);
  };

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
    if (menuOpen) {
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
      // Selected button slides to middle position
      if (buttonName === 'quiz') {
        // Left button (A) slides RIGHT to middle (B's position)
        return { transform: 'translateX(180px)' };
      } else if (buttonName === 'voice') {
        // Right button (C) slides LEFT to middle (B's position)
        return { transform: 'translateX(-180px)' };
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
      className="min-h-screen flex items-end justify-center pb-16 relative"
      style={{ background: '#FFF8F0' }}
      onClick={handleBackgroundClick}
      onMouseMove={handleMouseMove}
    >
      {/* Hamburger Menu - Top Left */}
      <div className="absolute top-6 left-6 z-30">
        <div
          className="acrylic-button rounded-lg overflow-hidden"
          style={{
            width: menuOpen ? '280px' : '48px',
            height: menuOpen ? '300px' : '48px',
            padding: 0,
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Toggle button area */}
          <button
            className="w-12 h-12 flex flex-col items-center justify-center relative z-10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {/* Line 1 → top of X */}
            <span
              className="block w-5 h-[2px] bg-gray-700 rounded-full absolute transition-all duration-300"
              style={{
                transform: menuOpen ? 'rotate(45deg)' : 'translateY(-6px)',
              }}
            />
            {/* Line 2 → fades out */}
            <span
              className="block w-5 h-[2px] bg-gray-700 rounded-full absolute transition-all duration-300"
              style={{
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)',
              }}
            />
            {/* Line 3 → bottom of X */}
            <span
              className="block w-5 h-[2px] bg-gray-700 rounded-full absolute transition-all duration-300"
              style={{
                transform: menuOpen ? 'rotate(-45deg)' : 'translateY(6px)',
              }}
            />
          </button>

          {/* Menu content */}
          <div
            className="flex flex-col justify-end"
            style={{
              opacity: menuOpen ? 1 : 0,
              transition: 'opacity 0.2s ease',
              transitionDelay: menuOpen ? '0.2s' : '0s',
              pointerEvents: menuOpen ? 'auto' : 'none',
              height: menuOpen ? 'calc(100% - 48px)' : '0',
            }}
          >
            <div className="flex-1" />
            <div style={{ borderTop: '1px solid rgba(168, 85, 247, 0.1)' }} />
            <button
              className="block w-full px-3 py-2 text-sm font-semibold text-gray-800 text-left transition-colors relative z-10 rounded-b-lg"
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
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg hover:shadow-xl transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 relative z-10"
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
              {/* Triangle tip pointing up toward bottom-left of profile pic */}
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: 'calc(100% - 24px)',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid rgba(255,255,255,0.85)',
                }}
              />
              <div
                className="w-52 rounded-lg rounded-tr-none acrylic-button"
                style={{ padding: 0, transform: 'none' }}
              >
                <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(168, 85, 247, 0.1)' }}>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
                <a
                  href="/api/auth/logout"
                  className="block px-3 py-2 text-sm font-semibold text-gray-800 transition-colors relative z-10 rounded-b-lg"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(90deg, rgba(255,123,107,0.12) 0%, rgba(168,85,247,0.12) 100%)';
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

      {/* Ditto Character - centered in viewport */}
      <DittoCharacter
        mousePos={mousePos}
        isPopupOpen={selectedButton !== null}
        audioLevel={audioLevel}
      />

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
      <div className="flex gap-8 relative" style={{ zIndex: 45 }}>
        <button
          onClick={(e) => handleButtonClick(e, 'quiz')}
          className="acrylic-button px-8 py-4 rounded-lg font-semibold text-gray-800 relative z-0 transition-all duration-700 ease-in-out"
          style={getButtonStyle('quiz')}
        >
          <span className="relative z-10">Personality Quiz</span>
        </button>
        <button
          onClick={(e) => handleButtonClick(e, 'diary')}
          className="acrylic-button px-8 py-4 rounded-lg font-semibold text-gray-800 relative z-0 transition-all duration-700 ease-in-out"
          style={getButtonStyle('diary')}
        >
          <span className="relative z-10">Diary</span>
        </button>
        <button
          onClick={(e) => handleButtonClick(e, 'voice')}
          className="acrylic-button px-8 py-4 rounded-lg font-semibold text-gray-800 relative z-0 transition-all duration-700 ease-in-out"
          style={getButtonStyle('voice')}
        >
          <span className="relative z-10">Voice Cloning</span>
        </button>
        <button
          onClick={handleTestVoice}
          className="acrylic-button px-8 py-4 rounded-lg font-semibold text-gray-800 relative z-0 transition-all duration-700 ease-in-out"
        >
          <span className="relative z-10">Test Voice</span>
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
          mousePos={mousePos}
          isHovering={isHovering}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          userId={userId}
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
          mousePos={mousePos}
          isHovering={isHovering}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          userId={userId}
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
          mousePos={mousePos}
          isHovering={isHovering}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          userId={userId}
        />
      )}
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
              <p className="text-base font-semibold text-black">
                Clear all data?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This deletes all data inputted for this instance. This action cannot be undone.
              </p>
            </div>
            <div
              className="flex"
              style={{ borderTop: '1px solid rgba(168, 85, 247, 0.1)' }}
            >
              <button
                className="flex-1 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors relative z-10 rounded-bl-lg"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, rgba(255,123,107,0.12) 0%, rgba(168,85,247,0.12) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <div style={{ width: '1px', background: 'rgba(168, 85, 247, 0.1)' }} />
              <button
                className="flex-1 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors relative z-10 rounded-br-lg"
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
    </main>
  );
}
