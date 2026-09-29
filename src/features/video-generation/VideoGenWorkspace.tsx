'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Film, Loader2, Play, Sparkles, Video } from 'lucide-react';

export const VideoGenWorkspace: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/video')
      .then((res) => res.json())
      .then((data) => setIsConfigured(data.configured))
      .catch(() => setIsConfigured(false));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video generation failed');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Video Generation Studio</h2>
            <p className="text-[11px] text-slate-400">Diffusion video synthesis engine</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex items-center justify-center">
        <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white">Generate Video Scene</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesize high-fidelity video motion clips from descriptive prompts.
            </p>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A drone flying over a futuristic metropolis at sunset, ultra-detailed water reflections, 4k..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />

          {!isConfigured ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
              <div className="space-y-1">
                <span className="font-semibold block">Provider Not Configured</span>
                <p className="text-slate-300 leading-relaxed">
                  Video generation requires a configured video provider (such as{' '}
                  <code className="text-amber-300">REPLICATE_API_TOKEN</code> or{' '}
                  <code className="text-amber-300">RUNWAY_API_KEY</code>) in your{' '}
                  <code className="text-amber-300">.env</code> file. No fake videos will be generated.
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Synthesizing Video...' : 'Generate Video'}</span>
            </button>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
