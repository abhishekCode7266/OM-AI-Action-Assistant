'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { Download, Image as ImageIcon, Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
}

export const ImageGenWorkspace: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1024x1024' | '1024x1792' | '1792x1024'>('1024x1024');
  const [style, setStyle] = useState<'vivid' | 'natural'>('vivid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const { addToast } = useUIStore();

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size, style }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const newImage: GeneratedImage = {
        id: 'img-' + Date.now(),
        url: data.url,
        prompt: prompt.trim(),
        createdAt: Date.now(),
      };

      setHistory([newImage, ...history]);
      addToast({
        title: 'Image Generated',
        message: 'Your image has been synthesized successfully.',
        type: 'success',
      });
    } catch (err: any) {
      setError(err.message || 'Image generation failed');
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
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Image Generation Studio</h2>
            <p className="text-[11px] text-slate-400">DALL-E 3 & Replicate Flux engine</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Prompt Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Image Description Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic cybernetic interface displaying holographic telemetry, cinematic neon lighting, 8k resolution..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 text-xs">
                <div>
                  <span className="text-slate-400 mr-2">Aspect:</span>
                  <select
                    value={size}
                    onChange={(e: any) => setSize(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs"
                  >
                    <option value="1024x1024">Square (1:1)</option>
                    <option value="1792x1024">Landscape (16:9)</option>
                    <option value="1024x1792">Portrait (9:16)</option>
                  </select>
                </div>

                <div>
                  <span className="text-slate-400 mr-2">Style:</span>
                  <select
                    value={style}
                    onChange={(e: any) => setStyle(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs"
                  >
                    <option value="vivid">Vivid & Cinematic</option>
                    <option value="natural">Natural & Realistic</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Artwork</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Notification if provider is unconfigured */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold mb-0.5">Configuration Notice</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* History Gallery */}
          {history.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Generated Creations ({history.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {history.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl"
                  >
                    <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                      <p className="text-xs text-white line-clamp-3 font-medium">{img.prompt}</p>
                      <div className="flex justify-end">
                        <a
                          href={img.url}
                          target="_blank"
                          download="om_generated_image.png"
                          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
