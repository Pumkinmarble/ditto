'use client';

import { useState, useEffect } from 'react';
import { QUESTIONS, Response, initializeScores, calculateScore, calculatePersonalityType, getPersonalityDescription, getDimensionBreakdown, PersonalityType } from '../../../utils/personalityTest';
import { getSessionId } from '../../../lib/session';

interface PersonalityQuizPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  darkMode: boolean;
}

export default function PersonalityQuizPopup({
  isOpen,
  onClose,
  userId,
  darkMode,
}: PersonalityQuizPopupProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Response[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId] = useState(() => getSessionId());
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<{ type: PersonalityType; description: any; dimensions: any[] } | null>(null);
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });
  const [localHovering, setLocalHovering] = useState(false);

  const totalQuestions = QUESTIONS.length;
  const question = QUESTIONS[currentQuestion];

  // Load saved results from localStorage on mount
  useEffect(() => {
    const savedResults = localStorage.getItem('personalityQuizResults');
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setResult(parsedResults);
        setIsComplete(true);
      } catch (error) {
        console.error('Failed to load saved results:', error);
      }
    }
  }, []);

  const handleTryAgain = () => {
    localStorage.removeItem('personalityQuizResults');
    setCurrentQuestion(0);
    setAnswers([]);
    setInputValue('');
    setIsComplete(false);
    setResult(null);
  };

  const handleSubmitAnswer = () => {
    const answer = parseInt(inputValue);
    if (answer >= 1 && answer <= 5 && question) {
      const newAnswers = [...answers, answer as Response];
      setAnswers(newAnswers);
      saveAnswerToFile(currentQuestion + 1, question.text, answer);
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setInputValue('');
      } else {
        handleQuizComplete(newAnswers);
      }
    }
  };

  const saveAnswerToFile = async (questionNum: number, questionText: string, answer: number) => {
    try {
      await fetch('/api/save-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionNum,
          questionText,
          answer,
          sessionId: userId || sessionId,
        }),
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleQuizComplete = async (finalAnswers: Response[]) => {
    const scores = initializeScores();
    finalAnswers.forEach((response, index) => {
      const question = QUESTIONS[index];
      if (question) {
        const score = calculateScore(response, question.direction);
        scores[question.dimension] += score;
      }
    });
    const personalityType = calculatePersonalityType(scores);
    const description = getPersonalityDescription(personalityType);
    const dimensions = getDimensionBreakdown(scores);
    await saveResultsToFile(personalityType, description, dimensions);
    const resultsToSave = { type: personalityType, description, dimensions };
    localStorage.setItem('personalityQuizResults', JSON.stringify(resultsToSave));
    setResult(resultsToSave);
    setIsComplete(true);
  };

  const saveResultsToFile = async (type: PersonalityType, description: any, dimensions: any[]) => {
    try {
      const response = await fetch('/api/personality/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalityType: type,
          description,
          dimensions,
          sessionId: userId || sessionId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        console.log('✅ Personality results saved to Supabase!', data);
      } else {
        console.error('❌ Failed to save to Supabase:', data.error);
      }
    } catch (error) {
      console.error('Failed to save results:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
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
        width: '700px',
        height: isComplete ? '720px' : '330px',
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
        {!isComplete ? (
          <>
            {/* Header with progress */}
            <div className="flex justify-between items-start mb-8">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Personality Quiz</h2>
              <span className={`text-lg ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {currentQuestion + 1}/{totalQuestions}
              </span>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <p className={`text-xl mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {currentQuestion + 1}. {question?.text}
                </p>
                <p className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Answer (1-5): 1 = Strongly Disagree, 5 = Strongly Agree
                </p>
              </div>

              {/* Answer input */}
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter 1-5"
                  className={`w-32 px-4 py-3 text-lg border-2 rounded-lg focus:outline-none transition ${
                    darkMode
                      ? 'bg-white/10 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-white'
                      : 'border-gray-300 text-gray-800 focus:border-purple-500'
                  }`}
                  autoFocus
                />
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!inputValue || parseInt(inputValue) < 1 || parseInt(inputValue) > 5}
                  style={{ backgroundColor: darkMode ? '#FFFFFF' : '#4C1D95' }}
                  className={`px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'text-gray-800' : 'text-white'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results Screen */}
            <div className="h-full">
              <h2 className={`text-2xl font-bold mb-4 text-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Your Results</h2>

              {result && (
                <div className="space-y-6">
                  {/* Personality Type */}
                  <div className="text-center mb-6">
                    <div
                      className="inline-block px-6 py-3 rounded-xl text-3xl font-bold mb-3"
                      style={{
                        background: popupBg,
                        color: darkMode ? '#E5E7EB' : '#1F2937',
                        boxShadow: popupShadow,
                      }}
                    >
                      {result.type}
                    </div>
                    <p className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {result.description.baseDescription}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {result.description.identityDescription}
                    </p>
                  </div>

                  {/* Dimension Breakdown */}
                  <div>
                    <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dimension Breakdown</h3>
                    <div className="space-y-2">
                      {result.dimensions.map((dim, index) => (
                        <div key={index} className={`rounded-lg p-3 ${darkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{dim.name}</span>
                            <span className="text-sm font-bold" style={{ color: darkMode ? '#FFFFFF' : '#4C1D95' }}>{dim.percentage}%</span>
                          </div>
                          <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${dim.percentage}%`,
                                backgroundColor: darkMode ? '#FFFFFF' : '#4C1D95',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

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
                      onClick={handleTryAgain}
                      className={`flex-1 px-6 py-2.5 rounded-lg font-semibold transition hover:opacity-90 ${darkMode ? 'text-gray-800' : 'text-white'}`}
                      style={{ backgroundColor: darkMode ? '#FFFFFF' : '#4C1D95' }}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
