import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  SettingsState,
  SettingsActions,
  UserProfile,
  TradingPreferences,
  UICustomization,
  NotificationPreferences,
  SecuritySettings,
  DataBackupSettings,
  MT5Connection,
  MT5ConnectionForm,
  LoginHistory,
  UserSession,
  BackupCode,
  ExportRequest,
  MT5TestConnectionResponse,
  ExportDataResponse,
  SETTINGS_CATEGORIES
} from '../types/settings';

interface SettingsStore extends SettingsState, SettingsActions {}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial State
  userProfile: null,
  tradingPreferences: null,
  uiCustomization: null,
  notificationPreferences: null,
  securitySettings: null,
  dataBackupSettings: null,
  mt5Connections: [],
  loginHistory: [],
  activeSessions: [],
  backupCodes: [],
  exportRequests: [],
  isLoading: false,
  error: null,

  // Profile Actions
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

  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Settings Actions
  fetchSettings: async (category?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
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
        maxRiskPerTrade: 2,
        maxDailyLoss: 5,
        autoCloseOnProfit: false,
        autoCLoseOnLoss: true,
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

  updateUICustomization: async (customization: Partial<UICustomization>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentCustomization = get().uiCustomization || {
        theme: 'system' as const,
        primaryColor: '#3b82f6',
        accentColor: '#10b981',
        fontSize: 'medium' as const,
        compactMode: false,
        showGridLines: true,
        chartType: 'candlestick' as const,
        defaultTimeframe: '1h' as const,
        sidebarPosition: 'left' as const,
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY' as const,
        timeFormat: '24h' as const,
        currencyDisplay: 'symbol' as const
      };
      const updatedCustomization = { ...currentCustomization, ...customization };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.UI,
          data: updatedCustomization,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      set({ uiCustomization: updatedCustomization, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateNotificationPreferences: async (preferences: Partial<NotificationPreferences>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentPreferences = get().notificationPreferences || {
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        tradeAlerts: true,
        priceAlerts: false,
        newsAlerts: false,
        systemAlerts: true,
        marketOpenClose: false,
        weeklyReports: true,
        monthlyReports: false,
        alertFrequency: 'immediate' as const,
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00'
        }
      };
      const updatedPreferences = { ...currentPreferences, ...preferences };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.NOTIFICATIONS,
          data: updatedPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      set({ notificationPreferences: updatedPreferences, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateSecuritySettings: async (settings: Partial<SecuritySettings>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentSettings = get().securitySettings || {
        twoFactorEnabled: false,
        loginNotifications: true,
        sessionTimeout: 30,
        ipWhitelist: [],
        deviceTrust: false,
        passwordExpiry: 90,
        loginAttempts: 5,
        accountLockout: true,
        dataEncryption: true,
        auditLog: true
      };
      const updatedSettings = { ...currentSettings, ...settings };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.SECURITY,
          data: updatedSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      set({ securitySettings: updatedSettings, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateDataBackupSettings: async (settings: Partial<DataBackupSettings>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentSettings = get().dataBackupSettings || {
        autoBackup: true,
        backupFrequency: 'weekly' as const,
        backupRetention: 30,
        includeStrategies: true,
        includeTrades: true,
        includeSettings: true,
        cloudStorage: false,
        encryptBackups: true,
        gdprCompliance: true,
        dataRetention: 365
      };
      const updatedSettings = { ...currentSettings, ...settings };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          category: SETTINGS_CATEGORIES.DATA,
          data: updatedSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      set({ dataBackupSettings: updatedSettings, isLoading: false });
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
          broker_name: connection.brokerName,
          server: connection.server,
          login: connection.login,
          encrypted_password: connection.password, // In real app, encrypt this
          account_type: connection.accountType,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      const currentConnections = get().mt5Connections;
      set({ mt5Connections: [data, ...currentConnections], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateMT5Connection: async (id: string, connection: Partial<MT5ConnectionForm>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('mt5_connections')
        .update({
          broker_name: connection.brokerName,
          server: connection.server,
          login: connection.login,
          encrypted_password: connection.password,
          account_type: connection.accountType,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const currentConnections = get().mt5Connections;
      const updatedConnections = currentConnections.map(conn => 
        conn.id === id ? data : conn
      );
      set({ mt5Connections: updatedConnections, isLoading: false });
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
      
      const currentConnections = get().mt5Connections;
      const filteredConnections = currentConnections.filter(conn => conn.id !== id);
      set({ mt5Connections: filteredConnections, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  testMT5Connection: async (connection: MT5ConnectionForm): Promise<MT5TestConnectionResponse> => {
    try {
      // Mock MT5 connection test - in real app, this would connect to MT5 API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate connection test
      const isValid = connection.login && connection.password && connection.server;
      
      if (isValid) {
        return {
          success: true,
          connected: true,
          serverInfo: {
            name: connection.server,
            version: '5.0.3645',
            ping: Math.floor(Math.random() * 100) + 20
          }
        };
      } else {
        return {
          success: false,
          connected: false,
          error: 'Invalid credentials or server information'
        };
      }
    } catch (error) {
      return {
        success: false,
        connected: false,
        error: (error as Error).message
      };
    }
  },

  // Security Actions
  fetchLoginHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('login_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      set({ loginHistory: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
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
  requestDataExport: async (exportType: ExportRequest['export_type']): Promise<ExportDataResponse> => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('export_requests')
        .insert({
          user_id: user.id,
          export_type: exportType,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      const currentRequests = get().exportRequests;
      set({ 
        exportRequests: [data, ...currentRequests], 
        isLoading: false 
      });
      
      return {
        success: true,
        exportId: data.id,
        estimatedTime: 300, // 5 minutes
        message: 'Export request submitted successfully'
      };
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return {
        success: false,
        exportId: '',
        estimatedTime: 0,
        message: (error as Error).message
      };
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
        loginHistory: [],
        activeSessions: [],
        backupCodes: [],
        exportRequests: [],
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Utility Actions
  clearError: () => set({ error: null }),
  
  resetSettings: () => set({
    userProfile: null,
    tradingPreferences: null,
    uiCustomization: null,
    notificationPreferences: null,
    securitySettings: null,
    dataBackupSettings: null,
    mt5Connections: [],
    loginHistory: [],
    activeSessions: [],
    backupCodes: [],
    exportRequests: [],
    isLoading: false,
    error: null
  })
}));