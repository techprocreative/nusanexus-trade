import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Lock,
  Unlock,
  Globe,
  UserX,
  Save,
  RotateCcw,
  RefreshCw,
  Bell
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SecurityPreferencesForm } from '../../types/settings';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';

interface LoginSession {
  id: string;
  device_info: string;
  ip_address: string;
  location: string;
  last_activity: string;
  is_current: boolean;
  created_at: string;
}

interface LoginHistoryEntry {
  id: string;
  ip_address: string;
  location: string;
  device_info: string;
  success: boolean;
  created_at: string;
}

const SecuritySettings: React.FC = () => {
  const {
    userSettings,
    isLoading,
    error,
    fetchUserSettings,
    updateSecurityPreferences,
    clearError
  } = useSettingsStore();

  const [securityForm, setSecurityForm] = useState<SecurityPreferencesForm>({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
    ipWhitelist: [],
    deviceTrust: true,
    privacyMode: false,
    dataRetention: 90,
    auditLog: true
  });

  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [showSessions, setShowSessions] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');

  const sessionTimeoutOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours' },
    { value: 1440, label: '24 hours' },
    { value: 0, label: 'Never' }
  ];

  const dataRetentionOptions = [
    { value: 30, label: '30 days' },
    { value: 60, label: '60 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '6 months' },
    { value: 365, label: '1 year' },
    { value: 730, label: '2 years' },
    { value: 0, label: 'Forever' }
  ];

  useEffect(() => {
    fetchUserSettings();
    loadLoginSessions();
    loadLoginHistory();
  }, [fetchUserSettings]);

  useEffect(() => {
    if (userSettings?.security_preferences) {
      const security = userSettings.security_preferences;
      setSecurityForm({
        twoFactorEnabled: security.two_factor_enabled || false,
        loginNotifications: security.login_notifications !== false,
        sessionTimeout: security.session_timeout || 30,
        ipWhitelist: security.ip_whitelist || [],
        deviceTrust: security.device_trust !== false,
        privacyMode: security.privacy_mode || false,
        dataRetention: security.data_retention || 90,
        auditLog: security.audit_log !== false
      });
    }
  }, [userSettings]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const loadLoginSessions = async () => {
    // Mock data - in real app, fetch from API
    const mockSessions: LoginSession[] = [
      {
        id: '1',
        device_info: 'Chrome on Windows 11',
        ip_address: '192.168.1.100',
        location: 'New York, US',
        last_activity: new Date().toISOString(),
        is_current: true,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '2',
        device_info: 'Safari on iPhone 15',
        ip_address: '192.168.1.101',
        location: 'New York, US',
        last_activity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        is_current: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      },
      {
        id: '3',
        device_info: 'Firefox on Ubuntu',
        ip_address: '203.0.113.45',
        location: 'London, UK',
        last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        is_current: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
      }
    ];
    setLoginSessions(mockSessions);
  };

  const loadLoginHistory = async () => {
    // Mock data - in real app, fetch from API
    const mockHistory: LoginHistoryEntry[] = [
      {
        id: '1',
        ip_address: '192.168.1.100',
        location: 'New York, US',
        device_info: 'Chrome on Windows 11',
        success: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        ip_address: '203.0.113.45',
        location: 'London, UK',
        device_info: 'Firefox on Ubuntu',
        success: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '3',
        ip_address: '192.168.1.101',
        location: 'New York, US',
        device_info: 'Safari on iPhone 15',
        success: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ];
    setLoginHistory(mockHistory);
  };

  const handleFormChange = (field: keyof SecurityPreferencesForm, value: any) => {
    setSecurityForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSecurityPreferences({
        two_factor_enabled: securityForm.twoFactorEnabled,
        login_notifications: securityForm.loginNotifications,
        session_timeout: securityForm.sessionTimeout,
        ip_whitelist: securityForm.ipWhitelist,
        device_trust: securityForm.deviceTrust,
        privacy_mode: securityForm.privacyMode,
        data_retention: securityForm.dataRetention,
        audit_log: securityForm.auditLog
      });
      toast.success('Security preferences updated successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update security preferences');
    }
  };

  const handleReset = () => {
    if (userSettings?.security_preferences) {
      const security = userSettings.security_preferences;
      setSecurityForm({
        twoFactorEnabled: security.two_factor_enabled || false,
        loginNotifications: security.login_notifications !== false,
        sessionTimeout: security.session_timeout || 30,
        ipWhitelist: security.ip_whitelist || [],
        deviceTrust: security.device_trust !== false,
        privacyMode: security.privacy_mode || false,
        dataRetention: security.data_retention || 90,
        auditLog: security.audit_log !== false
      });
    }
    setHasChanges(false);
  };

  const terminateSession = async (sessionId: string) => {
    try {
      // In real app, call API to terminate session
      setLoginSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Session terminated successfully');
    } catch (error) {
      toast.error('Failed to terminate session');
    }
  };

  const terminateAllSessions = async () => {
    try {
      // In real app, call API to terminate all sessions except current
      setLoginSessions(prev => prev.filter(session => session.is_current));
      toast.success('All other sessions terminated successfully');
    } catch (error) {
      toast.error('Failed to terminate sessions');
    }
  };

  const addIpToWhitelist = () => {
    if (newIpAddress && !securityForm.ipWhitelist.includes(newIpAddress)) {
      handleFormChange('ipWhitelist', [...securityForm.ipWhitelist, newIpAddress]);
      setNewIpAddress('');
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    handleFormChange('ipWhitelist', securityForm.ipWhitelist.filter(item => item !== ip));
  };

  const downloadSecurityReport = () => {
    // Mock download - in real app, generate and download actual report
    const report = {
      generated_at: new Date().toISOString(),
      login_sessions: loginSessions,
      login_history: loginHistory,
      security_settings: securityForm
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Security report downloaded successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceIcon = (deviceInfo: string) => {
    if (deviceInfo.toLowerCase().includes('iphone') || deviceInfo.toLowerCase().includes('android')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Authentication & Access */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Authentication &amp; Access
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('twoFactorEnabled', !securityForm.twoFactorEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  securityForm.twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  securityForm.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Login Notifications
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified of new login attempts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('loginNotifications', !securityForm.loginNotifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  securityForm.loginNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  securityForm.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-purple-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Device Trust
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Remember trusted devices for easier access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('deviceTrust', !securityForm.deviceTrust)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  securityForm.deviceTrust ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  securityForm.deviceTrust ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Timeout
              </label>
              <select
                value={securityForm.sessionTimeout}
                onChange={(e) => handleFormChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {sessionTimeoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Automatically log out after period of inactivity
              </p>
            </div>
          </div>
        </div>

        {/* IP Whitelist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                IP Address Whitelist
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Only allow access from specific IP addresses. Leave empty to allow access from any IP.
            </p>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                placeholder="Enter IP address (e.g., 192.168.1.100)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addIpToWhitelist}
                disabled={!newIpAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
            
            {securityForm.ipWhitelist.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Whitelisted IP Addresses:
                </h4>
                <div className="space-y-2">
                  {securityForm.ipWhitelist.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-900 dark:text-white font-mono">{ip}</span>
                      <button
                        type="button"
                        onClick={() => removeIpFromWhitelist(ip)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Privacy &amp; Data
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <EyeOff className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Privacy Mode
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hide sensitive information in screenshots and recordings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('privacyMode', !securityForm.privacyMode)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  securityForm.privacyMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  securityForm.privacyMode ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Audit Logging
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keep detailed logs of account activities
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('auditLog', !securityForm.auditLog)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  securityForm.auditLog ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  securityForm.auditLog ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Retention Period
              </label>
              <select
                value={securityForm.dataRetention}
                onChange={(e) => handleFormChange('dataRetention', parseInt(e.target.value))}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {dataRetentionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                How long to keep login history and audit logs
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Changes</span>
          </button>
          
          <button
            type="submit"
            disabled={!hasChanges || isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Security Settings'}</span>
          </button>
        </div>
      </form>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Sessions
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadLoginSessions()}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={terminateAllSessions}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <UserX className="w-4 h-4" />
                <span>Terminate All Others</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {loginSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(session.device_info)}
                    {session.is_current && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Current
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.device_info}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{session.ip_address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Last active: {formatDate(session.last_activity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!session.is_current && (
                  <button
                    onClick={() => terminateSession(session.id)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Terminate</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Login History
              </h3>
            </div>
            <button
              onClick={downloadSecurityReport}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {loginHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {entry.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    {getDeviceIcon(entry.device_info)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.success ? 'Successful Login' : 'Failed Login Attempt'}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{entry.device_info}</span>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{entry.ip_address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{entry.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(entry.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;