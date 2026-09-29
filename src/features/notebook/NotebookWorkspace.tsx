'use client';

import React, { useState } from 'react';
import { useNotebookStore } from '@/stores/useNotebookStore';
import { useChatStore } from '@/stores/useChatStore';
import { useUIStore } from '@/stores/useUIStore';
import { formatDate } from '@/utils/cn';
import {
  CheckSquare,
  Download,
  FileText,
  Pin,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';

export const NotebookWorkspace: React.FC = () => {
  const {
    notes,
    activeNoteId,
    searchQuery,
    selectedTag,
    createNote,
    updateNote,
    deleteNote,
    togglePinNote,
    setActiveNoteId,
    setSearchQuery,
    setSelectedTag,
  } = useNotebookStore();

  const { addMessage, createNewConversation, setActiveMode } = useChatStore();
  const { setActiveTab } = useUIStore();

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // Collect all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || n.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleAskOMToSummarize = () => {
    if (!activeNote) return;
    const convId = createNewConversation('writing', `Summary: ${activeNote.title}`);
    setActiveMode('writing');
    addMessage(convId, {
      role: 'user',
      content: `Please provide a concise executive summary and list of key takeaways for this note:\n\n# ${activeNote.title}\n\n${activeNote.content}`,
      mode: 'writing',
    });
    setActiveTab('chat');
  };

  const handleConvertNotesToTasks = () => {
    if (!activeNote) return;
    const convId = createNewConversation('general', `Action Items: ${activeNote.title}`);
    setActiveMode('general');
    addMessage(convId, {
      role: 'user',
      content: `Please parse this note and extract all actionable tasks, deliverables, and next steps formatted as an actionable checklist:\n\n# ${activeNote.title}\n\n${activeNote.content}`,
      mode: 'general',
    });
    setActiveTab('chat');
  };

  const handleExportMarkdown = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-slate-950 overflow-hidden">
      {/* Left: Notes Navigation Sidebar */}
      <div className="w-full md:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        {/* Top actions */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">Notebook</h3>
          </div>
          <button
            onClick={() => createNote()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {/* Search & Tags */}
        <div className="p-3 border-b border-slate-800 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tag Pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`text-[10px] px-2 py-0.5 rounded-lg transition-colors ${
                  selectedTag === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`group p-3 rounded-2xl cursor-pointer transition-all ${
                note.id === activeNoteId
                  ? 'bg-slate-900 border border-blue-500/40 text-white shadow-sm'
                  : 'hover:bg-slate-900/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-100 truncate flex-1 pr-2">
                  {note.title || 'Untitled Note'}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinNote(note.id);
                    }}
                    className="p-1 hover:text-blue-400"
                  >
                    <Pin className={`w-3 h-3 ${note.isPinned ? 'fill-blue-400 text-blue-400' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this note?')) deleteNote(note.id);
                    }}
                    className="p-1 hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                {note.content.replace(/[#*`]/g, '') || 'Empty note...'}
              </p>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No notes found.
            </div>
          )}
        </div>
      </div>

      {/* Right: Active Note Editor */}
      {activeNote ? (
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Note Editor Header Bar */}
          <div className="h-14 px-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
              className="text-base font-bold text-white bg-transparent border-none focus:outline-none flex-1 placeholder-slate-500"
              placeholder="Note Title..."
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleAskOMToSummarize}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                title="Summarize with OM"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Summarize</span>
              </button>

              <button
                onClick={handleConvertNotesToTasks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                title="Turn notes into action items"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Turn into Tasks</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Export Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Note Editor Body */}
          <div className="flex-1 p-6 overflow-y-auto">
            <textarea
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              placeholder="Start writing notes, ideas, meeting minutes, or specifications in Markdown..."
              className="w-full h-full bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none text-sm leading-relaxed"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
          Select or create a note to begin.
        </div>
      )}
    </div>
  );
};
