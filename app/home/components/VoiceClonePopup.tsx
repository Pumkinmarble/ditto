'use client';

import { useState, useRef, useEffect } from 'react';
import Toast from './Toast';

interface VoiceClonePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  darkMode: boolean;
  onSavingChange?: (saving: boolean) => void;
}

export default function VoiceClonePopup({
  isOpen,
  onClose,
  userId,
  darkMode,
  onSavingChange,
}: VoiceClonePopupProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [volume, setVolume] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });
  const [localHovering, setLocalHovering] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const allChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopMicrophone = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      stopMicrophone();
    };
  }, []);

  useEffect(() => {
    if (!isOpen && isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setVolume(0);
      stopMicrophone();
    }
  }, [isOpen, isRecording]);

  const initRecorder = async (isResume: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.3;

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      if (!isResume) {
        allChunksRef.current = [];
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        allChunksRef.current = [...allChunksRef.current, ...audioChunksRef.current];
        const combinedBlob = new Blob(allChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(combinedBlob);
        setAudioUrl(URL.createObjectURL(combinedBlob));
        stopMicrophone();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);

      if (!isResume) {
        setRecordingTime(0);
      }

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      visualizeVolume();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setToastMessage('Failed to access microphone. Please allow microphone access.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const startRecording = () => initRecorder(false);
  const resumeRecording = () => initRecorder(true);

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setVolume(0);
    }
  };

  const visualizeVolume = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const updateVolume = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedVolume = (average / 40) * 1.5;
      setVolume(Math.min(normalizedVolume, 1));
      animationRef.current = requestAnimationFrame(updateVolume);
    };
    updateVolume();
  };

  const playRecording = () => {
    if (audioUrl && audioPlayerRef.current) {
      audioPlayerRef.current.play();
      setIsPlaying(true);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = setInterval(() => {
        if (audioPlayerRef.current) {
          setPlaybackTime(Math.floor(audioPlayerRef.current.currentTime));
        }
      }, 100);
    }
  };

  const pauseRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      setToastMessage('Please record audio first!');
      setToastType('error');
      setShowToast(true);
      return;
    }
    if (recordingTime < 60) {
      setToastMessage('Please record at least 60 seconds of audio!');
      setToastType('error');
      setShowToast(true);
      return;
    }
    if (!userId) {
      setToastMessage('Please log in to save your voice!');
      setToastType('error');
      setShowToast(true);
      return;
    }
    onSavingChange?.(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, `${userId}.webm`);
      formData.append('userId', userId);
      formData.append('voiceName', userId);
      formData.append('cloneVoice', 'true');

      const response = await fetch('/api/voice/upload-diary', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setToastMessage('Voice cloned and transcribed successfully!');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => { onClose(); }, 2000);
      } else {
        throw new Error(data.error || 'Failed to save recording');
      }
    } catch (error) {
      console.error('Failed to save recording:', error);
      setToastMessage('Failed to save recording. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
    onSavingChange?.(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        width: '800px',
        height: '600px',
        left: '50%',
        transform: isOpen ? 'translate(-50%, -50%)' : 'translate(-50%, 50vh)',
        top: isOpen ? '45%' : '100%',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Gradient glow */}
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
        <div className="mb-6 text-center">
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Voice Cloning</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Speak about yourself for at least 60 seconds!
          </p>
        </div>

        {/* Recording Timer */}
        <div className="text-center mb-4">
          <div className="mb-1">
            {isPlaying ? (
              <span className={`text-5xl font-bold tabular-nums ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {formatTime(playbackTime)} / {formatTime(recordingTime)}
              </span>
            ) : (
              <span className={`text-5xl font-bold tabular-nums ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{formatTime(recordingTime)}</span>
            )}
          </div>
          {isRecording && (
            <p className={`text-xs mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Recording in progress...</p>
          )}
          {isPlaying && (
            <p className={`text-xs mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Playing back...</p>
          )}
          {!isPlaying && !isRecording && (
            <p className="text-sm font-semibold" style={{ color: recordingTime < 60 ? '#EF4444' : '#22C55E' }}>
              {recordingTime < 60 ? `Need ${60 - recordingTime}s more to submit` : '\u2713 Ready to submit!'}
            </p>
          )}
        </div>

        {/* Volume Visualizer */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="flex items-end gap-1 h-32">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 rounded-full transition-all duration-100 ${
                  darkMode
                    ? 'bg-gradient-to-t from-gray-400 to-gray-300'
                    : 'bg-gradient-to-t from-purple-600 to-blue-400'
                }`}
                style={{
                  height: isRecording
                    ? `${Math.max(10, (volume * 100 * (0.5 + Math.random() * 0.5)))}%`
                    : '10%',
                  opacity: isRecording ? 0.8 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center gap-4 mb-6">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className={`px-8 py-3 rounded-lg font-semibold transition hover:opacity-90 ${darkMode ? 'text-gray-800' : 'text-white'}`}
              style={{ backgroundColor: darkMode ? '#FFFFFF' : '#4C1D95' }}
            >
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="px-8 py-3 rounded-lg font-semibold transition hover:opacity-90 text-white bg-red-600"
            >
              Stop Recording
            </button>
          )}

          {audioBlob && !isRecording && (
            <>
              <button
                onClick={isPlaying ? pauseRecording : playRecording}
                className={`px-8 py-3 rounded-lg font-semibold transition hover:opacity-90 ${darkMode ? 'text-gray-800' : 'text-white'}`}
                style={{ backgroundColor: darkMode ? '#FFFFFF' : '#4C1D95' }}
              >
                {isPlaying ? 'Pause' : 'Play Recording'}
              </button>
              <button
                onClick={resumeRecording}
                className={`px-8 py-3 rounded-lg font-semibold transition hover:opacity-90 border-2 ${
                  darkMode ? 'text-gray-200 border-gray-600' : 'text-gray-800 border-gray-300'
                }`}
              >
                Resume Recording
              </button>
              <button
                onClick={() => {
                  allChunksRef.current = [];
                  setAudioBlob(null);
                  setAudioUrl(null);
                  setRecordingTime(0);
                  setPlaybackTime(0);
                }}
                className={`px-8 py-3 rounded-lg font-semibold transition hover:opacity-90 border-2 ${
                  darkMode ? 'text-gray-200 border-gray-600' : 'text-gray-800 border-gray-300'
                }`}
              >
                Re-record
              </button>
            </>
          )}
        </div>

        {/* Audio player (hidden) */}
        {audioUrl && (
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onEnded={() => {
              setIsPlaying(false);
              setPlaybackTime(0);
              if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
            }}
            style={{ display: 'none' }}
          />
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={onClose}
            className={`flex-1 px-6 py-2.5 rounded-lg font-semibold transition hover:opacity-75 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
            style={{ background: popupBg, boxShadow: popupShadow }}
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={!audioBlob}
            className={`flex-1 px-6 py-2.5 rounded-lg font-semibold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'text-gray-800' : 'text-white'}`}
            style={{ backgroundColor: darkMode ? '#FFFFFF' : '#4C1D95' }}
          >
            Submit
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
