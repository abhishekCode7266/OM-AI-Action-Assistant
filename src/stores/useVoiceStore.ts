import { create } from 'zustand';
import { VoiceState } from '@/types';

interface VoiceStoreState {
  voiceState: VoiceState;
  transcript: string;
  interimTranscript: string;
  audioLevel: number; // 0.0 to 1.0
  isMuted: boolean;
  isVoiceModeOpen: boolean;
  errorMessage: string | null;

  setVoiceState: (voiceState: VoiceState) => void;
  setTranscript: (transcript: string) => void;
  setInterimTranscript: (interimTranscript: string) => void;
  setAudioLevel: (audioLevel: number) => void;
  setIsMuted: (isMuted: boolean) => void;
  setIsVoiceModeOpen: (isVoiceModeOpen: boolean) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  resetVoice: () => void;
}

export const useVoiceStore = create<VoiceStoreState>((set) => ({
  voiceState: 'IDLE',
  transcript: '',
  interimTranscript: '',
  audioLevel: 0,
  isMuted: false,
  isVoiceModeOpen: false,
  errorMessage: null,

  setVoiceState: (voiceState) => set({ voiceState }),
  setTranscript: (transcript) => set({ transcript }),
  setInterimTranscript: (interimTranscript) => set({ interimTranscript }),
  setAudioLevel: (audioLevel) => set({ audioLevel }),
  setIsMuted: (isMuted) => set({ isMuted }),
  setIsVoiceModeOpen: (isVoiceModeOpen) => set({ isVoiceModeOpen }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  resetVoice: () =>
    set({
      voiceState: 'IDLE',
      transcript: '',
      interimTranscript: '',
      audioLevel: 0,
      errorMessage: null,
    }),
}));
