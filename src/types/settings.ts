// Settings Types and Interfaces
export interface AccountSettingsForm {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  country?: string;
  timeFormat?: string;
  dateFormat?: string;
}

export interface NotificationPreferencesForm {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  soundEnabled?: boolean;
  tradeExecutions?: boolean;
  marketOpen?: boolean;
  marketClose?: boolean;
  dailySummary?: boolean;
  weeklyReport?: boolean;
  weeklyReports?: boolean;
  monthlyReport?: boolean;
  monthlyReports?: boolean;
  profitLossAlerts?: boolean;
  marginCallAlerts?: boolean;
  connectionAlerts?: boolean;
  frequency?: string;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHours?: {
    start?: string;
    end?: string;
  };
  weekendNotifications?: boolean;
}

export interface DataBackupPreferencesForm {
  autoBackup?: boolean;
  backupFrequency?: string;
  retentionPeriod?: number;
  includeClosedPositions?: boolean;
}

export interface SecurityPreferencesForm {
  twoFactorEnabled?: boolean;
  loginNotifications?: boolean;
  sessionTimeout?: number;
  requirePasswordChange?: boolean;
}

export interface MT5ConnectionForm {
  name?: string;
  broker?: string;
  server?: string;
  login?: string;
  password?: string;
  isDefault?: boolean;
  is_default?: boolean;
}

export interface NotificationPreferences {
  email_enabled?: boolean;
  push_enabled?: boolean;
  sms_enabled?: boolean;
  sound_enabled?: boolean;
  trade_executions?: boolean;
  market_open?: boolean;
  market_close?: boolean;
  daily_summary?: boolean;
  weekly_reports?: boolean;
  monthly_reports?: boolean;
  profit_loss_alerts?: boolean;
  margin_call_alerts?: boolean;
  connection_alerts?: boolean;
  frequency?: string;
  quiet_hours?: {
    start?: string;
    end?: string;
  };
  weekend_notifications?: boolean;
}

export interface MT5Connection {
  id?: string;
  name?: string;
  broker?: string;
  server?: string;
  login?: string;
  password_hidden?: string;
  status?: string;
  is_default?: boolean;
  last_connected_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Store interfaces
export interface SettingsStore {
  userSettings: any;
  fetchUserSettings: () => void;
  updateUserSettings: (settings: any) => void;

  // Account settings
  accountForm: AccountSettingsForm;
  updateAccountSettings: (data: AccountSettingsForm) => void;

  // Notification settings
  notificationForm: NotificationPreferencesForm;
  notificationSettings: NotificationPreferences;
  updateNotificationSettings: (data: Partial<NotificationPreferencesForm>) => void;

  // Data backup
  dataBackupForm: DataBackupPreferencesForm;
  updateDataBackupPreferences: (data: DataBackupPreferencesForm) => void;

  // Security
  securityForm: SecurityPreferencesForm;
  updateSecurityPreferences: (data: SecurityPreferencesForm) => void;

  // MT5 connections
  mt5Connections: MT5Connection[];
  mt5Form: MT5ConnectionForm;
  createMT5Connection: (data: any) => void;
  updateMT5Connection: (id: string, data: any) => void;
  deleteMT5Connection: (id: string) => void;
  testMT5Connection: (id: string) => void;

  // UI Customization
  uiSettings: any;
  updateUISettings: (settings: any) => void;

  // Trading Preferences
  tradingPreferences: any;
  updateTradingPreferences: (preferences: any) => void;

  // Mobile settings
  mobileSettings: any;
  updateMobileSettings: (settings: any) => void;

  // UICustomization
  uiCustomization: any;
  updateUICustomization: (customization: any) => void;
}