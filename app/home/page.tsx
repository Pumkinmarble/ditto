'use client';

import { useState, useEffect } from 'react';
import PersonalityQuizPopup from './components/PersonalityQuizPopup';
import DiaryPopup from './components/DiaryPopup';
import VoiceClonePopup from './components/VoiceClonePopup';

export default function HomePage() {
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Handle Escape key to close popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedButton) {
        e.preventDefault(); // Prevent default Escape behavior (focus shifting)
        setShowPopup(false);
        setTimeout(() => setSelectedButton(null), 400);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedButton]);

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
    >
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

      {/* Three buttons at the bottom */}
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
