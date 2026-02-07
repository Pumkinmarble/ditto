/**
 * Photo Capture Component
 * Handles photo upload and camera capture
 */

'use client';

import React, { useRef, useState } from 'react';

interface PhotoCaptureProps {
  onPhotoCapture: (photoBlob: Blob) => void;
  className?: string;
}

export default function PhotoCapture({
  onPhotoCapture,
  className = '',
}: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Could not access camera. Please allow camera permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreview(url);
        onPhotoCapture(blob);
      }
    }, 'image/jpeg', 0.9);

    stopCamera();
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    onPhotoCapture(file);
  };

  // Clear preview
  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview or Camera View */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {preview ? (
          // Show preview
          <img
            src={preview}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : cameraActive ? (
          // Show camera feed
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          // Show placeholder
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p>Take a photo or upload one</p>
            </div>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {preview ? (
          // Preview controls
          <>
            <button
              onClick={clearPreview}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Retake
            </button>
          </>
        ) : cameraActive ? (
          // Camera controls
          <>
            <button
              onClick={capturePhoto}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📸 Capture
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </>
        ) : (
          // Initial controls
          <>
            <button
              onClick={startCamera}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📷 Use Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📁 Upload Photo
            </button>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
