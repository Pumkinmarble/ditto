'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(-50%, 0)' : 'translate(-50%, -20px)',
      }}
    >
      <div
        className="px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]"
        style={{
          background: type === 'success'
            ? `linear-gradient(90deg,
                rgba(34, 197, 94, 0.08) 0%,
                rgba(22, 163, 74, 0.08) 100%
              ),
              linear-gradient(145deg, #FFFFFF, #F0FDF4)`
            : `linear-gradient(90deg,
                rgba(239, 68, 68, 0.08) 0%,
                rgba(220, 38, 38, 0.08) 100%
              ),
              linear-gradient(145deg, #FFFFFF, #FEF2F2)`,
          boxShadow: `
            0 10px 30px rgba(0, 0, 0, 0.15),
            0 1px 8px rgba(0, 0, 0, 0.1),
            inset 0 2px 4px rgba(255, 255, 255, 1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.08)
          `,
          border: `2px solid ${type === 'success' ? '#22C55E' : '#EF4444'}`,
        }}
      >
        {/* Icon */}
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white"
          style={{
            backgroundColor: type === 'success' ? '#22C55E' : '#EF4444',
          }}
        >
          {type === 'success' ? '✓' : '✕'}
        </div>

        {/* Message */}
        <p className="text-gray-800 font-semibold flex-1">
          {message}
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
