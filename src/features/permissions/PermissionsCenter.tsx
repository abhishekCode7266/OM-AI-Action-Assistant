'use client';

import React, { useEffect } from 'react';
import { usePermissionsStore, PermissionState } from '@/stores/usePermissionsStore';
import {
  Bell,
  Camera,
  CheckCircle2,
  Lock,
  Mic,
  Monitor,
  ShieldCheck,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export const PermissionsCenter: React.FC = () => {
  const {
    microphone,
    camera,
    notifications,
    screenShareAvailable,
    checkPermissions,
    requestMicrophone,
    requestCamera,
    requestNotifications,
  } = usePermissionsStore();

  useEffect(() => {
    checkPermissions();
  }, []);

  const getStatusBadge = (state: PermissionState) => {
    switch (state) {
      case 'granted':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Allowed
          </span>
        );
      case 'denied':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            Blocked / Denied
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Not Granted
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Permissions & Privacy Center</h2>
            <p className="text-[11px] text-slate-400">Explicit hardware access and data integrity</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Privacy Guarantee Card */}
          <div className="p-6 rounded-3xl bg-blue-600/10 border border-blue-500/30 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm">
              <Lock className="w-4 h-4" />
              <span>OM Privacy-First Guarantee</span>
            </div>
            <p className="text-slate-300">
              Camera, microphone, and screen streams <strong>never activate silently</strong>. Every access
              requires explicit user interaction and browser consent. OM does not store or transmit raw video
              or audio streams to persistent cloud storage without your command.
            </p>
          </div>

          {/* Permissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Microphone */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 text-blue-400">
                      <Mic className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-white">Microphone</span>
                  </div>
                  {getStatusBadge(microphone)}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Used for real-time natural voice conversation, voice commands, and speech transcription.
                </p>
              </div>

              <button
                onClick={requestMicrophone}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Test Microphone Access
              </button>
            </div>

            {/* Camera */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 text-purple-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-white">Camera</span>
                  </div>
                  {getStatusBadge(camera)}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Used for showing OM documents, real-world objects, handwritten notes, and physical items.
                </p>
              </div>

              <button
                onClick={requestCamera}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Test Camera Access
              </button>
            </div>

            {/* Screen Sharing */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-white">Screen Sharing</span>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                    {screenShareAvailable ? 'Available' : 'Unsupported'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Used to let OM inspect your active screen, debug terminal errors, and review software workflows.
                </p>
              </div>

              <div className="text-[11px] text-slate-500 font-mono py-1">
                Standard Screen Capture API
              </div>
            </div>

            {/* System Notifications */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-white">Notifications</span>
                  </div>
                  {getStatusBadge(notifications)}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Used to alert you when long background calculations, research tasks, or builds finish.
                </p>
              </div>

              <button
                onClick={requestNotifications}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Request Notification Permission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
