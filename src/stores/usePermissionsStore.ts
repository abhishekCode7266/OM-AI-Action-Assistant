import { create } from 'zustand';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

interface PermissionsState {
  microphone: PermissionState;
  camera: PermissionState;
  notifications: PermissionState;
  screenShareAvailable: boolean;

  checkPermissions: () => Promise<void>;
  requestMicrophone: () => Promise<boolean>;
  requestCamera: () => Promise<boolean>;
  requestNotifications: () => Promise<boolean>;
}

export const usePermissionsStore = create<PermissionsState>((set) => ({
  microphone: 'prompt',
  camera: 'prompt',
  notifications: 'prompt',
  screenShareAvailable: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia,

  checkPermissions: async () => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return;

    try {
      // Check microphone permission
      const micStatus = await navigator.permissions.query({ name: 'microphone' as any }).catch(() => null);
      if (micStatus) {
        set({ microphone: micStatus.state as PermissionState });
        micStatus.onchange = () => set({ microphone: micStatus.state as PermissionState });
      }

      // Check camera permission
      const camStatus = await navigator.permissions.query({ name: 'camera' as any }).catch(() => null);
      if (camStatus) {
        set({ camera: camStatus.state as PermissionState });
        camStatus.onchange = () => set({ camera: camStatus.state as PermissionState });
      }

      // Check notifications
      if ('Notification' in window) {
        const notifState = Notification.permission === 'default' ? 'prompt' : (Notification.permission as PermissionState);
        set({ notifications: notifState });
      }

      set({
        screenShareAvailable: !!navigator.mediaDevices?.getDisplayMedia,
      });
    } catch (e) {
      // Fallback
    }
  },

  requestMicrophone: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      set({ microphone: 'granted' });
      return true;
    } catch (e) {
      set({ microphone: 'denied' });
      return false;
    }
  },

  requestCamera: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      set({ camera: 'granted' });
      return true;
    } catch (e) {
      set({ camera: 'denied' });
      return false;
    }
  },

  requestNotifications: async () => {
    if (!('Notification' in window)) return false;
    try {
      const perm = await Notification.requestPermission();
      const state = perm === 'default' ? 'prompt' : (perm as PermissionState);
      set({ notifications: state });
      return perm === 'granted';
    } catch (e) {
      return false;
    }
  },
}));
