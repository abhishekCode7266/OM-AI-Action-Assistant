import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NoteItem } from '@/types';

interface NotebookState {
  notes: NoteItem[];
  activeNoteId: string | null;
  searchQuery: string;
  selectedTag: string | null;

  createNote: (initialTitle?: string, initialContent?: string, tags?: string[]) => string;
  updateNote: (id: string, updates: Partial<Pick<NoteItem, 'title' | 'content' | 'tags'>>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  setActiveNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
}

const DEFAULT_SAMPLE_NOTE: NoteItem = {
  id: 'note-sample-1',
  title: 'OM Assistant Architecture & Roadmap',
  content: `# OM AI Assistant — System Blueprint
*Think. Talk. See. Act. Achieve.*

### Key Architecture Modules:
1. **Multimodal Core**: Text, Voice, Vision (Camera & Screen), and Multi-format File parsing.
2. **Dedicated Voice Mode**: Low-latency speech recognition, audio frequency spectrum analyzer, natural pause detection, and instant barge-in interruption.
3. **Action Pipeline**: Think -> Plan -> Act -> Achieve state machine with real-time user-facing step indicators.
4. **Specialized Workspaces**:
   - Chat Assistant
   - Live Code Sandbox (HTML/CSS/JS preview)
   - Data Analytics (CSV/JSON statistics & interactive charts)
   - Notebook & Scratchpad
5. **Provider Agnostic**: Seamless plug-in for Gemini, OpenAI, Claude, Groq, and local Ollama models.`,
  tags: ['Architecture', 'Productivity', 'Roadmap'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isPinned: true,
};

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set, get) => ({
      notes: [DEFAULT_SAMPLE_NOTE],
      activeNoteId: DEFAULT_SAMPLE_NOTE.id,
      searchQuery: '',
      selectedTag: null,

      createNote: (initialTitle = 'Untitled Note', initialContent = '', tags = ['General']) => {
        const id = 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
        const newNote: NoteItem = {
          id,
          title: initialTitle,
          content: initialContent,
          tags,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
          activeNoteId: id,
        }));
        return id;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => {
          const filtered = state.notes.filter((n) => n.id !== id);
          return {
            notes: filtered,
            activeNoteId: state.activeNoteId === id ? (filtered[0]?.id || null) : state.activeNoteId,
          };
        });
      },

      togglePinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n
          ),
        }));
      },

      setActiveNoteId: (id) => set({ activeNoteId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTag: (tag) => set({ selectedTag: tag }),
    }),
    {
      name: 'om-assistant-notebook',
    }
  )
);
