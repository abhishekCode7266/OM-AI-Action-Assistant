'use client';

import React, { useState } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useUIStore, WorkspaceTab } from '@/stores/useUIStore';
import { formatDate } from '@/utils/cn';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Download,
  MessageSquare,
  Code2,
  BarChart3,
  FileText,
  Image as ImageIcon,
  Video,
  ShieldCheck,
  Settings,
  HelpCircle,
  X,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    createNewConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    searchQuery,
    setSearchQuery,
  } = useChatStore();

  const { activeTab, setActiveTab, isSidebarOpen, setSidebarOpen } = useUIStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned = filteredConversations.filter((c) => c.isPinned);
  const unpinned = filteredConversations.filter((c) => !c.isPinned);

  // Group unpinned conversations by date
  const groups: Record<string, typeof unpinned> = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    Older: [],
  };

  unpinned.forEach((c) => {
    const group = formatDate(c.updatedAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(c);
  });

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleExportChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chat = conversations.find((c) => c.id === id);
    const messages = useChatStore.getState().messages[id] || [];
    const exportData = {
      conversation: chat,
      messages,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OM_Chat_${(chat?.title || 'conversation').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
          <button
            onClick={() => {
              createNewConversation();
              setActiveTab('chat');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-800/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {/* Pinned Chats */}
          {pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <Pin className="w-3 h-3 text-blue-400" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {pinned.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {/* Grouped Chats */}
          {Object.entries(groups).map(([groupTitle, list]) => {
            if (list.length === 0) return null;
            return (
              <div key={groupTitle}>
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {groupTitle}
                </div>
                <div className="space-y-0.5 mt-1">
                  {list.map((conv) => renderConversationItem(conv))}
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="text-center py-8 px-4 text-xs text-slate-500">
              {searchQuery ? 'No conversations matching search.' : 'No conversations yet.'}
            </div>
          )}
        </div>

        {/* Workspaces & Tool Navigation */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 space-y-0.5">
          <NavItem
            icon={MessageSquare}
            label="Chat"
            active={activeTab === 'chat'}
            onClick={() => {
              setActiveTab('chat');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
          <NavItem
            icon={Code2}
            label="Code Workspace"
            active={activeTab === 'coding'}
            onClick={() => {
              setActiveTab('coding');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
          <NavItem
            icon={BarChart3}
            label="Data Analyst"
            active={activeTab === 'data'}
            onClick={() => {
              setActiveTab('data');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
          <NavItem
            icon={FileText}
            label="Notebook"
            active={activeTab === 'notebook'}
            onClick={() => {
              setActiveTab('notebook');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
          <NavItem
            icon={ImageIcon}
            label="Image Studio"
            active={activeTab === 'image'}
            onClick={() => {
              setActiveTab('image');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
          <NavItem
            icon={Video}
            label="Video Studio"
            active={activeTab === 'video'}
            onClick={() => {
              setActiveTab('video');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
          <NavItem
            icon={ShieldCheck}
            label="Permissions & Privacy"
            active={activeTab === 'permissions'}
            onClick={() => {
              setActiveTab('permissions');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
          <NavItem
            icon={Settings}
            label="Settings"
            active={activeTab === 'settings'}
            onClick={() => {
              setActiveTab('settings');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
          <NavItem
            icon={HelpCircle}
            label="Help & Guide"
            active={activeTab === 'help'}
            onClick={() => {
              setActiveTab('help');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          />
        </div>
      </aside>
    </>
  );

  function renderConversationItem(conv: any) {
    const isSelected = activeConversationId === conv.id && activeTab === 'chat';
    const isEditing = editingId === conv.id;

    return (
      <div
        key={conv.id}
        onClick={() => {
          selectConversation(conv.id);
          setActiveTab('chat');
          if (window.innerWidth < 768) setSidebarOpen(false);
        }}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
          isSelected
            ? 'bg-blue-600/15 text-blue-300 font-medium border border-blue-500/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
      >
        <div className="flex-1 min-w-0 pr-2">
          {isEditing ? (
            <input
              type="text"
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleSaveRename(conv.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(conv.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-slate-900 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
            />
          ) : (
            <div className="truncate text-slate-200">{conv.title}</div>
          )}
        </div>

        {/* Hover Action Buttons */}
        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePinConversation(conv.id);
            }}
            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800"
            title={conv.isPinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin className={`w-3 h-3 ${conv.isPinned ? 'fill-blue-400 text-blue-400' : ''}`} />
          </button>
          <button
            onClick={(e) => handleStartRename(conv.id, conv.title, e)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Rename"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => handleExportChat(conv.id, e)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Export JSON"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this conversation?')) {
                deleteConversation(conv.id);
              }
            }}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
};

interface NavItemProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </div>
      <ChevronRight className="w-3 h-3 opacity-40" />
    </button>
  );
};
