import { create } from 'zustand';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | null;
  show: boolean;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: '',
  type: null,
  show: false,
  showNotification: (message, type) => {
    set({ message, type, show: true });
    setTimeout(() => {
      set({ show: false });
    }, 4000);
  },
  hideNotification: () => set({ show: false }),
}));

interface LoadingState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
