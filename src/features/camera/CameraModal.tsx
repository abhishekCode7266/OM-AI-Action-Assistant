'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useChatStore } from '@/stores/useChatStore';
import { captureVideoFrame, isCameraSupported } from '@/services/vision';
import { Camera, FlipHorizontal, RefreshCw, StopCircle, X, Check, Sparkles } from 'lucide-react';

export const CameraModal: React.FC = () => {
  const { isCameraModalOpen, setCameraModalOpen, addToast } = useUIStore();
  const { addPendingAttachment } = useChatStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (isCameraModalOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraModalOpen, facingMode]);

  const startCamera = async () => {
    setError(null);
    setCapturedPhoto(null);

    if (!isCameraSupported()) {
      setError('Camera API is not supported by your browser.');
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsActive(true);
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setIsActive(false);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in browser settings.'
          : err.message || 'Could not start camera.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  };

  const handleSwitchFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    try {
      const att = captureVideoFrame(videoRef.current, 'camera_snapshot');
      setCapturedPhoto(att.dataUrl || null);
      addPendingAttachment(att);
      addToast({
        title: 'Snapshot Captured',
        message: 'Camera frame attached to your chat. Ask OM anything about what is visible!',
        type: 'success',
      });
      stopCamera();
      setCameraModalOpen(false);
    } catch (err: any) {
      setError('Failed to capture frame: ' + err.message);
    }
  };

  if (!isCameraModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col items-center overflow-hidden">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Camera Vision Mode</h3>
              <p className="text-[11px] text-slate-400">Show OM documents, objects, or notes</p>
            </div>
          </div>

          <button
            onClick={() => setCameraModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview Canvas */}
        <div className="relative w-full aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden my-4 flex items-center justify-center">
          {error ? (
            <div className="p-4 text-center text-xs text-rose-300 max-w-xs">
              <p className="font-semibold mb-1">Camera Error</p>
              <p className="text-slate-400">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />

              {isActive && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-emerald-400 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE PREVIEW
                </div>
              )}
            </>
          )}
        </div>

        {/* Camera Controls */}
        <div className="w-full flex items-center justify-between pt-2">
          <button
            onClick={handleSwitchFacing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            title="Switch front/back camera"
          >
            <FlipHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Flip Camera</span>
          </button>

          <button
            onClick={handleCapture}
            disabled={!isActive}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Snap & Ask OM</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setCameraModalOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
          >
            <StopCircle className="w-4 h-4" />
            <span>Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
