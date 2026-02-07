'use client';

import { useState, useEffect } from 'react';
import PersonalityQuizPopup from './components/PersonalityQuizPopup';
import DiaryPopup from './components/DiaryPopup';

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

  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent background click when clicking popup
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
        return { transform: 'translateX(200px)' };
      } else if (buttonName === 'voice') {
        // Right button (C) slides LEFT to middle (B's position)
        return { transform: 'translateX(-200px)' };
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
      {/* Three buttons at the bottom */}
      <div className="flex gap-8 relative">
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

      {selectedButton === 'voice' && (
        <div
          onClick={handlePopupClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="fixed transition-all duration-300 ease-in-out rounded-2xl shadow-2xl p-8"
          style={{
            background: `
              linear-gradient(90deg,
                rgba(255, 123, 107, 0.03) 0%,
                rgba(168, 85, 247, 0.03) 50%,
                rgba(59, 130, 246, 0.03) 100%
              ),
              linear-gradient(145deg, #FFFFFF, #FFF5E8)
            `,
            boxShadow: `
              0 10px 30px rgba(0, 0, 0, 0.12),
              0 1px 8px rgba(0, 0, 0, 0.08),
              inset 0 2px 4px rgba(255, 255, 255, 1),
              inset 0 -2px 4px rgba(0, 0, 0, 0.08)
            `,
            width: '900px',
            height: '600px',
            left: '50%',
            transform: showPopup
              ? 'translate(-50%, -50%)'
              : 'translate(-50%, 50vh)',
            top: showPopup ? '45%' : '100%',
            opacity: showPopup ? 1 : 0,
            pointerEvents: showPopup ? 'auto' : 'none',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
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
              opacity: showPopup && isHovering ? 1 : 0,
              transition: 'opacity 0.3s ease',
              borderRadius: '1rem',
            }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Voice Cloning</h2>
            <p className="text-gray-600">Content for voice cloning goes here...</p>
          </div>
        </div>
      )}
    </main>
  );
}
