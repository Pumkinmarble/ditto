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
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
  const [dittoName, setDittoName] = useState('Ditto');

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
      className={`min-h-screen flex items-end justify-center pb-16 relative transition-colors duration-500 ${darkMode ? 'dark' : ''}`}
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
            height: menuOpen ? '300px' : '48px',
            padding: 0,
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top row: toggle button + name input */}
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
            {/* Editable name - visible when menu is open */}
            <input
              type="text"
              value={dittoName}
              onChange={(e) => setDittoName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              className={`h-8 px-2 text-sm font-semibold rounded-lg border focus:outline-none transition relative z-10 ${
                darkMode
                  ? 'bg-white/10 border-gray-600 text-gray-200 focus:border-white placeholder-white'
                  : 'bg-white/50 border-gray-300 text-gray-800 focus:border-purple-500 placeholder-black'
              }`}
              style={{
                opacity: menuOpen ? 1 : 0,
                width: menuOpen ? 'calc(100% - 60px)' : '0',
                padding: menuOpen ? undefined : '0',
                border: menuOpen ? undefined : 'none',
                transition: 'opacity 0.2s ease, width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: menuOpen ? '0.15s' : '0s',
                marginRight: menuOpen ? '12px' : '0',
              }}
              placeholder="Enter a name..."
            />
          </div>

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
          className="flex items-center gap-2"
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
                      setIsSpeaking(true);
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
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={`Ask ${dittoName || 'Ditto'} a question...`}
            className={`rounded-lg px-4 py-3 text-sm outline-none w-80 backdrop-blur-md border shadow-md ${darkMode ? 'bg-white/10 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white/60 border-gray-200 text-gray-800'}`}
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
      <div className="flex gap-8 relative" style={{ zIndex: 45 }}>
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
        <button
          onClick={handleTestVoice}
          className={`acrylic-button px-8 py-4 rounded-lg font-semibold relative z-0 transition-all duration-700 ease-in-out ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
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
    </main>
  );
}
