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

  // Handle Escape key to close popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedButton) {
        e.preventDefault();
        setShowPopup(false);
        setTimeout(() => setSelectedButton(null), 400);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedButton]);

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
      {/* Logout Section - Top Right */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
        {user ? (
          <>
            {/* User Info */}
            <div className="flex items-center gap-3 acrylic-button px-4 py-2 rounded-lg">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                  {user.name || user.email}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <a
              href="/api/auth/logout"
              className="acrylic-button px-4 py-2 rounded-lg font-semibold text-gray-800 hover:bg-red-50 transition-colors relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              Logout
            </a>
          </>
        ) : (
          /* Dev Mode - Back to Login Button */
          <a
            href="/login"
            className="acrylic-button p-2 rounded-lg hover:bg-gray-100 transition-colors relative z-10"
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
        />
      )}
    </main>
  );
}
