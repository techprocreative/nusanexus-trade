import React, { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  DollarSign,
  Smartphone,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  Camera,
  AlertCircle
} from 'lucide-react';
import { useAppStore, useUIStore } from '../store';
import { cn } from '../utils/cn';

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, icon, children }) => {
  return (
    <div className="bg-background-secondary rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary transition-colors',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

interface ToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-gray-600'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
};

export const Settings: React.FC = () => {
  const { user } = useAppStore();
  const { theme, setTheme } = useUIStore();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    country: 'United States',
    timezone: 'UTC-5',
    language: 'English'
  });

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    tradeAlerts: true,
    priceAlerts: true,
    newsAlerts: false,
    weeklyReports: true
  });

  // Trading preferences
  const [tradingPrefs, setTradingPrefs] = useState({
    defaultLotSize: '0.1',
    maxRisk: '2',
    autoClose: false,
    confirmTrades: true,
    showPnL: true,
    currency: 'USD'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveMessage('Profile updated successfully!');
    setIsSaving(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSaveSecurity = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setSaveMessage('Passwords do not match!');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveMessage('Security settings updated successfully!');
    setIsSaving(false);
    setSecurityData({ ...securityData, currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account preferences and trading settings.</p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={cn(
          'flex items-center space-x-2 p-4 rounded-lg',
          saveMessage.includes('successfully') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        )}>
          <AlertCircle className="h-4 w-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <SettingsSection
          title="Profile Information"
          description="Update your personal information and contact details"
          icon={<User className="h-6 w-6 text-blue-400" />}
        >
          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <button className="absolute -bottom-1 -right-1 p-1 bg-primary rounded-full text-white hover:bg-primary-dark transition-colors">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Profile Picture</p>
                <p className="text-xs text-gray-400">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="First Name"
                value={profileData.firstName}
                onChange={(value) => setProfileData({ ...profileData, firstName: value })}
                required
              />
              <FormField
                label="Last Name"
                value={profileData.lastName}
                onChange={(value) => setProfileData({ ...profileData, lastName: value })}
                required
              />
            </div>

            <FormField
              label="Email Address"
              type="email"
              value={profileData.email}
              onChange={(value) => setProfileData({ ...profileData, email: value })}
              required
            />

            <FormField
              label="Phone Number"
              type="tel"
              value={profileData.phone}
              onChange={(value) => setProfileData({ ...profileData, phone: value })}
              placeholder="+1 (555) 123-4567"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
                <select
                  value={profileData.country}
                  onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Timezone</label>
                <select
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="UTC-8">Pacific Time (UTC-8)</option>
                  <option value="UTC-7">Mountain Time (UTC-7)</option>
                  <option value="UTC-6">Central Time (UTC-6)</option>
                  <option value="UTC-5">Eastern Time (UTC-5)</option>
                  <option value="UTC+0">GMT (UTC+0)</option>
                  <option value="UTC+1">Central European Time (UTC+1)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-primary hover:bg-primary-dark disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection
          title="Security & Privacy"
          description="Manage your password and security preferences"
          icon={<Shield className="h-6 w-6 text-green-400" />}
        >
          <div className="space-y-4">
            <FormField
              label="Current Password"
              type="password"
              value={securityData.currentPassword}
              onChange={(value) => setSecurityData({ ...securityData, currentPassword: value })}
              placeholder="Enter current password"
            />

            <FormField
              label="New Password"
              type="password"
              value={securityData.newPassword}
              onChange={(value) => setSecurityData({ ...securityData, newPassword: value })}
              placeholder="Enter new password"
            />

            <FormField
              label="Confirm New Password"
              type="password"
              value={securityData.confirmPassword}
              onChange={(value) => setSecurityData({ ...securityData, confirmPassword: value })}
              placeholder="Confirm new password"
            />

            <ToggleField
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              checked={securityData.twoFactorEnabled}
              onChange={(checked) => setSecurityData({ ...securityData, twoFactorEnabled: checked })}
            />

            <button
              onClick={handleSaveSecurity}
              disabled={isSaving}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-primary hover:bg-primary-dark disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
            >
              <Lock className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Update Security'}</span>
            </button>
          </div>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection
          title="Notifications"
          description="Configure how you receive alerts and updates"
          icon={<Bell className="h-6 w-6 text-yellow-400" />}
        >
          <div className="space-y-4">
            <ToggleField
              label="Email Alerts"
              description="Receive important notifications via email"
              checked={notifications.emailAlerts}
              onChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
            />

            <ToggleField
              label="Push Notifications"
              description="Get real-time notifications on your device"
              checked={notifications.pushNotifications}
              onChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
            />

            <ToggleField
              label="Trade Alerts"
              description="Notifications for trade executions and updates"
              checked={notifications.tradeAlerts}
              onChange={(checked) => setNotifications({ ...notifications, tradeAlerts: checked })}
            />

            <ToggleField
              label="Price Alerts"
              description="Alerts when prices reach your target levels"
              checked={notifications.priceAlerts}
              onChange={(checked) => setNotifications({ ...notifications, priceAlerts: checked })}
            />

            <ToggleField
              label="News Alerts"
              description="Market news and economic calendar events"
              checked={notifications.newsAlerts}
              onChange={(checked) => setNotifications({ ...notifications, newsAlerts: checked })}
            />

            <ToggleField
              label="Weekly Reports"
              description="Weekly performance and market summary"
              checked={notifications.weeklyReports}
              onChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
            />
          </div>
        </SettingsSection>

        {/* Trading Preferences */}
        <SettingsSection
          title="Trading Preferences"
          description="Configure your default trading settings"
          icon={<DollarSign className="h-6 w-6 text-purple-400" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Default Lot Size"
                value={tradingPrefs.defaultLotSize}
                onChange={(value) => setTradingPrefs({ ...tradingPrefs, defaultLotSize: value })}
                placeholder="0.1"
              />
              <FormField
                label="Max Risk (%)"
                value={tradingPrefs.maxRisk}
                onChange={(value) => setTradingPrefs({ ...tradingPrefs, maxRisk: value })}
                placeholder="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Base Currency</label>
              <select
                value={tradingPrefs.currency}
                onChange={(e) => setTradingPrefs({ ...tradingPrefs, currency: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
                <option value="CHF">Swiss Franc (CHF)</option>
              </select>
            </div>

            <ToggleField
              label="Auto-close at market close"
              description="Automatically close positions before market close"
              checked={tradingPrefs.autoClose}
              onChange={(checked) => setTradingPrefs({ ...tradingPrefs, autoClose: checked })}
            />

            <ToggleField
              label="Confirm trades"
              description="Show confirmation dialog before executing trades"
              checked={tradingPrefs.confirmTrades}
              onChange={(checked) => setTradingPrefs({ ...tradingPrefs, confirmTrades: checked })}
            />

            <ToggleField
              label="Show P&L in real-time"
              description="Display profit/loss updates in real-time"
              checked={tradingPrefs.showPnL}
              onChange={(checked) => setTradingPrefs({ ...tradingPrefs, showPnL: checked })}
            />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};