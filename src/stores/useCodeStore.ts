import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CodeTab {
  id: string;
  name: string;
  language: string;
  code: string;
}

interface CodeWorkspaceState {
  tabs: CodeTab[];
  activeTabId: string;
  viewMode: 'split' | 'code' | 'preview';
  isConsoleOpen: boolean;
  logs: string[];

  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setViewMode: (mode: 'split' | 'code' | 'preview') => void;
  createTab: (name?: string, language?: string, code?: string) => string;
  closeTab: (id: string) => void;
  selectTab: (id: string) => void;
  addLog: (log: string) => void;
  clearLogs: () => void;
}

const DEFAULT_SAMPLE_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OM Interactive Sandbox</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 15px rgba(56, 136, 255, 0.4); }
      50% { box-shadow: 0 0 30px rgba(56, 136, 255, 0.8); }
    }
    .glow-card { animation: pulse-glow 3s infinite; }
  </style>
</head>
<body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6">
  <div class="glow-card bg-slate-900 border border-blue-500/30 rounded-2xl p-8 max-w-md w-full text-center">
    <div class="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-3xl font-black mb-4 shadow-lg shadow-blue-500/40">
      OM
    </div>
    <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
      OM AI Code Sandbox
    </h1>
    <p class="text-slate-400 text-sm mt-2">
      Live isolated preview for HTML, CSS, JavaScript, and Tailwind.
    </p>
    <div class="mt-6 flex justify-center gap-3">
      <button onclick="changeColor()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-md">
        Click Me
      </button>
      <button onclick="reset()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all">
        Reset
      </button>
    </div>
    <div id="status" class="mt-4 text-xs font-mono text-blue-400">
      Status: Ready
    </div>
  </div>

  <script>
    let clicks = 0;
    function changeColor() {
      clicks++;
      const colors = ['#3888ff', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      document.body.style.backgroundColor = randomColor + '11';
      document.getElementById('status').innerText = 'Interacted: ' + clicks + ' times! Color: ' + randomColor;
    }
    function reset() {
      clicks = 0;
      document.body.style.backgroundColor = '#020617';
      document.getElementById('status').innerText = 'Status: Reset to default';
    }
  </script>
</body>
</html>`;

export const useCodeStore = create<CodeWorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: [
        {
          id: 'tab-1',
          name: 'index.html',
          language: 'html',
          code: DEFAULT_SAMPLE_CODE,
        },
      ],
      activeTabId: 'tab-1',
      viewMode: 'split',
      isConsoleOpen: false,
      logs: [],

      setCode: (code) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === state.activeTabId ? { ...t, code } : t
          ),
        }));
      },

      setLanguage: (language) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === state.activeTabId ? { ...t, language } : t
          ),
        }));
      },

      setViewMode: (viewMode) => set({ viewMode }),

      createTab: (name = 'untitled.js', language = 'javascript', code = '// Write code here\n') => {
        const id = 'tab-' + Date.now();
        const newTab: CodeTab = { id, name, language, code };
        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: id,
        }));
        return id;
      },

      closeTab: (id) => {
        set((state) => {
          if (state.tabs.length <= 1) return state;
          const filtered = state.tabs.filter((t) => t.id !== id);
          return {
            tabs: filtered,
            activeTabId: state.activeTabId === id ? filtered[0].id : state.activeTabId,
          };
        });
      },

      selectTab: (id) => set({ activeTabId: id }),
      addLog: (log) => set((state) => ({ logs: [...state.logs.slice(-50), log] })),
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'om-code-workspace',
    }
  )
);
