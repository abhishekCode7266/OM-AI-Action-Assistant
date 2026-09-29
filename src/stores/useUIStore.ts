import { create } from 'zustand';

export type WorkspaceTab =
  | 'chat'
  | 'coding'
  | 'data'
  | 'notebook'
  | 'image'
  | 'video'
  | 'settings'
  | 'permissions'
  | 'help';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface UIState {
  activeTab: WorkspaceTab;
  isSidebarOpen: boolean;
  isToolsPanelOpen: boolean;
  isVoiceModalOpen: boolean;
  isCameraModalOpen: boolean;
  isScreenShareActive: boolean;
  toasts: ToastItem[];

  setActiveTab: (tab: WorkspaceTab) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleToolsPanel: () => void;
  setToolsPanelOpen: (open: boolean) => void;
  setVoiceModalOpen: (open: boolean) => void;
  setCameraModalOpen: (open: boolean) => void;
  setScreenShareActive: (active: boolean) => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'chat',
  isSidebarOpen: true,
  isToolsPanelOpen: false,
  isVoiceModalOpen: false,
  isCameraModalOpen: false,
  isScreenShareActive: false,
  toasts: [],

  setActiveTab: (activeTab) => set({ activeTab }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleToolsPanel: () => set((state) => ({ isToolsPanelOpen: !state.isToolsPanelOpen })),
  setToolsPanelOpen: (isToolsPanelOpen) => set({ isToolsPanelOpen }),
  setVoiceModalOpen: (isVoiceModalOpen) => set({ isVoiceModalOpen }),
  setCameraModalOpen: (isCameraModalOpen) => set({ isCameraModalOpen }),
  setScreenShareActive: (isScreenShareActive) => set({ isScreenShareActive }),
  addToast: (toast) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
