'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useVoiceStore } from '@/stores/useVoiceStore';
import { useUIStore } from '@/stores/useUIStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useChatStore } from '@/stores/useChatStore';
import { speechService } from '@/services/voice/speech';
import {
  Mic,
  MicOff,
  Square,
  X,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Radio,
} from 'lucide-react';

export const VoiceModal: React.FC = () => {
  const { isVoiceModalOpen, setVoiceModalOpen, addToast } = useUIStore();
  const {
    voiceState,
    transcript,
    interimTranscript,
    audioLevel,
    isMuted,
    errorMessage,
    setVoiceState,
    setTranscript,
    setInterimTranscript,
    setAudioLevel,
    setIsMuted,
    setErrorMessage,
    resetVoice,
  } = useVoiceStore();

  const { voiceName, speechRate, speechVolume, setVoiceSettings } = useSettingsStore();
  const { activeMode, addMessage, activeConversationId, createNewConversation } = useChatStore();

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize available voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechService.getAvailableVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Audio waveform animation loop
  useEffect(() => {
    if (!isVoiceModalOpen) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      phase += 0.05;

      const numWaves = 3;
      for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        ctx.lineWidth = 2.5;

        // Dynamic gradient colors based on state
        const isSpeaking = voiceState === 'SPEAKING';
        const isListening = voiceState === 'LISTENING';
        const strokeColor = isSpeaking
          ? `rgba(139, 92, 246, ${0.4 + w * 0.25})`
          : isListening
          ? `rgba(56, 136, 255, ${0.4 + w * 0.25})`
          : `rgba(100, 116, 139, 0.3)`;

        ctx.strokeStyle = strokeColor;

        const amplitude =
          voiceState === 'IDLE'
            ? 5
            : isSpeaking
            ? 35 + Math.sin(phase) * 15
            : Math.max(10, audioLevel * 70);

        for (let x = 0; x < width; x += 3) {
          const progress = x / width;
          const envelope = Math.sin(progress * Math.PI); // Taper ends
          const y =
            centerY +
            Math.sin(progress * 10 + phase + w * 1.5) * amplitude * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isVoiceModalOpen, voiceState, audioLevel]);

  // Start voice listening session on modal open
  useEffect(() => {
    if (isVoiceModalOpen) {
      startVoiceSession();
    } else {
      endVoiceSession();
    }
  }, [isVoiceModalOpen]);

  const startVoiceSession = async () => {
    resetVoice();
    setVoiceState('LISTENING');

    try {
      // 1. Start Audio analyser for real-time visualization
      await speechService.startAudioAnalysis((level) => {
        setAudioLevel(level);
      });

      // 2. Start Speech Recognition
      speechService.startListening({
        onResult: (text, isFinal) => {
          if (isFinal) {
            setTranscript(text);
            setInterimTranscript('');
            handleFinalSpeech(text);
          } else {
            setInterimTranscript(text);
            // Reset silence timeout
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (text.trim()) {
                handleFinalSpeech(text);
              }
            }, 1800);
          }
        },
        onError: (err) => {
          setErrorMessage(err);
          setVoiceState('ERROR');
        },
        onEnd: () => {
          // Auto restart listening if still in voice modal and not speaking
          const state = useVoiceStore.getState().voiceState;
          if (state === 'LISTENING' && isVoiceModalOpen) {
            try {
              speechService.stopListening();
              speechService.startListening({
                onResult: (text, isFinal) => {
                  if (isFinal) handleFinalSpeech(text);
                  else setInterimTranscript(text);
                },
                onError: (e) => setErrorMessage(e),
                onEnd: () => {},
              });
            } catch (e) {}
          }
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Microphone access failed.');
      setVoiceState('ERROR');
    }
  };

  const endVoiceSession = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    speechService.stopListening();
    speechService.stopSpeaking();
    speechService.stopAudioAnalysis();
    resetVoice();
  };

  const handleInterrupt = () => {
    speechService.stopSpeaking();
    setVoiceState('INTERRUPTED');
    setTimeout(() => {
      setVoiceState('LISTENING');
      startVoiceSession();
    }, 300);
  };

  const handleFinalSpeech = async (userSpokenText: string) => {
    if (!userSpokenText.trim()) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    speechService.stopListening();
    setVoiceState('PROCESSING');

    let convId = activeConversationId;
    if (!convId) {
      convId = createNewConversation(activeMode);
    }

    addMessage(convId, {
      role: 'user',
      content: userSpokenText,
      mode: activeMode,
    });

    try {
      const { activeProvider, activeModel, customApiKeys } = useSettingsStore.getState();
      const customKey = customApiKeys[activeProvider];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userSpokenText }],
          mode: activeMode,
          provider: activeProvider,
          model: activeModel,
          customApiKey: customKey,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Voice AI service temporarily unavailable');
      }

      // Read complete response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value);
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.text) fullResponse += parsed.text;
              } catch (e) {}
            }
          }
        }
      }

      if (!fullResponse.trim()) {
        fullResponse = "I understood your query, but didn't receive text from the provider.";
      }

      addMessage(convId, {
        role: 'assistant',
        content: fullResponse,
        mode: activeMode,
      });

      // Speak assistant response
      setVoiceState('SPEAKING');
      speechService.speak(fullResponse, {
        voiceName,
        rate: speechRate,
        volume: speechVolume,
        onEnd: () => {
          setVoiceState('LISTENING');
          startVoiceSession();
        },
        onError: () => {
          setVoiceState('LISTENING');
          startVoiceSession();
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message);
      setVoiceState('ERROR');
      addToast({
        title: 'Voice Error',
        message: err.message,
        type: 'error',
      });
    }
  };

  if (!isVoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            endVoiceSession();
            setVoiceModalOpen(false);
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close voice mode"
        >
          <X className="w-5 h-5" />
        </button>

        {/* OM Voice Brand & Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white shadow-md shadow-blue-500/30">
            OM
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Conversational Voice Mode
          </span>
        </div>

        {/* State Indicator Pill */}
        <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold shadow-inner">
          <Radio
            className={`w-3.5 h-3.5 ${
              voiceState === 'LISTENING'
                ? 'text-blue-400 animate-pulse'
                : voiceState === 'SPEAKING'
                ? 'text-purple-400 animate-pulse'
                : voiceState === 'PROCESSING'
                ? 'text-amber-400 animate-spin'
                : voiceState === 'ERROR'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          />
          <span
            className={
              voiceState === 'LISTENING'
                ? 'text-blue-300'
                : voiceState === 'SPEAKING'
                ? 'text-purple-300'
                : voiceState === 'PROCESSING'
                ? 'text-amber-300'
                : voiceState === 'ERROR'
                ? 'text-rose-300'
                : 'text-slate-300'
            }
          >
            {voiceState === 'LISTENING' && 'Listening to you...'}
            {voiceState === 'SPEAKING' && 'OM is speaking'}
            {voiceState === 'PROCESSING' && 'Thinking & Processing...'}
            {voiceState === 'INTERRUPTED' && 'Interrupted'}
            {voiceState === 'ERROR' && 'Voice Error'}
            {voiceState === 'IDLE' && 'Ready to talk'}
          </span>
        </div>

        {/* Canvas Visualizer Waveform */}
        <div className="w-full h-32 flex items-center justify-center my-2">
          <canvas
            ref={canvasRef}
            width={480}
            height={128}
            className="w-full h-full max-w-md rounded-2xl"
          />
        </div>

        {/* Real-time Transcript Bubble */}
        <div className="w-full min-h-[60px] max-h-24 overflow-y-auto my-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/60 text-xs sm:text-sm text-slate-200 font-medium">
          {interimTranscript ? (
            <span className="text-slate-300 italic">{interimTranscript}</span>
          ) : transcript ? (
            <span>"{transcript}"</span>
          ) : (
            <span className="text-slate-500 italic">
              Speak naturally — OM will detect when you pause...
            </span>
          )}
        </div>

        {/* Error Notification if any */}
        {errorMessage && (
          <div className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-4 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Voice Control Buttons */}
        <div className="flex items-center justify-center gap-4 mt-2">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl border transition-all ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Center Main Action Button */}
          {voiceState === 'SPEAKING' ? (
            <button
              onClick={handleInterrupt}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-xl shadow-amber-600/30 transition-all active:scale-95"
              title="Interrupt OM (Barge-in)"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Interrupt</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (voiceState === 'LISTENING') {
                  speechService.stopListening();
                  setVoiceState('IDLE');
                } else {
                  startVoiceSession();
                }
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
              title="Toggle Listening"
            >
              <Mic className="w-7 h-7" />
            </button>
          )}

          {/* End Session Button */}
          <button
            onClick={() => {
              endVoiceSession();
              setVoiceModalOpen(false);
            }}
            className="p-3.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-800/90 border border-slate-700 transition-all"
            title="End Session"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Preferences Quick Bar */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 w-full flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <select
              value={voiceName}
              onChange={(e) => setVoiceSettings({ voiceName: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500 max-w-[180px]"
            >
              <option value="">Default System Voice</option>
              {availableVoices.map((v, i) => (
                <option key={i} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Speed: {speechRate.toFixed(1)}x</span>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={speechRate}
              onChange={(e) => setVoiceSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-20 accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
