'use client';

import React, { useRef, useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useChatStore } from '@/stores/useChatStore';
import { captureVideoFrame } from '@/services/vision';
import { Monitor, StopCircle, Sparkles, Eye } from 'lucide-react';

export const ScreenShareBanner: React.FC = () => {
  const { isScreenShareActive, setScreenShareActive, addToast } = useUIStore();
  const { addPendingAttachment } = useChatStore();
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isScreenShareActive) {
      startStream();
    } else {
      stopStream();
    }
    return () => stopStream();
  }, [isScreenShareActive]);

  const startStream = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) return;
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      streamRef.current = stream;

      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.srcObject = stream;
        hiddenVideoRef.current.play().catch(() => {});
      }

      stream.getVideoTracks()[0].onended = () => {
        setScreenShareActive(false);
      };
    } catch (e) {
      setScreenShareActive(false);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCaptureScreen = () => {
    if (!hiddenVideoRef.current) return;
    try {
      const att = captureVideoFrame(hiddenVideoRef.current, 'screen_snapshot');
      addPendingAttachment(att);
      addToast({
        title: 'Screen Captured',
        message: 'Screen snapshot attached to chat. Ask OM to analyze the visible error, UI, or code!',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Capture Failed',
        message: err.message,
        type: 'error',
      });
    }
  };

  if (!isScreenShareActive) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200 animate-in slide-in-from-top-2">
      {/* Hidden video stream element for snapshotting */}
      <video ref={hiddenVideoRef} autoPlay playsInline muted className="hidden" />

      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
        <Monitor className="w-4 h-4 text-amber-400" />
        <span className="font-semibold text-amber-300">Screen Sharing Active</span>
        <span className="hidden sm:inline text-amber-400/80">
          — OM can analyze and guide your workflow.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCaptureScreen}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Capture & Ask OM</span>
        </button>

        <button
          onClick={() => setScreenShareActive(false)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-amber-300 border border-amber-500/30 transition-colors"
        >
          <StopCircle className="w-3.5 h-3.5" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
};
