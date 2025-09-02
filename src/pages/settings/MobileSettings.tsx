import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Vibrate,
  Battery,
  Wifi,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Fingerprint,
  Shield,
  Bell,
  Download,
  Trash2,
  RefreshCw,
  Settings as SettingsIcon,
  ChevronRight,
  Info
} from 'lucide-react';
import HapticFeedbackDemo from '../../components/mobile/HapticFeedbackDemo';
import { 
  isHapticEnabled, 
  setHapticEnabled,
  NavigationHaptics 
} from '../../utils/hapticFeedback';

interface MobileSettingsProps {
  className?: string;
}

const MobileSettings: React.FC<MobileSettingsProps> = ({ className = '' }) => {
  const [settings, setSettings] = useState({
    hapticFeedback: isHapticEnabled(),
    darkMode: localStorage.getItem('theme') === 'dark',
    pushNotifications: Notification.permission === 'granted',
    biometricAuth: false,
    batteryOptimization: true,
    offlineMode: true,
    autoSync: true,
    dataCompression: true
  });

  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    cacheSize: 0
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    // Get storage information
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        setStorageInfo({
          used: estimate.usage || 0,
          total: estimate.quota || 0,
          cacheSize: estimate.usage ? Math.floor(estimate.usage * 0.3) : 0
        });
      });
    }

    // Check biometric availability
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      setSettings(prev => ({ ...prev, biometricAuth: true }));
    }
  }, []);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Handle specific setting changes
    switch (key) {
      case 'hapticFeedback':
        setHapticEnabled(value);
        if (value) NavigationHaptics.tap();
        break;
      case 'darkMode':
        localStorage.setItem('theme', value ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', value);
        break;
      case 'pushNotifications':
        if (value && Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
        break;
    }
  };

  const handleClearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear localStorage except essential settings
      const essentialKeys = ['theme', 'haptic-enabled', 'haptic-intensity'];
      const keysToRemove = Object.keys(localStorage).filter(
        key => !essentialKeys.includes(key)
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      NavigationHaptics.success();
      alert('Cache cleared successfully!');
    } catch (error) {
      NavigationHaptics.error();
      alert('Failed to clear cache');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const SettingToggle: React.FC<{
    label: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ label, description, icon, enabled, onChange, disabled = false }) => (
    <motion.div
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`flex items-center justify-between p-4 bg-gray-800 rounded-lg ${
        disabled ? 'opacity-50' : 'cursor-pointer'
      }`}
      onClick={() => !disabled && onChange(!enabled)}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-700 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-white">{label}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <motion.div
        animate={{ backgroundColor: enabled ? '#10b981' : '#6b7280' }}
        className="relative w-12 h-6 rounded-full"
      >
        <motion.div
          animate={{ x: enabled ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full"
        />
      </motion.div>
    </motion.div>
  );

  const SettingButton: React.FC<{
    label: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }> = ({ label, description, icon, onClick, variant = 'default' }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-lg w-full text-left ${
        variant === 'danger'
          ? 'bg-red-900/20 hover:bg-red-900/30'
          : 'bg-gray-800 hover:bg-gray-700'
      } transition-colors`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          variant === 'danger' ? 'bg-red-500/20' : 'bg-gray-700'
        }`}>
          {icon}
        </div>
        <div>
          <h3 className={`font-medium ${
            variant === 'danger' ? 'text-red-400' : 'text-white'
          }`}>{label}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </motion.button>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Smartphone className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mobile Settings</h1>
            <p className="text-gray-400">Optimize your mobile trading experience</p>
          </div>
        </div>
        
        {/* Device Info */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Battery className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Battery</span>
            </div>
            <p className="text-xs text-gray-400">Optimization enabled</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Wifi className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Network</span>
            </div>
            <p className="text-xs text-gray-400">
              {navigator.onLine ? 'Connected' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Core Settings */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Core Settings</h2>
        <div className="space-y-3">
          <SettingToggle
            label="Dark Mode"
            description="Use dark theme for better battery life"
            icon={settings.darkMode ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            enabled={settings.darkMode}
            onChange={(enabled) => handleSettingChange('darkMode', enabled)}
          />
          
          <SettingToggle
            label="Push Notifications"
            description="Receive alerts for price changes and orders"
            icon={<Bell className="w-5 h-5 text-purple-400" />}
            enabled={settings.pushNotifications}
            onChange={(enabled) => handleSettingChange('pushNotifications', enabled)}
          />
          
          <SettingToggle
            label="Biometric Authentication"
            description="Use fingerprint or face unlock"
            icon={<Fingerprint className="w-5 h-5 text-green-400" />}
            enabled={settings.biometricAuth}
            onChange={(enabled) => handleSettingChange('biometricAuth', enabled)}
          />
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Performance</h2>
        <div className="space-y-3">
          <SettingToggle
            label="Battery Optimization"
            description="Reduce background activity to save battery"
            icon={<Battery className="w-5 h-5 text-green-400" />}
            enabled={settings.batteryOptimization}
            onChange={(enabled) => handleSettingChange('batteryOptimization', enabled)}
          />
          
          <SettingToggle
            label="Offline Mode"
            description="Cache data for offline access"
            icon={<Download className="w-5 h-5 text-blue-400" />}
            enabled={settings.offlineMode}
            onChange={(enabled) => handleSettingChange('offlineMode', enabled)}
          />
          
          <SettingToggle
            label="Auto Sync"
            description="Automatically sync data when online"
            icon={<RefreshCw className="w-5 h-5 text-purple-400" />}
            enabled={settings.autoSync}
            onChange={(enabled) => handleSettingChange('autoSync', enabled)}
          />
          
          <SettingToggle
            label="Data Compression"
            description="Compress data to reduce bandwidth usage"
            icon={<Wifi className="w-5 h-5 text-blue-400" />}
            enabled={settings.dataCompression}
            onChange={(enabled) => handleSettingChange('dataCompression', enabled)}
          />
        </div>
      </div>

      {/* Haptic Feedback Section */}
      <HapticFeedbackDemo />

      {/* Storage Management */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Storage Management</h2>
        
        {/* Storage Usage */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Storage Usage</span>
            <span className="text-sm text-gray-400">
              {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${storageInfo.total > 0 ? (storageInfo.used / storageInfo.total) * 100 : 0}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Cache: {formatBytes(storageInfo.cacheSize)}</span>
            <span>Available: {formatBytes(storageInfo.total - storageInfo.used)}</span>
          </div>
        </div>
        
        {/* Storage Actions */}
        <div className="space-y-3">
          <SettingButton
            label="Clear Cache"
            description="Free up space by clearing cached data"
            icon={<Trash2 className="w-5 h-5 text-orange-400" />}
            onClick={handleClearCache}
            variant="danger"
          />
        </div>
      </div>

      {/* App Information */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">App Information</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-blue-400" />
              <span className="text-white">Version</span>
            </div>
            <span className="text-gray-400">1.0.0</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-white">Security Level</span>
            </div>
            <span className="text-green-400">High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSettings;