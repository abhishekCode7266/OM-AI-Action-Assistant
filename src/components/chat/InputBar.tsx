'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useUIStore } from '@/stores/useUIStore';
import { useVoiceStore } from '@/stores/useVoiceStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { processUploadedFile } from '@/services/files';
import { speechService } from '@/services/voice/speech';
import {
  ArrowUp,
  Camera,
  FileCode,
  FileText,
  Image as ImageIcon,
  Mic,
  Monitor,
  Paperclip,
  Square,
  X,
} from 'lucide-react';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  onStopGeneration?: () => void;
}

export const InputBar: React.FC<InputBarProps> = ({ onSendMessage, onStopGeneration }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    isStreaming,
    pendingAttachments,
    addPendingAttachment,
    removePendingAttachment,
    clearPendingAttachments,
  } = useChatStore();

  const { setVoiceModalOpen, setCameraModalOpen, setScreenShareActive, isScreenShareActive } =
    useUIStore();
  const { enterToSend } = useSettingsStore();
  const { voiceState, setVoiceState, setTranscript } = useVoiceStore();

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && pendingAttachments.length === 0) || isStreaming) return;
    onSendMessage(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      try {
        const att = await processUploadedFile(files[i]);
        addPendingAttachment(att);
      } catch (err) {
        console.error('Failed to parse file:', err);
      }
    }
    e.target.value = '';
  };

  const handleQuickMicClick = () => {
    // If voice recognition is already running, open modal or toggle
    if (voiceState === 'LISTENING') {
      speechService.stopListening();
      setVoiceState('IDLE');
    } else {
      setVoiceModalOpen(true);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Pending Attachments List */}
        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 animate-in fade-in"
              >
                {att.dataUrl ? (
                  <img
                    src={att.dataUrl}
                    alt={att.name}
                    className="w-5 h-5 rounded object-cover"
                  />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
                <span className="truncate max-w-[140px] text-slate-200">{att.name}</span>
                <button
                  onClick={() => removePendingAttachment(att.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Card Container */}
        <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-xl">
          {/* Main Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message, ask OM anything, or paste code/data..."
            className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none max-h-48 leading-relaxed"
          />

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            {/* Left Tools (Attach, Camera, Screen, Voice Mode) */}
            <div className="flex items-center gap-1">
              {/* File Attachment Input (Hidden) */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".txt,.md,.pdf,.docx,.csv,.tsv,.json,.py,.js,.ts,.tsx,.jsx,.html,.css,.sql"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                title="Attach Document or Code"
                aria-label="Attach File"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Image Upload Input (Hidden) */}
              <input
                ref={imageInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                title="Upload Image"
                aria-label="Upload Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Camera Trigger */}
              <button
                type="button"
                onClick={() => setCameraModalOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                title="Show Camera to OM"
                aria-label="Show Camera"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Screen Share Trigger */}
              <button
                type="button"
                onClick={() => setScreenShareActive(!isScreenShareActive)}
                className={`p-2 rounded-xl transition-colors ${
                  isScreenShareActive
                    ? 'text-amber-400 bg-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
                title="Share Screen with OM"
                aria-label="Share Screen"
              >
                <Monitor className="w-4 h-4" />
              </button>

              {/* Dedicated Voice Mode Trigger */}
              <button
                type="button"
                onClick={() => setVoiceModalOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 transition-colors"
                title="Open Voice Mode"
                aria-label="Voice Mode"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Right Action: Send or Stop */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-slate-500">
                {enterToSend ? 'Enter to send' : 'Shift + Enter for new line'}
              </span>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
                  title="Stop generation"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!text.trim() && pendingAttachments.length === 0}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold transition-all shadow-md shadow-blue-600/30 disabled:shadow-none"
                  title="Send message"
                  aria-label="Send message"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
