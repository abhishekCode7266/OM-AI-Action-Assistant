'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useCodeStore } from '@/stores/useCodeStore';
import { Check, Copy, Download, Play, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const { setActiveTab } = useUIStore();
  const { createTab } = useCodeStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunInWorkspace = () => {
    const extMap: Record<string, string> = {
      html: 'html',
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      css: 'css',
      json: 'json',
      sql: 'sql',
    };
    const ext = extMap[language.toLowerCase()] || 'txt';
    const filename = `snippet_${Date.now().toString().slice(-4)}.${ext}`;
    createTab(filename, language.toLowerCase(), code);
    setActiveTab('coding');
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code_${Date.now()}.${language || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isWebLanguage = ['html', 'css', 'javascript', 'js', 'jsx'].includes(
    language.toLowerCase()
  );

  return (
    <div className="my-3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl text-xs font-mono">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
            {language || 'text'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isWebLanguage && (
            <button
              onClick={handleRunInWorkspace}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-all font-sans text-[11px]"
              title="Open and preview in Code Workspace"
            >
              <Play className="w-3 h-3 fill-blue-400" />
              <span>Sandbox</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Download snippet"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-sans text-[11px]"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
