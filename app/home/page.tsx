'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import PersonalityQuizPopup from './components/PersonalityQuizPopup';
import DiaryPopup from './components/DiaryPopup';
import VoiceClonePopup from './components/VoiceClonePopup';

export default function HomePage() {
  const { user } = useUser();
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedButton, showProfileMenu, menuOpen]);

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
            style={{
              opacity: menuOpen ? 1 : 0,
              transition: 'opacity 0.2s ease',
              transitionDelay: menuOpen ? '0.2s' : '0s',
              pointerEvents: menuOpen ? 'auto' : 'none',
            }}
          >
            <div style={{ borderTop: '1px solid rgba(168, 85, 247, 0.1)' }} />
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
