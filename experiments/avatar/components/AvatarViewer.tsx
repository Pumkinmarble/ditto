/**
 * Avatar Viewer Component
 * Main component for displaying and animating the avatar
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AvatarRenderer } from '../lib/avatarRenderer';
import { BasicLipSync } from '../lib/lipSync';

interface AvatarViewerProps {
  avatarUrl: string | null;
  audioUrl?: string | null;
  isPlaying?: boolean;
  className?: string;
}

export default function AvatarViewer({
  avatarUrl,
  audioUrl,
  isPlaying = false,
  className = '',
}: AvatarViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<AvatarRenderer | null>(null);
  const lipSyncRef = useRef<BasicLipSync | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blendShapes, setBlendShapes] = useState<string[]>([]);

  // Initialize renderer
  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new AvatarRenderer(containerRef.current);
    rendererRef.current = renderer;
    renderer.startAnimation();

    // Initialize lip sync
    lipSyncRef.current = new BasicLipSync();

    return () => {
      renderer.dispose();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Load avatar
  useEffect(() => {
    if (!avatarUrl || !rendererRef.current) return;

    setLoading(true);
    setError(null);

    rendererRef.current
      .loadAvatar(avatarUrl)
      .then(() => {
        const shapes = rendererRef.current?.getAvailableBlendShapes() || [];
        setBlendShapes(shapes);
        console.log('Available blend shapes:', shapes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [avatarUrl]);

  // Handle audio playback and lip sync
  useEffect(() => {
    if (!audioUrl || !isPlaying || !lipSyncRef.current || !rendererRef.current) {
      return;
    }

    // Create audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Connect to lip sync
    lipSyncRef.current.connectAudio(audio);

    // Start audio
    audio.play().catch((err) => {
      console.error('Audio play error:', err);
      setError('Failed to play audio');
    });

    // Animation loop for lip sync
    const updateLipSync = () => {
      if (!lipSyncRef.current || !rendererRef.current) return;

      const blendShapes = lipSyncRef.current.getMouthBlendShapes();
      rendererRef.current.setBlendShapes(blendShapes);

      animationFrameRef.current = requestAnimationFrame(updateLipSync);
    };

    updateLipSync();

    return () => {
      audio.pause();
      audio.src = '';
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [audioUrl, isPlaying]);

  return (
    <div className={`relative ${className}`}>
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full bg-gray-900 rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p>Loading avatar...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Debug Info */}
      {blendShapes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-2 rounded">
          <p className="font-bold mb-1">Available Blend Shapes:</p>
          <p>{blendShapes.length} shapes loaded</p>
        </div>
      )}
    </div>
  );
}
