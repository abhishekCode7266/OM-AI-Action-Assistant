'use client';

import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useChatStore } from '@/stores/useChatStore';
import { useUIStore } from '@/stores/useUIStore';
import { AIProviderId } from '@/types';
import { speechService } from '@/services/voice/speech';
import {
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  Key,
  Layers,
  MessageSquare,
  Moon,
  RefreshCw,
  Settings,
  ShieldAlert,
  Sparkles,
  Sun,
  Volume2,
  XCircle,
} from 'lucide-react';

export const SettingsWorkspace: React.FC = () => {
  const {
    theme,
    activeProvider,
    activeModel,
    customApiKeys,
    speechRate,
    speechVolume,
    autoSpeakResponse,
    voiceName,
    enterToSend,
    autoScroll,
    setTheme,
    setActiveProvider,
    setActiveModel,
    setCustomApiKey,
    setVoiceSettings,
    setChatSettings,
    resetSettings,
  } = useSettingsStore();

  const { clearAllConversations, conversations } = useChatStore();
  const { addToast } = useUIStore();

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<any>(null);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setAvailableVoices(speechService.getAvailableVoices());
      window.speechSynthesis.onvoiceschanged = () => {
        setAvailableVoices(speechService.getAvailableVoices());
      };
    }

    fetchProviderStatus();
  }, []);

  const fetchProviderStatus = async () => {
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      setProviderStatuses(data);
    } catch (e) {}
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all conversation history? This cannot be undone.')) {
      clearAllConversations();
      addToast({
        title: 'Conversations Cleared',
        message: 'All local chat histories have been wiped.',
        type: 'info',
      });
    }
  };

  const handleExportAll = () => {
    const data = {
      conversations,
      exportedAt: new Date().toISOString(),
      app: 'OM AI Assistant',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OM_Assistant_Data_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Settings & Configuration</h2>
            <p className="text-[11px] text-slate-400">Manage AI providers, voice, and privacy</p>
          </div>
        </div>

        <button
          onClick={fetchProviderStatus}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Refresh connection status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Settings Form */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* AI Providers Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                AI Inference Engine
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Active Provider
                </label>
                <select
                  value={activeProvider}
                  onChange={(e) => setActiveProvider(e.target.value as AIProviderId)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="gemini">Google Gemini (Recommended for Vision & Speed)</option>
                  <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
                  <option value="anthropic">Anthropic Claude (Claude 3.5 Sonnet)</option>
                  <option value="groq">Groq (Ultra-low Latency Llama 3)</option>
                  <option value="ollama">Ollama (Local Offline Inference)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Model Identifier
                </label>
                <input
                  type="text"
                  value={activeModel}
                  onChange={(e) => setActiveModel(e.target.value)}
                  placeholder="e.g. gemini-1.5-flash, gpt-4o"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Custom API Key Input for Active Provider */}
            {activeProvider !== 'ollama' && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-blue-400" />
                    <span>Client Custom API Key ({activeProvider.toUpperCase()})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setShowKey((prev) => ({ ...prev, [activeProvider]: !prev[activeProvider] }))
                    }
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    {showKey[activeProvider] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  type={showKey[activeProvider] ? 'text' : 'password'}
                  value={customApiKeys[activeProvider] || ''}
                  onChange={(e) => setCustomApiKey(activeProvider, e.target.value)}
                  placeholder={`Optional override for ${activeProvider} (falls back to server .env)`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Keys are stored exclusively in your browser localStorage or securely read from server .env.
                </p>
              </div>
            )}
          </section>

          {/* Voice Preferences Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Voice & Speech
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Synthesizer Voice
                </label>
                <select
                  value={voiceName}
                  onChange={(e) => setVoiceSettings({ voiceName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs"
                >
                  <option value="">Default Enhanced Voice</option>
                  {availableVoices.map((v, i) => (
                    <option key={i} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Speech Rate: {speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setVoiceSettings({ speechRate: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 mt-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="autoSpeak"
                checked={autoSpeakResponse}
                onChange={(e) => setVoiceSettings({ autoSpeakResponse: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0"
              />
              <label htmlFor="autoSpeak" className="text-xs text-slate-300 select-none">
                Automatically read OM responses aloud in standard chat
              </label>
            </div>
          </section>

          {/* Chat Behavior Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Chat & Input Experience
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enterToSend"
                  checked={enterToSend}
                  onChange={(e) => setChatSettings({ enterToSend: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0"
                />
                <label htmlFor="enterToSend" className="select-none">
                  Press <strong>Enter</strong> to send messages (Shift+Enter for newline)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoScroll"
                  checked={autoScroll}
                  onChange={(e) => setChatSettings({ autoScroll: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0"
                />
                <label htmlFor="autoScroll" className="select-none">
                  Automatically scroll down on streaming text
                </label>
              </div>
            </div>
          </section>

          {/* Data & Privacy Actions */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Database className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Data Management
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportAll}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                Export All Conversations (JSON)
              </button>

              <button
                onClick={handleClearHistory}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
              >
                Clear All Conversations
              </button>

              <button
                onClick={() => {
                  if (confirm('Reset settings to factory defaults?')) resetSettings();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-medium transition-colors"
              >
                Reset Default Settings
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
