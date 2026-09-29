import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIProviderId, AppSettings } from '@/types';

interface SettingsState extends AppSettings {
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setActiveProvider: (provider: AIProviderId) => void;
  setActiveModel: (model: string) => void;
  setCustomApiKey: (provider: AIProviderId, key: string) => void;
  setVoiceSettings: (settings: Partial<Pick<AppSettings, 'voiceName' | 'speechRate' | 'speechPitch' | 'speechVolume' | 'autoSpeakResponse'>>) => void;
  setChatSettings: (settings: Partial<Pick<AppSettings, 'enterToSend' | 'autoScroll' | 'messageDensity' | 'streamResponses'>>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  activeProvider: 'gemini',
  activeModel: 'gemini-1.5-flash',
  customApiKeys: {},
  voiceName: '',
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 1.0,
  autoSpeakResponse: false,
  enterToSend: true,
  autoScroll: true,
  messageDensity: 'comfortable',
  streamResponses: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      setActiveProvider: (activeProvider) => set({ activeProvider }),
      setActiveModel: (activeModel) => set({ activeModel }),
      setCustomApiKey: (provider, key) =>
        set((state) => ({
          customApiKeys: { ...state.customApiKeys, [provider]: key },
        })),
      setVoiceSettings: (voiceSettings) =>
        set((state) => ({ ...state, ...voiceSettings })),
      setChatSettings: (chatSettings) =>
        set((state) => ({ ...state, ...chatSettings })),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'om-assistant-settings',
    }
  )
);
