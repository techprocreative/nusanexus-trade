import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User, AccountBalance, ConnectionStatus, Notification } from '../types';

interface AppState {
  // State
  user: User | null;
  accountBalance: AccountBalance | null;
  connectionStatus: ConnectionStatus;
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setAccountBalance: (balance: AccountBalance) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      accountBalance: null,
      connectionStatus: {
        isConnected: false,
        lastUpdate: new Date().toISOString(),
      },
      notifications: [],
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user }, false, 'setUser'),
      
      setAccountBalance: (balance) => set({ accountBalance: balance }, false, 'setAccountBalance'),
      
      setConnectionStatus: (status) => set({ connectionStatus: status }, false, 'setConnectionStatus'),
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        set(
          (state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only last 50
          }),
          false,
          'addNotification'
        );
      },
      
      markNotificationAsRead: (id) => {
        set(
          (state) => ({
            notifications: state.notifications.map((notif) =>
              notif.id === id ? { ...notif, isRead: true } : notif
            ),
          }),
          false,
          'markNotificationAsRead'
        );
      },
      
      removeNotification: (id) => {
        set(
          (state) => ({
            notifications: state.notifications.filter((notif) => notif.id !== id),
          }),
          false,
          'removeNotification'
        );
      },
      
      clearNotifications: () => set({ notifications: [] }, false, 'clearNotifications'),
      
      setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
      
      setError: (error) => set({ error }, false, 'setError'),
      
      clearError: () => set({ error: null }, false, 'clearError'),
    }),
    {
      name: 'app-store',
    }
  )
);

// Selectors
export const useUser = () => useAppStore((state) => state.user);
export const useAccountBalance = () => useAppStore((state) => state.accountBalance);
export const useConnectionStatus = () => useAppStore((state) => state.connectionStatus);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useUnreadNotifications = () => {
  const notifications = useAppStore((state) => state.notifications);
  return notifications.filter((n) => !n.isRead);
};
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);