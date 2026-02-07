'use client';

import { useState, useRef } from 'react';
import Toast from './Toast';

interface DiaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mousePos: { x: number; y: number };
  isHovering: boolean;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function DiaryPopup({
  isOpen,
  onClose,
  mousePos,
  isHovering,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
}: DiaryPopupProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentFont, setCurrentFont] = useState('Arial');
  const [sessionId] = useState(() => Date.now().toString());
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  const updateFormattingState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateFormattingState();
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const font = e.target.value;
    setCurrentFont(font);
    execCommand('fontName', font);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '\t');
    }
  };

  const handleSave = async () => {
    if (!editorRef.current) return;

    const content = editorRef.current.innerText;
    if (!content.trim() || content.trim() === 'Start writing...') {
      setToastMessage('Please write something before saving!');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      await fetch('/api/save-diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          sessionId,
        }),
      });
      setToastMessage('Diary entry saved successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Failed to save diary:', error);
      setToastMessage('Failed to save diary entry. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
        height: '700px',
        left: '50%',
        transform: isOpen
          ? 'translate(-50%, -50%)'
          : 'translate(-50%, 50vh)',
        top: isOpen ? '45%' : '100%',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Gradient glow that follows cursor */}
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
          opacity: isOpen && isHovering ? 1 : 0,
          transition: 'opacity 0.3s ease',
          borderRadius: '1rem',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentDate}</h2>
          <p className="text-sm text-gray-600">
            This is where you can write daily journals, or whatever you want
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
          {/* Font selector */}
          <select
            value={currentFont}
            onChange={handleFontChange}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-white"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
          </select>

          {/* Bold button */}
          <button
            onClick={() => execCommand('bold')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold text-sm"
            style={{
              backgroundColor: isBold ? '#E9D5FF' : 'white',
              borderColor: isBold ? '#A855F7' : '#D1D5DB'
            }}
            title="Bold"
          >
            B
          </button>

          {/* Italic button */}
          <button
            onClick={() => execCommand('italic')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition italic text-sm"
            style={{
              backgroundColor: isItalic ? '#E9D5FF' : 'white',
              borderColor: isItalic ? '#A855F7' : '#D1D5DB'
            }}
            title="Italic"
          >
            I
          </button>

          {/* Underline button */}
          <button
            onClick={() => execCommand('underline')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition underline text-sm"
            style={{
              backgroundColor: isUnderline ? '#E9D5FF' : 'white',
              borderColor: isUnderline ? '#A855F7' : '#D1D5DB'
            }}
            title="Underline"
          >
            U
          </button>
        </div>

        {/* Text editor */}
        <div
          ref={editorRef}
          contentEditable
          onKeyDown={handleKeyDown}
          onKeyUp={updateFormattingState}
          onMouseUp={updateFormattingState}
          className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 overflow-y-auto bg-white/50 text-black"
          style={{
            minHeight: '400px',
            maxHeight: '450px',
            fontFamily: currentFont,
            color: '#000000 !important',
          }}
          suppressContentEditableWarning
        >
          {/* Placeholder text - will disappear when user starts typing */}
          <span className="text-gray-400">Start writing...</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 rounded-lg font-semibold transition hover:opacity-75 text-gray-800"
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
              `
            }}
          >
            Close
          </button>

          {/* Submit button */}
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-2.5 rounded-lg font-semibold transition hover:opacity-90 text-white"
            style={{ backgroundColor: '#4C1D95' }}
          >
            Save Entry
          </button>
        </div>
      </div>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
