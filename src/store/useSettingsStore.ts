import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  SettingsStore,
  UserProfile,
  TradingPreferences,
  UICustomization,
  NotificationPreferences,
  SecuritySettings,
  DataBackupSettings,
  MT5Connection,
  MT5ConnectionForm,
  AccountSettingsForm,
  PasswordChangeForm,
  NotificationPreferencesForm,
  TradingPreferencesForm,
  SecurityPreferencesForm,
  DataBackupPreferencesForm,
  ActiveSession,
  BackupCode,
  ExportRequest,
  MT5TestConnectionResponse
} from '../types/settings';

const SETTINGS_CATEGORIES = {
  TRADING: 'trading',
  UI: 'ui',
  NOTIFICATIONS: 'notifications',
  SECURITY: 'security',
  DATA: 'data',
  DATA_BACKUP: 'data'
} as const;

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial State
  userProfile: null,
  userSettings: {},
  tradingPreferences: null,
  uiCustomization: null,
  notificationPreferences: null,
  securitySettings: null,
  dataBackupSettings: null,
  mt5Connections: [],
  activeSessions: [],
  backupCodes: [],
  exportRequests: [],
  isLoading: false,
  error: null,

  // Profile Actions
  updateProfile: async (profile: Partial<AccountSettingsForm>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...profile, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      set({ userProfile: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  changePassword: async (passwordData: PasswordChangeForm) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchUserProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      set({ userProfile: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateUserProfile: async (profile: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...profile, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      set({ userProfile: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Settings Actions
  fetchUserSettings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUserSettings = {
        // Add mock user settings here
      };
      
      set({ userSettings: mockUserSettings, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch user settings', isLoading: false });
    }
  },
  
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Organize settings by category
      const settingsByCategory = data.reduce((acc, setting) => {
        acc[setting.category] = setting.data;
        return acc;
      }, {} as Record<string, any>);

      set({
        tradingPreferences: settingsByCategory[SETTINGS_CATEGORIES.TRADING] || null,
        uiCustomization: settingsByCategory[SETTINGS_CATEGORIES.UI] || null,
        notificationPreferences: settingsByCategory[SETTINGS_CATEGORIES.NOTIFICATIONS] || null,
        securitySettings: settingsByCategory[SETTINGS_CATEGORIES.SECURITY] || null,
        dataBackupSettings: settingsByCategory[SETTINGS_CATEGORIES.DATA] || null,
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateTradingPreferences: async (preferences: Partial<TradingPreferences>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentPreferences = get().tradingPreferences || {
        defaultOrderType: 'market' as const,
        defaultLotSize: 0.1,
        maxLotSize: 10,
        defaultStopLoss: 50,
        defaultTakeProfit: 100,
        maxSpread: 3,
        slippage: 1,
        maxDailyLoss: 1000,
        maxDailyTrades: 10,
        riskPerTrade: 2,
        autoCloseEnabled: false,
        autoCloseTime: '17:00',
        weekendCloseEnabled: true,
        trailingStopEnabled: false,
        trailingStopDistance: 20,
        partialCloseEnabled: false,
        partialClosePercent: 50,
        newsFilterEnabled: true,
        highImpactNewsBuffer: 30,
        maxRiskPerTrade: 2,
        autoCloseOnProfit: false,
        autoCloseOnLoss: true,
        profitTarget: 10,
        stopLossPercentage: 2,
        trailingStop: false,
        confirmOrders: true,
        oneClickTrading: false,
        showSpread: true,
        allowHedging: false
      };
      const updatedPreferences = { ...currentPreferences, ...preferences };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.TRADING,
          data: updatedPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      set({ tradingPreferences: updatedPreferences, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateUICustomization: async (settings: Partial<UICustomization>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.UI,
          data: { ...get().uiCustomization, ...settings },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      set({
        uiCustomization: { ...get().uiCustomization, ...settings },
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateNotificationPreferences: async (preferences: Partial<NotificationPreferencesForm>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.NOTIFICATIONS,
          data: { ...get().notificationPreferences, ...preferences },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      set({
        notificationPreferences: { ...get().notificationPreferences, ...preferences },
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateSecuritySettings: async (settings: Partial<SecurityPreferencesForm>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.SECURITY,
          data: { ...get().securitySettings, ...settings },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      set({
        securitySettings: { ...get().securitySettings, ...settings },
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateSecurityPreferences: async (preferences: Partial<SecurityPreferencesForm>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.SECURITY,
          data: { ...get().securitySettings, ...preferences },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      set({
        securitySettings: { ...get().securitySettings, ...preferences },
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateDataBackupSettings: async (settings: Partial<DataBackupPreferencesForm>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.DATA,
          data: { ...get().dataBackupSettings, ...settings },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      set({
        dataBackupSettings: { ...get().dataBackupSettings, ...settings },
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // MT5 Actions
  fetchMT5Connections: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mt5_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ mt5Connections: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addMT5Connection: async (connection: MT5ConnectionForm) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mt5_connections')
        .insert({
          user_id: user.id,
          ...connection,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      set({
        mt5Connections: [...get().mt5Connections, data],
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createMT5Connection: async (connection: MT5ConnectionForm) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mt5_connections')
        .insert({
          user_id: user.id,
          ...connection,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      set({
        mt5Connections: [...get().mt5Connections, data],
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateMT5Connection: async (id: string, connection: Partial<MT5ConnectionForm>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('mt5_connections')
        .update({ ...connection, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set({
        mt5Connections: get().mt5Connections.map(conn => 
          conn.id === id ? data : conn
        ),
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteMT5Connection: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('mt5_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set({
        mt5Connections: get().mt5Connections.filter(conn => conn.id !== id),
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  testMT5Connection: async (connection: MT5ConnectionForm): Promise<MT5TestConnectionResponse> => {
    set({ isLoading: true, error: null });
    try {
      // Simulate connection test - in real app, this would connect to MT5 server
      const response = await fetch('/api/mt5/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connection)
      });
      
      const result = await response.json();
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },



  fetchActiveSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      set({ activeSessions: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  terminateSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      const currentSessions = get().activeSessions;
      const filteredSessions = currentSessions.filter(session => session.id !== sessionId);
      set({ activeSessions: filteredSessions, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  terminateAllSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      set({ activeSessions: [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  generateBackupCodes: async (): Promise<string[]> => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate 10 backup codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      // Store hashed versions in database
      const backupCodes = codes.map(code => ({
        user_id: user.id,
        code_hash: btoa(code) // In real app, use proper hashing
      }));

      const { error } = await supabase
        .from('backup_codes')
        .insert(backupCodes);

      if (error) throw error;
      
      await get().fetchBackupCodes();
      set({ isLoading: false });
      return codes;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return [];
    }
  },

  fetchBackupCodes: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('backup_codes')
        .select('*')
        .eq('user_id', user.id)
        .is('used_at', null);

      if (error) throw error;
      set({ backupCodes: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Data Actions
  requestDataExport: async (exportType: 'full' | 'trading_data' | 'account_info' | 'settings') => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('export_requests')
        .insert({
          user_id: user.id,
          export_type: exportType,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      set({
        exportRequests: [...get().exportRequests, data],
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchExportRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('export_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ exportRequests: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  downloadExport: async (exportId: string) => {
    try {
      const { data, error } = await supabase
        .from('export_requests')
        .select('file_url')
        .eq('id', exportId)
        .single();

      if (error) throw error;
      
      if (data.file_url) {
        // Create download link
        const link = document.createElement('a');
        link.href = data.file_url;
        link.download = `export-${exportId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteAccount: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      // In real app, verify password first
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id || ''
      );

      if (error) throw error;
      
      // Clear all state
      set({
        userProfile: null,
        tradingPreferences: null,
        uiCustomization: null,
        notificationPreferences: null,
        securitySettings: null,
        dataBackupSettings: null,
        mt5Connections: [],
        activeSessions: [],
        backupCodes: [],
        exportRequests: [],
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateDataBackupPreferences: async (preferences: Partial<DataBackupPreferencesForm>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.DATA_BACKUP,
          data: { ...get().dataBackupSettings, ...preferences },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      set({
        dataBackupSettings: { ...get().dataBackupSettings, ...preferences },
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Utility Actions
  clearError: () => set({ error: null }),
  
  resetSettings: () => {
    set({
      userProfile: null,
      tradingPreferences: null,
      uiCustomization: null,
      notificationPreferences: null,
      securitySettings: null,
      dataBackupSettings: null,
      mt5Connections: [],
      activeSessions: [],
      backupCodes: [],
      exportRequests: [],
      isLoading: false,
      error: null
    });
  }
}));