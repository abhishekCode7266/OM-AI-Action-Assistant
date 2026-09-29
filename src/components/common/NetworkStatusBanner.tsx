'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="bg-emerald-600/90 text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2 backdrop-blur-md animate-in slide-in-from-top-1 z-50">
        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        <span>Internet connection restored. OM is back online.</span>
      </div>
    );
  }

  return (
    <div className="bg-rose-600/90 text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2 backdrop-blur-md animate-in slide-in-from-top-1 z-50 shadow-md">
      <WifiOff className="w-4 h-4 text-white shrink-0" />
      <span>
        You are currently offline. Your drafts and local chats are safely preserved in browser storage.
      </span>
      <button
        onClick={() => {
          if (navigator.onLine) setIsOnline(true);
        }}
        className="ml-2 px-2 py-0.5 rounded bg-black/30 hover:bg-black/40 text-[11px] font-semibold transition-colors flex items-center gap-1"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Retry</span>
      </button>
    </div>
  );
};
