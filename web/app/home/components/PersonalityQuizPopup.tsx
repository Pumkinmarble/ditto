'use client';

import { useState } from 'react';
import { QUESTIONS, Response, initializeScores, calculateScore, calculatePersonalityType, getPersonalityDescription, getDimensionBreakdown, PersonalityType } from '../../../utils/personalityTest';

interface PersonalityQuizPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mousePos: { x: number; y: number };
  isHovering: boolean;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function PersonalityQuizPopup({
  isOpen,
  onClose,
  mousePos,
  isHovering,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
}: PersonalityQuizPopupProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Response[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId] = useState(() => Date.now().toString());
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<{ type: PersonalityType; description: any; dimensions: any[] } | null>(null);

  const totalQuestions = QUESTIONS.length;
  const question = QUESTIONS[currentQuestion];

  const handleSubmitAnswer = () => {
    const answer = parseInt(inputValue);
    if (answer >= 1 && answer <= 5) {
      const newAnswers = [...answers, answer as Response];
      setAnswers(newAnswers);

      // Save to file (we'll implement this next)
      saveAnswerToFile(currentQuestion + 1, question.text, answer);

      // Move to next question or finish
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setInputValue('');
      } else {
        // Quiz complete
        handleQuizComplete(newAnswers);
      }
    }
  };

  const saveAnswerToFile = async (questionNum: number, questionText: string, answer: number) => {
    try {
      await fetch('/api/save-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionNum,
          questionText,
          answer,
          sessionId,
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
      const score = calculateScore(response, question.direction);
      scores[question.dimension] += score;
    });

    const personalityType = calculatePersonalityType(scores);
    const description = getPersonalityDescription(personalityType);
    const dimensions = getDimensionBreakdown(scores);

    // Save results to file
    await saveResultsToFile(personalityType, description, dimensions);

    // Show results
    setResult({ type: personalityType, description, dimensions });
    setIsComplete(true);
  };

  const saveResultsToFile = async (type: PersonalityType, description: any, dimensions: any[]) => {
    try {
      await fetch('/api/save-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionNum: 'RESULTS',
          questionText: `\n=== QUIZ RESULTS ===\nPersonality Type: ${type}\nDescription: ${description.baseDescription}\nIdentity: ${description.identityDescription}\n\nDimension Breakdown:\n${dimensions.map(d => `${d.name}: ${d.percentage}%`).join('\n')}`,
          answer: '',
          sessionId,
        }),
      });
    } catch (error) {
      console.error('Failed to save results:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
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
        width: '700px',
        height: isComplete ? '720px' : '330px',
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
        {!isComplete ? (
          <>
            {/* Header with progress */}
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Personality Quiz</h2>
              <span className="text-gray-400 text-lg">
                {currentQuestion + 1}/{totalQuestions}
              </span>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <p className="text-xl text-gray-800 mb-2">
                  {currentQuestion + 1}. {question.text}
                </p>
                <p className="text-sm text-gray-500 italic">
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
                  className="w-32 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  autoFocus
                />
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!inputValue || parseInt(inputValue) < 1 || parseInt(inputValue) > 5}
                  style={{ backgroundColor: '#4C1D95' }}
                  className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Your Results</h2>

              {result && (
                <div className="space-y-6">
                  {/* Personality Type */}
                  <div className="text-center mb-6">
                    <div
                      className="inline-block px-6 py-3 rounded-xl text-3xl font-bold mb-3"
                      style={{
                        background: `
                          linear-gradient(90deg,
                            rgba(255, 123, 107, 0.08) 0%,
                            rgba(168, 85, 247, 0.08) 50%,
                            rgba(59, 130, 246, 0.08) 100%
                          ),
                          linear-gradient(145deg, #FFFFFF, #FFF5E8)
                        `,
                        color: '#1F2937',
                        boxShadow: `
                          0 10px 30px rgba(0, 0, 0, 0.12),
                          0 1px 8px rgba(0, 0, 0, 0.08),
                          inset 0 2px 4px rgba(255, 255, 255, 1),
                          inset 0 -2px 4px rgba(0, 0, 0, 0.08)
                        `
                      }}
                    >
                      {result.type}
                    </div>
                    <p className="text-lg text-gray-800 font-semibold mb-1">
                      {result.description.baseDescription}
                    </p>
                    <p className="text-sm text-gray-600">
                      {result.description.identityDescription}
                    </p>
                  </div>

                  {/* Dimension Breakdown */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Dimension Breakdown</h3>
                    <div className="space-y-2">
                      {result.dimensions.map((dim, index) => (
                        <div key={index} className="bg-white/50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-semibold text-gray-800">{dim.name}</span>
                            <span className="text-sm font-bold" style={{ color: '#4C1D95' }}>{dim.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${dim.percentage}%`,
                                backgroundColor: '#4C1D95'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="w-full mt-4 px-6 py-2.5 rounded-lg font-semibold transition hover:opacity-75 text-gray-800"
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
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
