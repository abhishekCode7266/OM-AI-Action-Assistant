'use client';

import React from 'react';
import {
  Camera,
  CheckCircle2,
  Code2,
  Compass,
  FileText,
  HelpCircle,
  Key,
  Layers,
  Mic,
  Monitor,
  Sparkles,
} from 'lucide-react';

export const HelpWorkspace: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">OM User Manual & Quickstart</h2>
            <p className="text-[11px] text-slate-400">Master multimodal interaction and productivity</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Hero Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-blue-900/40 to-indigo-900/20 border border-blue-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                OM
              </span>
              <h3 className="text-lg font-bold text-white">Think. Talk. See. Act. Achieve.</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              OM is an autonomous, multimodal personal AI assistant designed to eliminate friction
              between thinking, speaking, seeing, and building.
            </p>
          </div>

          {/* Multimodal Quick Reference */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Multimodal Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  <Mic className="w-4 h-4" />
                  <span>Conversational Voice Mode</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Engage in hands-free voice dialogue with live audio spectrum waves, automatic pause
                  detection, and natural barge-in interruption.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-semibold">
                  <Camera className="w-4 h-4" />
                  <span>Real-Time Camera Vision</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Show OM physical documents, hardware defects, handwriting, or products for instant
                  multimodal inspection and guidance.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Monitor className="w-4 h-4" />
                  <span>Live Screen Capture</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Share desktop windows or browser tabs to let OM debug terminal errors, guide software
                  usage, and analyze charts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Code2 className="w-4 h-4" />
                  <span>Isolated Code Sandbox</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Test, preview, and interact with generated HTML, CSS, JavaScript, and Tailwind code
                  in an isolated sandbox iframe.
                </p>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Keyboard Shortcuts
            </h3>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-300">Send message</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                  Enter
                </kbd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-300">Insert new line</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                  Shift + Enter
                </kbd>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-300">Open Voice Mode</span>
                <span className="text-slate-400">Microphone icon in header or input bar</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-300">Interrupt speech</span>
                <span className="text-slate-400">Click Interrupt button or start speaking</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
