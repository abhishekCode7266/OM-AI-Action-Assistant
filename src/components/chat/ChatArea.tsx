'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUIStore } from '@/stores/useUIStore';
import { AI_MODES } from '@/config/modes';
import { MessageItem } from './MessageItem';
import { ActionStepsTracker } from './ActionStepsTracker';
import { InputBar } from './InputBar';
import { ActionStep, SearchSource } from '@/types';
import { speechService } from '@/services/voice/speech';
import { Sparkles, Terminal, Compass, Layers, Bot, Loader2 } from 'lucide-react';

export const ChatArea: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    activeMode,
    isStreaming,
    currentActions,
    pendingAttachments,
    addMessage,
    updateMessage,
    startStreaming,
    appendStreamChunk,
    finishStreaming,
    setActionSteps,
    clearActionSteps,
    clearPendingAttachments,
    createNewConversation,
  } = useChatStore();

  const { activeProvider, activeModel, customApiKeys, autoSpeakResponse, voiceName, speechRate } =
    useSettingsStore();
  const { addToast } = useUIStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  const modeConfig = AI_MODES[activeMode] || AI_MODES.general;

  // Auto-scroll on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, isStreaming]);

  const handleSendMessage = async (text: string) => {
    let convId = activeConversationId;
    if (!convId) {
      convId = createNewConversation(activeMode);
    }

    const attachmentsToSend = [...pendingAttachments];
    clearPendingAttachments();

    // 1. Add User Message
    const userMsg = addMessage(convId, {
      role: 'user',
      content: text,
      mode: activeMode,
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
    });

    // 2. Setup initial Action Steps: THINK -> PLAN -> ACT -> ACHIEVE
    const steps: ActionStep[] = [
      {
        id: 'step-1',
        type: 'think',
        title: 'Understanding request and context...',
        status: 'in_progress',
        timestamp: Date.now(),
      },
      {
        id: 'step-2',
        type: 'plan',
        title: 'Formulating step-by-step reasoning plan...',
        status: 'pending',
        timestamp: Date.now(),
      },
      {
        id: 'step-3',
        type: 'act',
        title: 'Synthesizing response and executing tools...',
        status: 'pending',
        timestamp: Date.now(),
      },
      {
        id: 'step-4',
        type: 'achieve',
        title: 'Verifying output and final completion.',
        status: 'pending',
        timestamp: Date.now(),
      },
    ];
    setActionSteps(steps);

    // 3. Create Assistant Message Placeholder
    const assistantMsg = addMessage(convId, {
      role: 'assistant',
      content: '',
      mode: activeMode,
      isStreaming: true,
    });

    startStreaming(convId, assistantMsg.id);
    abortControllerRef.current = new AbortController();

    try {
      // Step update: Think completed, Plan in progress
      setTimeout(() => {
        setActionSteps(
          steps.map((s) => {
            if (s.id === 'step-1') return { ...s, status: 'completed' };
            if (s.id === 'step-2') return { ...s, status: 'in_progress' };
            return s;
          })
        );
      }, 400);

      // Perform real search if Research mode and query looks like investigation
      let searchSources: SearchSource[] | undefined = undefined;
      if (activeMode === 'research') {
        try {
          const searchRes = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text }),
          });
          const searchData = await searchRes.json();
          if (searchData.results && searchData.results.length > 0) {
            searchSources = searchData.results;
          }
        } catch (e) {
          console.warn('Research search step failed:', e);
        }
      }

      // Step update: Act in progress
      setTimeout(() => {
        setActionSteps(
          steps.map((s) => {
            if (s.id === 'step-1' || s.id === 'step-2') return { ...s, status: 'completed' };
            if (s.id === 'step-3') return { ...s, status: 'in_progress' };
            return s;
          })
        );
      }, 800);

      // Prepare payload
      const allMsgs = [...currentMessages, userMsg];
      const customKey = customApiKeys[activeProvider];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMsgs,
          mode: activeMode,
          provider: activeProvider,
          model: activeModel,
          customApiKey: customKey,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}: ${res.statusText}`);
      }

      if (!res.body) throw new Error('Response body is null');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulated += parsed.text;
                appendStreamChunk(parsed.text);
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Ignore non-json
            }
          }
        }
      }

      // Finalize steps to Achieve completed
      setActionSteps(
        steps.map((s) => ({ ...s, status: 'completed' }))
      );

      // Finalize assistant message
      updateMessage(convId, assistantMsg.id, {
        content: accumulated,
        isStreaming: false,
        sources: searchSources,
      });

      // Auto-speak if enabled
      if (autoSpeakResponse && accumulated) {
        speechService.speak(accumulated, {
          voiceName,
          rate: speechRate,
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        updateMessage(convId, assistantMsg.id, {
          isStreaming: false,
          error: 'Generation stopped by user.',
        });
      } else {
        updateMessage(convId, assistantMsg.id, {
          isStreaming: false,
          error: err.message || 'An error occurred during response generation.',
        });
        addToast({
          title: 'Response Failed',
          message: err.message || 'Could not communicate with the AI provider.',
          type: 'error',
        });
      }
    } finally {
      finishStreaming();
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerate = (msgIndex: number) => {
    if (msgIndex <= 0 || !activeConversationId) return;
    const prevUserMsg = currentMessages[msgIndex - 1];
    if (prevUserMsg && prevUserMsg.role === 'user') {
      handleSendMessage(prevUserMsg.content);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {currentMessages.length === 0 ? (
          /* Empty State Hero Banner */
          <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 text-white font-black text-2xl">
              OM
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {modeConfig.name} Assistant
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto">
                {modeConfig.description}
              </p>
            </div>

            {/* Suggested Prompts Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 text-left">
              {modeConfig.suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all text-xs text-slate-300 hover:text-white flex items-center justify-between group shadow-sm"
                >
                  <span className="line-clamp-2">{prompt}</span>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="divide-y divide-slate-800/40">
            {currentMessages.map((msg, index) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onRegenerate={
                  msg.role === 'assistant' && index === currentMessages.length - 1
                    ? () => handleRegenerate(index)
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {/* Action Steps Tracker (Think -> Plan -> Act -> Achieve) */}
        {currentActions.length > 0 && isStreaming && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3">
            <ActionStepsTracker steps={currentActions} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Modern Input Bar */}
      <InputBar
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
      />
    </div>
  );
};
