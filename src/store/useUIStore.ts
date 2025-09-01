import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  // State
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  activeModal: string | null;
  notifications: {
    show: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
  layout: {
    gridColumns: number;
    gridRows: number;
  };
  preferences: {
    showTooltips: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
    soundEnabled: boolean;
  };

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setNotificationSettings: (settings: Partial<UIState['notifications']>) => void;
  setLayoutGrid: (columns: number, rows: number) => void;
  updatePreferences: (preferences: Partial<UIState['preferences']>) => void;
  resetToDefaults: () => void;
}

const defaultState = {
  sidebarCollapsed: false,
  theme: 'dark' as const,
  activeModal: null,
  notifications: {
    show: true,
    position: 'top-right' as const,
  },
  layout: {
    gridColumns: 3,
    gridRows: 2,
  },
  preferences: {
    showTooltips: true,
    autoRefresh: true,
    refreshInterval: 5000,
    soundEnabled: true,
  },
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...defaultState,

        // Actions
        toggleSidebar: () => {
          set(
            (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
            false,
            'toggleSidebar'
          );
        },
        
        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed');
        },
        
        setTheme: (theme) => {
          set({ theme }, false, 'setTheme');
          // Apply theme to document
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
          }
        },
        
        openModal: (modalId) => set({ activeModal: modalId }, false, 'openModal'),
        
        closeModal: () => set({ activeModal: null }, false, 'closeModal'),
        
        setNotificationSettings: (settings) => {
          set(
            (state) => ({
              notifications: { ...state.notifications, ...settings },
            }),
            false,
            'setNotificationSettings'
          );
        },
        
        setLayoutGrid: (columns, rows) => {
          set(
            { layout: { gridColumns: columns, gridRows: rows } },
            false,
            'setLayoutGrid'
          );
        },
        
        updatePreferences: (preferences) => {
          set(
            (state) => ({
              preferences: { ...state.preferences, ...preferences },
            }),
            false,
            'updatePreferences'
          );
        },
        
        resetToDefaults: () => {
          set(defaultState, false, 'resetToDefaults');
          // Reset theme in document
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', defaultState.theme === 'dark');
          }
        },
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
          notifications: state.notifications,
          layout: state.layout,
          preferences: state.preferences,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);

// Selectors
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebarCollapsed);
export const useTheme = () => useUIStore((state) => state.theme);
export const useActiveModal = () => useUIStore((state) => state.activeModal);
export const useNotificationSettings = () => useUIStore((state) => state.notifications);
export const useLayoutGrid = () => useUIStore((state) => state.layout);
export const usePreferences = () => useUIStore((state) => state.preferences);

// Initialize theme on store creation
if (typeof document !== 'undefined') {
  const initialTheme = useUIStore.getState().theme;
  document.documentElement.classList.toggle('dark', initialTheme === 'dark');
}