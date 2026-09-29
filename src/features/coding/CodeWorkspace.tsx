'use client';

import React, { useState } from 'react';
import { useCodeStore } from '@/stores/useCodeStore';
import { useChatStore } from '@/stores/useChatStore';
import { useUIStore } from '@/stores/useUIStore';
import {
  Code2,
  Copy,
  Download,
  Eye,
  FileCode,
  Layout,
  Maximize2,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';

export const CodeWorkspace: React.FC = () => {
  const {
    tabs,
    activeTabId,
    viewMode,
    setCode,
    setLanguage,
    setViewMode,
    createTab,
    closeTab,
    selectTab,
  } = useCodeStore();

  const { addMessage, createNewConversation, setActiveMode } = useChatStore();
  const { setActiveTab, addToast } = useUIStore();
  const [copied, setCopied] = useState(false);

  const activeTabItem = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const isHtmlOrWeb = ['html', 'javascript', 'css'].includes(
    activeTabItem.language.toLowerCase()
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTabItem.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeTabItem.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTabItem.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAskOMToExplain = () => {
    const convId = createNewConversation('coding', `Explain: ${activeTabItem.name}`);
    setActiveMode('coding');
    addMessage(convId, {
      role: 'user',
      content: `Please explain this ${activeTabItem.language} code in detail, highlighting its architecture, key logic, and possible optimizations:\n\n\`\`\`${activeTabItem.language}\n${activeTabItem.code}\n\`\`\``,
      mode: 'coding',
    });
    setActiveTab('chat');
  };

  const handleAskOMToDebug = () => {
    const convId = createNewConversation('coding', `Debug: ${activeTabItem.name}`);
    setActiveMode('coding');
    addMessage(convId, {
      role: 'user',
      content: `Please review and debug this ${activeTabItem.language} code. Check for edge cases, performance bottlenecks, syntax errors, and security issues:\n\n\`\`\`${activeTabItem.language}\n${activeTabItem.code}\n\`\`\``,
      mode: 'coding',
    });
    setActiveTab('chat');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Code Toolbar */}
      <div className="h-12 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        {/* Tab bar */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1 py-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs cursor-pointer transition-all shrink-0 ${
                tab.id === activeTabId
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="p-0.5 rounded hover:bg-black/30"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => createTab()}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Create new file"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* View mode toggle & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setViewMode('code')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                viewMode === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Code only"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Split View"
            >
              <Layout className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Preview only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAskOMToExplain}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Explain</span>
          </button>

          <button
            onClick={handleAskOMToDebug}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Debug</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Panels (Split / Code / Preview) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        {(viewMode === 'code' || viewMode === 'split') && (
          <div
            className={`flex-1 flex flex-col bg-slate-950 overflow-hidden ${
              viewMode === 'split' ? 'border-r border-slate-800' : ''
            }`}
          >
            <div className="flex-1 p-4 font-mono text-sm leading-relaxed overflow-auto">
              <textarea
                value={activeTabItem.code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent text-slate-100 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
                placeholder="// Write or paste code here..."
              />
            </div>
          </div>
        )}

        {/* Live Sandbox Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col bg-slate-900/50 overflow-hidden">
            <div className="h-9 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Isolated Sandbox Preview
                </span>
              </div>
              <span className="text-[11px] text-slate-500">HTML / CSS / JS</span>
            </div>

            <div className="flex-1 w-full h-full bg-white">
              {isHtmlOrWeb ? (
                <iframe
                  title="Code Preview"
                  srcDoc={activeTabItem.code}
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="w-full h-full bg-slate-950 p-6 flex items-center justify-center text-center text-xs text-slate-500">
                  Interactive preview is supported for HTML/CSS/JavaScript web code.
                  <br />
                  For Python/SQL, click "Explain" or "Debug" to review with OM.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
