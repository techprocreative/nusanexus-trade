// User Settings System Types

// Database Table Types
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  timezone: string;
  language: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  category: 'trading' | 'ui' | 'notifications' | 'security' | 'data';
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MT5Connection {
  id: string;
  user_id: string;
  broker_name: string;
  server: string;
  login: string;
  encrypted_password: string;
  account_type: 'demo' | 'live';
  is_active: boolean;
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginHistory {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  device_info?: string;
  location?: string;
  login_at: string;
  success: boolean;
  failure_reason?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: string;
  ip_address: string;
  expires_at: string;
  created_at: string;
  last_activity_at: string;
}

export interface BackupCode {
  id: string;
  user_id: string;
  code_hash: string;
  used_at?: string;
  created_at: string;
}

export interface ExportRequest {
  id: string;
  user_id: string;
  export_type: 'full' | 'trades' | 'strategies' | 'settings';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  expires_at?: string;
  created_at: string;
  completed_at?: string;
}

// Settings Category Types
export interface TradingPreferences {
  defaultOrderType: 'market' | 'limit' | 'stop';
  defaultLotSize: number;
  maxLotSize: number;
  defaultStopLoss: number;
  defaultTakeProfit: number;
  maxSpread: number;
  slippage: number;
  maxDailyLoss: number;
  maxDailyTrades: number;
  riskPerTrade: number;
  autoCloseEnabled: boolean;
  autoCloseTime: string;
  weekendCloseEnabled: boolean;
  trailingStopEnabled: boolean;
  trailingStopDistance: number;
  partialCloseEnabled: boolean;
  partialClosePercent: number;
  newsFilterEnabled: boolean;
  highImpactNewsBuffer: number;
  maxRiskPerTrade: number;
  autoCloseOnProfit: boolean;
  autoCloseOnLoss: boolean;
  profitTarget: number;
  stopLossPercentage: number;
  trailingStop: boolean;
  confirmOrders: boolean;
  oneClickTrading: boolean;
  showSpread: boolean;
  allowHedging: boolean;
}

export interface UICustomization {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showGridLines: boolean;
  gridLines: boolean;
  soundEnabled: boolean;
  showSidebar: boolean;
  sidebarCollapsed: boolean;
  showToolbar: boolean;
  showStatusBar: boolean;
  chartTheme: 'light' | 'dark';
  animations: boolean;
  highContrast: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  currency: string;
  chartType: 'candlestick' | 'line' | 'bar';
  defaultTimeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  sidebarPosition: 'left' | 'right';
  language: string;
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currencyDisplay: 'symbol' | 'code';
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  tradeAlerts: boolean;
  priceAlerts: boolean;
  newsAlerts: boolean;
  systemAlerts: boolean;
  marketOpenClose: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  alertFrequency: 'immediate' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  deviceTrust: boolean;
  passwordExpiry: number;
  loginAttempts: number;
  accountLockout: boolean;
  dataEncryption: boolean;
  auditLog: boolean;
}

export interface DataBackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetention: number;
  includeStrategies: boolean;
  includeTrades: boolean;
  includeSettings: boolean;
  cloudStorage: boolean;
  encryptBackups: boolean;
  gdprCompliance: boolean;
  dataRetention: number;
}

// Form Types
export interface AccountSettingsForm {
  fullName: string;
  email: string;
  phone?: string;
  timezone: string;
  language: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  twoFactorEnabled: boolean;
}

export interface MT5ConnectionForm {
  brokerName: string;
  server: string;
  login: string;
  password: string;
  accountType: 'demo' | 'live';
}

export interface TradingPreferencesForm extends TradingPreferences {}
export interface UICustomizationForm extends UICustomization {}
export interface NotificationPreferencesForm extends NotificationPreferences {}
export interface SecuritySettingsForm extends SecuritySettings {}
export interface DataBackupSettingsForm extends DataBackupSettings {}

// Validation Schemas
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// API Response Types
export interface SettingsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MT5TestConnectionResponse {
  success: boolean;
  connected: boolean;
  serverInfo?: {
    name: string;
    version: string;
    ping: number;
  };
  error?: string;
}

export interface ExportDataResponse {
  success: boolean;
  exportId: string;
  estimatedTime: number;
  message?: string;
}

// Store State Types
export interface SettingsState {
  userProfile: UserProfile | null;
  tradingPreferences: TradingPreferences | null;
  uiCustomization: UICustomization | null;
  notificationPreferences: NotificationPreferences | null;
  securitySettings: SecuritySettings | null;
  dataBackupSettings: DataBackupSettings | null;
  mt5Connections: MT5Connection[];
  loginHistory: LoginHistory[];
  activeSessions: UserSession[];
  backupCodes: BackupCode[];
  exportRequests: ExportRequest[];
  isLoading: boolean;
  error: string | null;
}

// Action Types
export interface SettingsActions {
  // Profile actions
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Settings actions
  fetchSettings: (category?: string) => Promise<void>;
  updateTradingPreferences: (preferences: Partial<TradingPreferences>) => Promise<void>;
  updateUICustomization: (customization: Partial<UICustomization>) => Promise<void>;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  updateDataBackupSettings: (settings: Partial<DataBackupSettings>) => Promise<void>;
  
  // MT5 actions
  fetchMT5Connections: () => Promise<void>;
  addMT5Connection: (connection: MT5ConnectionForm) => Promise<void>;
  updateMT5Connection: (id: string, connection: Partial<MT5ConnectionForm>) => Promise<void>;
  deleteMT5Connection: (id: string) => Promise<void>;
  testMT5Connection: (connection: MT5ConnectionForm) => Promise<MT5TestConnectionResponse>;
  
  // Security actions
  fetchLoginHistory: () => Promise<void>;
  fetchActiveSessions: () => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;
  generateBackupCodes: () => Promise<string[]>;
  fetchBackupCodes: () => Promise<void>;
  
  // Data actions
  requestDataExport: (exportType: ExportRequest['export_type']) => Promise<ExportDataResponse>;
  fetchExportRequests: () => Promise<void>;
  downloadExport: (exportId: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  resetSettings: () => void;
}

// Component Props Types
export interface SettingsPageProps {
  className?: string;
}

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export interface SettingsFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

// Navigation Types
export interface SettingsNavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  description?: string;
}

export interface SettingsNavigation {
  sections: SettingsNavItem[];
  activeSection: string;
}

// Constants
export const SETTINGS_CATEGORIES = {
  TRADING: 'trading',
  UI: 'ui',
  NOTIFICATIONS: 'notifications',
  SECURITY: 'security',
  DATA: 'data'
} as const;

export const ACCOUNT_TYPES = {
  DEMO: 'demo',
  LIVE: 'live'
} as const;

export const EXPORT_TYPES = {
  FULL: 'full',
  TRADES: 'trades',
  STRATEGIES: 'strategies',
  SETTINGS: 'settings'
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

export const LANGUAGES = {
  EN: 'en',
  ID: 'id',
  ZH: 'zh',
  JA: 'ja'
} as const;

export const TIMEZONES = {
  UTC: 'UTC',
  JAKARTA: 'Asia/Jakarta',
  SINGAPORE: 'Asia/Singapore',
  TOKYO: 'Asia/Tokyo',
  LONDON: 'Europe/London',
  NEW_YORK: 'America/New_York'
} as const;