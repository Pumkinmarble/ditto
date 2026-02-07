/**
 * Simple Test Component
 * Quick way to test: Photo → Avatar → Lip Sync
 *
 * Usage:
 * 1. Take/upload photo
 * 2. Generate avatar (Ready Player Me)
 * 3. Load audio file or enter text
 * 4. Watch lip sync!
 */

'use client';

import React, { useState } from 'react';
import PhotoCapture from '../components/PhotoCapture';
import AvatarViewer from '../components/AvatarViewer';
import { openAvatarCreator } from '../lib/readyPlayerMe';

export default function SimpleTest() {
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Handle photo capture
  const handlePhotoCapture = (photoBlob: Blob) => {
    setPhoto(photoBlob);
    console.log('Photo captured:', photoBlob.size, 'bytes');
  };

  // Create avatar with Ready Player Me
  const createAvatar = () => {
    openAvatarCreator((url) => {
      console.log('Avatar created:', url);
      setAvatarUrl(url);
      setStep(3);
    });
  };

  // Use demo avatar (skip photo step)
  const useDemoAvatar = () => {
    // Ready Player Me demo avatar with morph targets
    const demoUrl = 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit';
    setAvatarUrl(demoUrl);
    setStep(3);
  };

  // Handle audio file upload
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsPlaying(false);
  };

  // Play audio with lip sync
  const playAudio = () => {
    setIsPlaying(true);
  };

  // Stop audio
  const stopAudio = () => {
    setIsPlaying(false);
  };

  // Reset test
  const reset = () => {
    setPhoto(null);
    setAvatarUrl(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Avatar Lip Sync Test
          </h1>
          <p className="text-gray-400">
            Test the Ready Player Me + lip sync system
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          <Step number={1} active={step >= 1} label="Photo" />
          <Arrow />
          <Step number={2} active={step >= 2} label="Avatar" />
          <Arrow />
          <Step number={3} active={step >= 3} label="Audio" />
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Panel: Controls */}
          <div className="space-y-6">
            {/* Step 1: Photo Capture */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                1️⃣ Take a Photo
              </h2>
              <PhotoCapture onPhotoCapture={handlePhotoCapture} />
              {photo && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next: Create Avatar →
                </button>
              )}
            </div>

            {/* Step 2: Avatar Creation */}
            {step >= 2 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  2️⃣ Create Avatar
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={createAvatar}
                    disabled={!photo}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Open Ready Player Me
                  </button>
                  <div className="text-center text-gray-400 text-sm">OR</div>
                  <button
                    onClick={useDemoAvatar}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Use Demo Avatar (Quick Test)
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Ready Player Me will open in a popup. Follow the steps to
                  create your avatar!
                </p>
              </div>
            )}

            {/* Step 3: Audio Input */}
            {step >= 3 && avatarUrl && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  3️⃣ Test Lip Sync
                </h2>

                {/* Audio Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Audio File
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>

                {/* Sample Audio */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Or use sample audio:
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setAudioUrl(e.target.value);
                        setIsPlaying(false);
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  >
                    <option value="">Select sample...</option>
                    <option value="/audio/sample1.mp3">Sample 1 (Hello)</option>
                    <option value="/audio/sample2.mp3">Sample 2 (Speech)</option>
                  </select>
                </div>

                {/* Playback Controls */}
                {audioUrl && (
                  <div className="space-y-3">
                    {!isPlaying ? (
                      <button
                        onClick={playAudio}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        ▶️ Play with Lip Sync
                      </button>
                    ) : (
                      <button
                        onClick={stopAudio}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        ⏹️ Stop
                      </button>
                    )}
                  </div>
                )}

                {/* Reset Button */}
                <button
                  onClick={reset}
                  className="w-full mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  🔄 Start Over
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Avatar Display */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Avatar Preview
            </h2>
            <AvatarViewer
              avatarUrl={avatarUrl}
              audioUrl={audioUrl}
              isPlaying={isPlaying}
              className="h-[600px]"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/30 border border-blue-500/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">
            📝 How to Test:
          </h3>
          <ol className="space-y-2 text-gray-300">
            <li>1. Take a photo OR click "Use Demo Avatar" to skip</li>
            <li>2. If using photo: Follow Ready Player Me wizard to create avatar</li>
            <li>3. Upload an audio file (MP3, WAV, etc.) OR use sample audio</li>
            <li>4. Click "Play with Lip Sync" to see the avatar speak!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Helper components
function Step({ number, active, label }: { number: number; active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
          active
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-400'
        }`}
      >
        {number}
      </div>
      <span className="text-sm text-gray-400 mt-2">{label}</span>
    </div>
  );
}

function Arrow() {
  return (
    <svg
      className="w-8 h-8 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
