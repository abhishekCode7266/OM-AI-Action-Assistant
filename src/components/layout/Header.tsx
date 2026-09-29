'use client';

import React, { useState } from 'react';
import { useUIStore, WorkspaceTab } from '@/stores/useUIStore';
import { useChatStore } from '@/stores/useChatStore';
import { useVoiceStore } from '@/stores/useVoiceStore';
import { AI_MODES } from '@/config/modes';
import { AIModeType } from '@/types';
import {
  Menu,
  Mic,
  Camera,
  Monitor,
  Settings,
  Sparkles,
  Code2,
  BarChart3,
  Compass,
  PenTool,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronDown,
  MessageSquare,
  FileText,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

const MODE_ICONS: Record<AIModeType, React.FC<{ className?: string }>> = {
  general: Sparkles,
  coding: Code2,
  'data-analyst': BarChart3,
  research: Compass,
  writing: PenTool,
  study: GraduationCap,
  career: Briefcase,
  'project-builder': Layers,
};

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    toggleSidebar,
    setVoiceModalOpen,
    setCameraModalOpen,
    setScreenShareActive,
    isScreenShareActive,
  } = useUIStore();

  const { activeMode, setActiveMode } = useChatStore();
  const { voiceState } = useVoiceStore();
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  const CurrentModeIcon = MODE_ICONS[activeMode] || Sparkles;
  const currentModeInfo = AI_MODES[activeMode] || AI_MODES.general;

  const handleScreenShareToggle = async () => {
    if (isScreenShareActive) {
      setScreenShareActive(false);
    } else {
      try {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          alert('Screen sharing is not supported in this browser.');
          return;
        }
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenShareActive(true);
        stream.getVideoTracks()[0].onended = () => {
          setScreenShareActive(false);
        };
      } catch (e) {
        // User cancelled or denied
        setScreenShareActive(false);
      }
    }
  };

  return (
    <header className="h-16 px-3 sm:px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 select-none">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors md:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setActiveTab('chat')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all font-black text-white text-base tracking-wider">
            OM
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">OM</span>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                AI Assistant
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Think. Talk. See. Act. Achieve.
            </p>
          </div>
        </div>

        {/* AI Mode Selector Dropdown */}
        <div className="relative ml-2 sm:ml-4">
          <button
            onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-all shadow-sm"
            aria-label="Change AI Mode"
          >
            <CurrentModeIcon className="w-4 h-4 text-blue-400" />
            <span className="capitalize">{currentModeInfo.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isModeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsModeDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 p-2 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Select AI Assistant Mode
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-1">
                  {(Object.keys(AI_MODES) as AIModeType[]).map((modeKey) => {
                    const mode = AI_MODES[modeKey];
                    const Icon = MODE_ICONS[modeKey];
                    const isSelected = activeMode === modeKey;

                    return (
                      <button
                        key={modeKey}
                        onClick={() => {
                          setActiveMode(modeKey);
                          setIsModeDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 text-white border border-blue-500/30'
                            : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg mt-0.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold leading-tight">{mode.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {mode.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: Workspace Switcher Pills (Desktop) */}
      <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('coding')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'coding'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Code
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'data'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Data
        </button>
        <button
          onClick={() => setActiveTab('notebook')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'notebook'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Notes
        </button>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Dedicated Voice Mode Button */}
        <button
          onClick={() => setVoiceModalOpen(true)}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            voiceState === 'LISTENING' || voiceState === 'SPEAKING'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
              : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20'
          }`}
          title="Open Dedicated Voice Mode"
          aria-label="Open Voice Mode"
        >
          <Mic className="w-4 h-4" />
          <span className="hidden sm:inline">Voice Mode</span>
          {(voiceState === 'LISTENING' || voiceState === 'SPEAKING') && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
          )}
        </button>

        {/* Camera Sharing Button */}
        <button
          onClick={() => setCameraModalOpen(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          title="Open Camera Vision"
          aria-label="Open Camera Vision"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Screen Share Button */}
        <button
          onClick={handleScreenShareToggle}
          className={`p-2 rounded-xl border transition-all ${
            isScreenShareActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
          title={isScreenShareActive ? 'Stop Screen Sharing' : 'Share Screen'}
          aria-label="Share Screen"
        >
          <Monitor className="w-4 h-4" />
        </button>

        {/* Permissions Center */}
        <button
          onClick={() => setActiveTab('permissions')}
          className={`p-2 rounded-xl border transition-all ${
            activeTab === 'permissions'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'text-slate-400 hover:text-white bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
          title="Permissions & Privacy Center"
          aria-label="Permissions Center"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-2 rounded-xl border transition-all ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'text-slate-400 hover:text-white bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
