'use client';

import React, { useState } from 'react';
import { Attachment, Message, SearchSource } from '@/types';
import { CodeBlock } from './CodeBlock';
import { speechService } from '@/services/voice/speech';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { formatTime } from '@/utils/cn';
import {
  Check,
  Copy,
  Edit2,
  ExternalLink,
  FileCode,
  FileText,
  RotateCw,
  Sparkles,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onRegenerate,
  onEdit,
}) => {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { voiceName, speechRate, speechPitch, speechVolume } = useSettingsStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speechService.speak(message.content, {
      voiceName,
      rate: speechRate,
      pitch: speechPitch,
      volume: speechVolume,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(editContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group w-full py-4 sm:py-6 px-3 sm:px-6 transition-colors ${
        isAssistant ? 'bg-slate-900/30' : 'bg-transparent'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-xs">
              OM
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header Row: Role & Timestamp */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                {isAssistant ? 'OM' : 'You'}
              </span>
              <span className="text-[11px] text-slate-500">
                {formatTime(message.createdAt)}
              </span>
            </div>

            {/* Message Action Toolbar */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {isAssistant && (
                <>
                  <button
                    onClick={handleSpeak}
                    className={`p-1 rounded transition-colors ${
                      isSpeaking
                        ? 'text-blue-400 bg-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                    title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  {onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Regenerate response"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}

              {!isAssistant && onEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Edit message"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Attachments Display */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {message.attachments.map((att) => renderAttachment(att))}
            </div>
          )}

          {/* Message Text / Edit Area */}
          {isEditing ? (
            <div className="space-y-2 mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-slate-900 border border-blue-500 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                >
                  Save & Resend
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-200 text-sm leading-relaxed break-words">
              {renderMarkdown(message.content)}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1 align-middle" />
              )}
            </div>
          )}

          {/* Citations & Sources (for Research Mode) */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Referenced Sources & Citations
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all flex items-start gap-2 group/src"
                  >
                    <div className="p-1 rounded bg-slate-800 text-slate-400 group-hover/src:text-blue-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate group-hover/src:text-blue-300">
                        {src.title}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                        {src.snippet}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner if any */}
          {message.error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <span>{message.error}</span>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-medium"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderAttachment(att: Attachment) {
    if (att.dataUrl && (att.type === 'image' || att.type === 'camera_snapshot' || att.type === 'screen_snapshot')) {
      return (
        <div key={att.id} className="relative group/att rounded-xl overflow-hidden border border-slate-800 max-w-xs">
          <img src={att.dataUrl} alt={att.name} className="max-h-48 object-cover rounded-xl" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/att:opacity-100 transition-opacity flex items-end p-2">
            <span className="text-[10px] text-white truncate">{att.name}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={att.id}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
      >
        <FileText className="w-3.5 h-3.5 text-blue-400" />
        <span className="truncate max-w-[180px]">{att.name}</span>
      </div>
    );
  }

  function renderMarkdown(content: string) {
    // Split into code blocks and normal text chunks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const firstLineEnd = part.indexOf('\n');
        const lang = part.slice(3, firstLineEnd).trim();
        const code = part.slice(firstLineEnd + 1, -3);
        return <CodeBlock key={index} language={lang} code={code} />;
      }

      // Format headings, bold, italic, lists, and inline code
      return (
        <div key={index} className="space-y-2 whitespace-pre-wrap">
          {formatText(part)}
        </div>
      );
    });
  }

  function formatText(text: string) {
    // Basic formatting for markdown elements
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Heading 1
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>;
      }
      // Heading 2
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-white mt-3 mb-1.5">{line.slice(3)}</h2>;
      }
      // Heading 3
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-semibold text-white mt-2 mb-1">{line.slice(4)}</h3>;
      }
      // Bullet list
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-0.5 ml-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>{renderInlineText(line.slice(2))}</span>
          </div>
        );
      }
      return <p key={idx} className="min-h-[1.25rem]">{renderInlineText(line)}</p>;
    });
  }

  function renderInlineText(line: string) {
    // Parse inline bold **bold**, italic *italic*, and `code`
    const tokens = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 text-blue-300 font-mono text-xs border border-slate-700/60">
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        return <em key={i} className="italic text-slate-300">{token.slice(1, -1)}</em>;
      }
      return token;
    });
  }
};
