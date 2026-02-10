'use client';

import { useState, useRef } from 'react';
import Toast from './Toast';
import { getSessionId } from '../../../lib/session';

interface DiaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  darkMode: boolean;
  onSavingChange?: (saving: boolean) => void;
}

export default function DiaryPopup({
  isOpen,
  onClose,
  userId,
  darkMode,
  onSavingChange,
}: DiaryPopupProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentFont, setCurrentFont] = useState('Arial');
  const [sessionId] = useState(() => getSessionId());
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });
  const [localHovering, setLocalHovering] = useState(false);

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
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '\t');
    }
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerText;
    if (!content.trim()) {
      setToastMessage('Please write something before saving!');
      setToastType('error');
      setShowToast(true);
      return;
    }
    onSavingChange?.(true);
    try {
      await fetch('/api/save-diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          sessionId: userId || sessionId,
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
    onSavingChange?.(false);
  };

  // Theme-dependent styles
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
        width: '900px',
        height: '700px',
        left: '50%',
        transform: isOpen ? 'translate(-50%, -50%)' : 'translate(-50%, 50vh)',
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
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          background: glowGradient,
          opacity: isOpen && localHovering ? 1 : 0,
          transition: 'opacity 0.3s ease',
          borderRadius: '1rem',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{currentDate}</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            This is where you can write daily journals, or whatever you want!
          </p>
        </div>

        {/* Toolbar */}
        <div className={`flex items-center gap-2 mb-4 pb-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          {/* Font selector */}
          <select
            value={currentFont}
            onChange={handleFontChange}
            className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none ${
              darkMode
                ? 'bg-white/10 border-gray-600 text-gray-200 focus:border-white'
                : 'bg-white border-gray-300 text-gray-800 focus:border-purple-500'
            }`}
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
            className={`px-3 py-1.5 border rounded-lg hover:opacity-80 transition font-bold text-sm ${darkMode ? 'text-gray-200' : ''}`}
            style={{
              backgroundColor: isBold ? (darkMode ? 'rgba(255,255,255,0.2)' : '#E9D5FF') : (darkMode ? 'rgba(255,255,255,0.1)' : 'white'),
              borderColor: isBold ? (darkMode ? '#FFFFFF' : '#A855F7') : (darkMode ? '#4B5563' : '#D1D5DB'),
            }}
            title="Bold"
          >
            B
          </button>

          {/* Italic button */}
          <button
            onClick={() => execCommand('italic')}
            className={`px-3 py-1.5 border rounded-lg hover:opacity-80 transition italic text-sm ${darkMode ? 'text-gray-200' : ''}`}
            style={{
              backgroundColor: isItalic ? (darkMode ? 'rgba(255,255,255,0.2)' : '#E9D5FF') : (darkMode ? 'rgba(255,255,255,0.1)' : 'white'),
              borderColor: isItalic ? (darkMode ? '#FFFFFF' : '#A855F7') : (darkMode ? '#4B5563' : '#D1D5DB'),
            }}
            title="Italic"
          >
            I
          </button>

          {/* Underline button */}
          <button
            onClick={() => execCommand('underline')}
            className={`px-3 py-1.5 border rounded-lg hover:opacity-80 transition underline text-sm ${darkMode ? 'text-gray-200' : ''}`}
            style={{
              backgroundColor: isUnderline ? (darkMode ? 'rgba(255,255,255,0.2)' : '#E9D5FF') : (darkMode ? 'rgba(255,255,255,0.1)' : 'white'),
              borderColor: isUnderline ? (darkMode ? '#FFFFFF' : '#A855F7') : (darkMode ? '#4B5563' : '#D1D5DB'),
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
          className={`flex-1 p-4 border-2 rounded-lg focus:outline-none overflow-y-auto ${
            darkMode
              ? 'bg-white/5 border-gray-600 text-gray-200 focus:border-white'
              : 'bg-white/50 border-gray-300 text-black focus:border-purple-500'
          }`}
          style={{
            minHeight: '400px',
            maxHeight: '450px',
            fontFamily: currentFont,
          }}
          suppressContentEditableWarning
          data-placeholder="Start writing..."
          onInput={(e) => {
            const el = e.currentTarget;
            if (el.innerHTML === '<br>' || el.innerHTML === '<div><br></div>') {
              el.innerHTML = '';
            }
          }}
        />


        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className={`flex-1 px-6 py-2.5 rounded-lg font-semibold transition hover:opacity-75 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
            style={{ background: popupBg, boxShadow: popupShadow }}
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 px-6 py-2.5 rounded-lg font-semibold transition hover:opacity-90 ${darkMode ? 'text-gray-800' : 'text-white'}`}
            style={{ backgroundColor: darkMode ? '#FFFFFF' : '#4C1D95' }}
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
