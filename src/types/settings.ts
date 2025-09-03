// Settings Types and Interfaces
export interface AccountSettingsForm {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  country?: string;
  timeFormat?: string;
  dateFormat?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  currency?: string;
  language?: string;
}

export interface NotificationPreferencesForm {
  emailNotifications?: boolean;
  emailEnabled?: boolean;
  pushNotifications?: boolean;
  pushEnabled?: boolean;
  smsNotifications?: boolean;
  smsEnabled?: boolean;
  soundEnabled?: boolean;
  tradingAlerts?: boolean;
  tradeExecutions?: boolean;
  priceAlerts?: boolean;
  profitLossAlerts?: boolean;
  marginCallAlerts?: boolean;
  newsUpdates?: boolean;
  newsAlerts?: boolean;
  marketAnalysis?: boolean;
  marketOpen?: boolean;
  marketClose?: boolean;
  dailySummary?: boolean;
  weeklyReports?: boolean;
  weeklyReport?: boolean;
  monthlyReports?: boolean;
  monthlyReport?: boolean;
  systemMaintenance?: boolean;
  systemAlerts?: boolean;
  securityAlerts?: boolean;
  connectionAlerts?: boolean;
  weekendNotifications?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  frequency?: string;
}

export interface DataBackupPreferencesForm {
  autoBackup?: boolean;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  retentionPeriod?: number;
  includeClosedPositions?: boolean;
  gdprCompliance?: boolean;
  cloudStorage?: boolean;
  encryptBackups?: boolean;
  includeSettings?: boolean;
  includePersonalData?: boolean;
  backupRetention?: number;
  includeTradeHistory?: boolean;
}

export interface SecurityPreferencesForm {
  twoFactorAuth?: boolean;
  twoFactorEnabled?: boolean;
  sessionTimeout?: number;
  ipWhitelist?: string[];
  loginNotifications?: boolean;
  suspiciousActivityAlerts?: boolean;
  passwordExpiry?: number;
  requireStrongPassword?: boolean;
  auditLog?: boolean;
  dataRetention?: number;
  deviceTrust?: boolean;
  privacyMode?: boolean;
}

export interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TradingPreferencesForm {
  defaultOrderType?: 'market' | 'limit' | 'stop';
  defaultLotSize?: number;
  maxLotSize?: number;
  defaultStopLoss?: number;
  defaultTakeProfit?: number;
  maxSpread?: number;
  slippage?: number;
  maxDailyLoss?: number;
  maxDailyTrades?: number;
  riskPerTrade?: number;
  autoCloseEnabled?: boolean;
  autoCloseTime?: string;
  weekendCloseEnabled?: boolean;
  trailingStopEnabled?: boolean;
  trailingStopDistance?: number;
  partialCloseEnabled?: boolean;
  partialClosePercent?: number;
  newsFilterEnabled?: boolean;
  highImpactNewsBuffer?: number;
  maxRiskPerTrade?: number;
  autoCloseOnProfit?: boolean;
  autoCloseOnLoss?: boolean;
  profitTarget?: number;
  stopLossPercentage?: number;
  trailingStop?: boolean;
  confirmOrders?: boolean;
  oneClickTrading?: boolean;
  showSpread?: boolean;
  allowHedging?: boolean;
}

export interface MT5ConnectionForm {
  name?: string;
  broker?: string;
  brokerName?: string;
  server?: string;
  login?: string;
  password?: string;
  accountType?: 'demo' | 'live';
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
  accountType?: 'demo' | 'live';
  is_default?: boolean;
  last_connected_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TradingPreferences {
  defaultOrderType?: 'market' | 'limit' | 'stop';
  defaultLotSize?: number;
  maxLotSize?: number;
  defaultStopLoss?: number;
  defaultTakeProfit?: number;
  maxSpread?: number;
  slippage?: number;
  maxDailyLoss?: number;
  maxDailyTrades?: number;
  riskPerTrade?: number;
  autoCloseEnabled?: boolean;
  autoCloseTime?: string;
  weekendCloseEnabled?: boolean;
  trailingStopEnabled?: boolean;
  trailingStopDistance?: number;
  partialCloseEnabled?: boolean;
  partialClosePercent?: number;
  newsFilterEnabled?: boolean;
  highImpactNewsBuffer?: number;
  maxRiskPerTrade?: number;
  autoCloseOnProfit?: boolean;
  autoCloseOnLoss?: boolean;
  profitTarget?: number;
  stopLossPercentage?: number;
  trailingStop?: boolean;
  confirmOrders?: boolean;
  oneClickTrading?: boolean;
  showSpread?: boolean;
  allowHedging?: boolean;
}

export interface UICustomization {
  theme: 'light' | 'dark' | 'auto' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  chartTheme?: string;
  sidebarCollapsed?: boolean;
  compactMode?: boolean;
  animations?: boolean;
  soundEnabled?: boolean;
  highContrast?: boolean;
  density?: 'compact' | 'comfortable' | 'spacious';
  sidebarPosition?: 'left' | 'right';
  currencyDisplay?: 'symbol' | 'code' | 'name';
  gridLines?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  showGridLines?: boolean;
  showSidebar?: boolean;
  showToolbar?: boolean;
  showStatusBar?: boolean;
  chartType?: string;
  defaultTimeframe?: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface UICustomizationForm {
  theme: 'light' | 'dark' | 'auto' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  chartTheme?: string;
  sidebarCollapsed?: boolean;
  compactMode?: boolean;
  animations?: boolean;
  soundEnabled?: boolean;
  highContrast?: boolean;
  density?: 'compact' | 'comfortable' | 'spacious';
  sidebarPosition?: 'left' | 'right';
  currencyDisplay?: 'symbol' | 'code' | 'name';
  gridLines?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  showGridLines?: boolean;
  showSidebar?: boolean;
  showToolbar?: boolean;
  showStatusBar?: boolean;
  chartType?: string;
  defaultTimeframe?: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface SecuritySettings {
  twoFactorEnabled?: boolean;
  loginNotifications?: boolean;
  sessionTimeout?: number;
  requirePasswordChange?: boolean;
  allowedIPs?: string[];
  deviceTrust?: boolean;
  autoLogout?: boolean;
  passwordComplexity?: 'low' | 'medium' | 'high';
}

export interface DataBackupSettings {
  autoBackup?: boolean;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  retentionPeriod?: number;
  includeClosedPositions?: boolean;
  includeTradeHistory?: boolean;
  includeSettings?: boolean;
  cloudBackup?: boolean;
  encryptBackups?: boolean;
}

// Additional interfaces for store
export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface ExportRequest {
  id: string;
  export_type: 'full' | 'trading_data' | 'account_info' | 'settings';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
}

export interface MT5TestConnectionResponse {
  success: boolean;
  message: string;
  connected?: boolean;
  serverInfo?: {
    name: string;
    version: string;
    ping: number;
  };
  error?: string;
}

export interface BackupCode {
  id: string;
  code: string;
  used: boolean;
  usedAt?: string;
}

// Additional interface for user profile
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  country?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  experience?: string;
  timeFormat?: string;
  dateFormat?: string;
}

// Store interfaces
export interface SettingsStore {
  // State
  userProfile: UserProfile | null;
  notificationPreferences: NotificationPreferences | null;
  tradingPreferences: TradingPreferences | null;
  uiCustomization: UICustomization | null;
  securitySettings: SecuritySettings | null;
  dataBackupSettings: DataBackupSettings | null;
  mt5Connections: MT5Connection[];
  activeSessions: ActiveSession[];
  exportRequests: ExportRequest[];
  backupCodes: BackupCode[];
  userSettings: any;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSettings: (category?: string) => Promise<void>;
  fetchUserSettings: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateProfile: (profile: Partial<AccountSettingsForm>) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  changePassword: (passwordData: PasswordChangeForm) => Promise<void>;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferencesForm>) => Promise<void>;
  updateSecuritySettings: (settings: Partial<SecurityPreferencesForm>) => Promise<void>;
  updateSecurityPreferences: (preferences: Partial<SecurityPreferencesForm>) => Promise<void>;
  updateTradingPreferences: (preferences: Partial<TradingPreferencesForm>) => Promise<void>;
  updateUICustomization: (customization: Partial<UICustomizationForm>) => Promise<void>;
  updateDataBackupSettings: (settings: Partial<DataBackupPreferencesForm>) => Promise<void>;
  updateDataBackupPreferences: (preferences: Partial<DataBackupPreferencesForm>) => Promise<void>;
  
  // MT5 Connection Management
  fetchMT5Connections: () => Promise<void>;
  addMT5Connection: (connection: MT5ConnectionForm) => Promise<void>;
  createMT5Connection: (connection: MT5ConnectionForm) => Promise<void>;
  updateMT5Connection: (id: string, connection: Partial<MT5ConnectionForm>) => Promise<void>;
  deleteMT5Connection: (id: string) => Promise<void>;
  testMT5Connection: (connection: MT5ConnectionForm) => Promise<MT5TestConnectionResponse>;
  
  // Security & Sessions
  fetchActiveSessions: () => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;
  generateBackupCodes: () => Promise<string[]>;
  fetchBackupCodes: () => Promise<void>;
  
  // Data Management
  requestDataExport: (type: ExportRequest['export_type']) => Promise<void>;
  fetchExportRequests: () => Promise<void>;
  downloadExport: (requestId: string) => Promise<void>;
  deleteAccount: (confirmation: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  resetSettings: () => void;
}