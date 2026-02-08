'use client';

import { useState, useRef, useEffect } from 'react';
import Toast from './Toast';

interface VoiceClonePopupProps {
  isOpen: boolean;
  onClose: () => void;
  mousePos: { x: number; y: number };
  isHovering: boolean;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  userId: string | null;
}

export default function VoiceClonePopup({
  isOpen,
  onClose,
  mousePos,
  isHovering,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  userId,
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Cleanup function to stop microphone
  const stopMicrophone = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      stopMicrophone(); // Stop microphone on unmount
    };
  }, []);

  // Stop microphone when popup closes while recording
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // Store stream for cleanup

      // Setup audio context for volume visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.3; // More responsive (default is 0.8)

      // Setup media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stopMicrophone(); // Stop microphone when recording stops
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start volume visualization
      visualizeVolume();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setToastMessage('Failed to access microphone. Please allow microphone access.');
      setToastType('error');
      setShowToast(true);
    }
  };

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
      // Much higher sensitivity - divide by smaller number and add multiplier
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
    }
  };

  const pauseRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
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

        // Reset after successful upload
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to save recording');
      }
    } catch (error) {
      console.error('Failed to save recording:', error);
      setToastMessage('Failed to save recording. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        width: '800px',
        height: '600px',
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
      {/* Gradient glow */}
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
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Voice Cloning</h2>
          <p className="text-sm text-gray-600">
            Speak about yourself for at least 60 seconds!
          </p>
        </div>

        {/* Recording Timer */}
        <div className="text-center mb-4">
          <div className="mb-1">
            {isPlaying ? (
              <span className="text-5xl font-bold text-gray-800 tabular-nums">
                {formatTime(playbackTime)} / {formatTime(recordingTime)}
              </span>
            ) : (
              <span className="text-5xl font-bold text-gray-800 tabular-nums">{formatTime(recordingTime)}</span>
            )}
          </div>
          {isRecording && (
            <p className="text-xs text-gray-400 mb-2">Recording in progress...</p>
          )}
          {isPlaying && (
            <p className="text-xs text-gray-400 mb-2">Playing back...</p>
          )}
          {!isPlaying && !isRecording && (
            <p className="text-sm font-semibold" style={{ color: recordingTime < 60 ? '#EF4444' : '#22C55E' }}>
              {recordingTime < 60 ? `Need ${60 - recordingTime}s more to submit` : '✓ Ready to submit!'}
            </p>
          )}
        </div>

        {/* Volume Visualizer */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="flex items-end gap-1 h-32">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-purple-600 to-blue-400 rounded-full transition-all duration-100"
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
              className="px-8 py-3 rounded-lg font-semibold transition hover:opacity-90 text-white"
              style={{ backgroundColor: '#4C1D95' }}
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
                className="px-8 py-3 rounded-lg font-semibold transition hover:opacity-90 text-white"
                style={{ backgroundColor: '#4C1D95' }}
              >
                {isPlaying ? 'Pause' : 'Play Recording'}
              </button>
              <button
                onClick={() => {
                  setAudioBlob(null);
                  setAudioUrl(null);
                  setRecordingTime(0);
                  setPlaybackTime(0);
                }}
                className="px-8 py-3 rounded-lg font-semibold transition hover:opacity-90 text-gray-800 border-2 border-gray-300"
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
            onTimeUpdate={(e) => {
              const audio = e.currentTarget;
              setPlaybackTime(Math.floor(audio.currentTime));
            }}
            onEnded={() => {
              setIsPlaying(false);
              setPlaybackTime(0);
            }}
            style={{ display: 'none' }}
          />
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-auto">
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

          <button
            onClick={handleSubmit}
            disabled={!audioBlob}
            className="flex-1 px-6 py-2.5 rounded-lg font-semibold transition hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#4C1D95' }}
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
