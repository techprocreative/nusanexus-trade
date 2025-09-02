import React, { useState, useEffect } from 'react';
import {
  Palette,
  Monitor,
  Globe,
  Layout,
  Eye,
  Save,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  Grid,
  Sidebar,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { UICustomizationForm } from '../../types/settings';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';

const UICustomization: React.FC = () => {
  const {
    userSettings,
    isLoading,
    error,
    fetchUserSettings,
    updateUICustomization,
    clearError
  } = useSettingsStore();

  const [uiForm, setUIForm] = useState<UICustomizationForm>({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '24h',
    currency: 'USD',
    compactMode: false,
    showSidebar: true,
    sidebarCollapsed: false,
    showToolbar: true,
    showStatusBar: true,
    chartTheme: 'dark',
    gridLines: true,
    animations: true,
    soundEnabled: true,
    highContrast: false,
    fontSize: 'medium',
    density: 'comfortable'
  });

  const [hasChanges, setHasChanges] = useState(false);

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ru', label: 'Русский' },
    { value: 'zh', label: '中文' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' }
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CHF', label: 'Swiss Franc (CHF)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'NZD', label: 'New Zealand Dollar (NZ$)' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' }
  ];

  const densityOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'spacious', label: 'Spacious' }
  ];

  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  useEffect(() => {
    if (userSettings?.ui_customization) {
      const ui = userSettings.ui_customization;
      setUIForm({
        theme: ui.theme || 'system',
        language: ui.language || 'en',
        timezone: ui.timezone || 'UTC',
        dateFormat: ui.date_format || 'MM/DD/YYYY',
        timeFormat: ui.time_format || '24h',
        currency: ui.currency || 'USD',
        compactMode: ui.compact_mode || false,
        showSidebar: ui.show_sidebar !== false,
        sidebarCollapsed: ui.sidebar_collapsed || false,
        showToolbar: ui.show_toolbar !== false,
        showStatusBar: ui.show_status_bar !== false,
        chartTheme: ui.chart_theme || 'dark',
        gridLines: ui.grid_lines !== false,
        animations: ui.animations !== false,
        soundEnabled: ui.sound_enabled !== false,
        highContrast: ui.high_contrast || false,
        fontSize: ui.font_size || 'medium',
        density: ui.density || 'comfortable'
      });
    }
  }, [userSettings]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleFormChange = (field: keyof UICustomizationForm, value: any) => {
    setUIForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateUICustomization({
        theme: uiForm.theme,
        language: uiForm.language,
        timezone: uiForm.timezone,
        date_format: uiForm.dateFormat,
        time_format: uiForm.timeFormat,
        currency: uiForm.currency,
        compact_mode: uiForm.compactMode,
        show_sidebar: uiForm.showSidebar,
        sidebar_collapsed: uiForm.sidebarCollapsed,
        show_toolbar: uiForm.showToolbar,
        show_status_bar: uiForm.showStatusBar,
        chart_theme: uiForm.chartTheme,
        grid_lines: uiForm.gridLines,
        animations: uiForm.animations,
        sound_enabled: uiForm.soundEnabled,
        high_contrast: uiForm.highContrast,
        font_size: uiForm.fontSize,
        density: uiForm.density
      });
      toast.success('UI preferences updated successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update UI preferences');
    }
  };

  const handleReset = () => {
    if (userSettings?.ui_customization) {
      const ui = userSettings.ui_customization;
      setUIForm({
        theme: ui.theme || 'system',
        language: ui.language || 'en',
        timezone: ui.timezone || 'UTC',
        dateFormat: ui.date_format || 'MM/DD/YYYY',
        timeFormat: ui.time_format || '24h',
        currency: ui.currency || 'USD',
        compactMode: ui.compact_mode || false,
        showSidebar: ui.show_sidebar !== false,
        sidebarCollapsed: ui.sidebar_collapsed || false,
        showToolbar: ui.show_toolbar !== false,
        showStatusBar: ui.show_status_bar !== false,
        chartTheme: ui.chart_theme || 'dark',
        gridLines: ui.grid_lines !== false,
        animations: ui.animations !== false,
        soundEnabled: ui.sound_enabled !== false,
        highContrast: ui.high_contrast || false,
        fontSize: ui.font_size || 'medium',
        density: ui.density || 'comfortable'
      });
    }
    setHasChanges(false);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Theme & Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Theme &amp; Appearance
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFormChange('theme', option.value)}
                      className={cn(
                        'flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors',
                        uiForm.theme === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size
                </label>
                <select
                  value={uiForm.fontSize}
                  onChange={(e) => handleFormChange('fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {fontSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Density
                </label>
                <select
                  value={uiForm.density}
                  onChange={(e) => handleFormChange('density', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {densityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    High Contrast Mode
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Improve visibility with enhanced contrast
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFormChange('highContrast', !uiForm.highContrast)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    uiForm.highContrast ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    uiForm.highContrast ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Animations
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable smooth transitions and animations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFormChange('animations', !uiForm.animations)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    uiForm.animations ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    uiForm.animations ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Localization
              </h3>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={uiForm.language}
                onChange={(e) => handleFormChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={uiForm.timezone}
                onChange={(e) => handleFormChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {timezoneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Format
              </label>
              <select
                value={uiForm.dateFormat}
                onChange={(e) => handleFormChange('dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD MMM YYYY">DD MMM YYYY</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Format
              </label>
              <select
                value={uiForm.timeFormat}
                onChange={(e) => handleFormChange('timeFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="12h">12 Hour (AM/PM)</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Currency
              </label>
              <select
                value={uiForm.currency}
                onChange={(e) => handleFormChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Layout Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Layout className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Layout Preferences
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Compact Mode
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reduce spacing and padding for more content
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('compactMode', !uiForm.compactMode)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  uiForm.compactMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  uiForm.compactMode ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Sidebar
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Display the navigation sidebar
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('showSidebar', !uiForm.showSidebar)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  uiForm.showSidebar ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  uiForm.showSidebar ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            {uiForm.showSidebar && (
              <div className="flex items-center justify-between pl-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Collapse Sidebar by Default
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start with sidebar collapsed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFormChange('sidebarCollapsed', !uiForm.sidebarCollapsed)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    uiForm.sidebarCollapsed ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    uiForm.sidebarCollapsed ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Toolbar
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Display the main toolbar with quick actions
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('showToolbar', !uiForm.showToolbar)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  uiForm.showToolbar ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  uiForm.showToolbar ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Status Bar
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Display connection status and system information
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('showStatusBar', !uiForm.showStatusBar)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  uiForm.showStatusBar ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  uiForm.showStatusBar ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Chart & Trading Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chart &amp; Trading Interface
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chart Theme
              </label>
              <select
                value={uiForm.chartTheme}
                onChange={(e) => handleFormChange('chartTheme', e.target.value)}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (Follow System)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grid Lines
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Show grid lines on charts for better readability
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('gridLines', !uiForm.gridLines)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  uiForm.gridLines ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  uiForm.gridLines ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sound Notifications
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Play sounds for trade executions and alerts
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('soundEnabled', !uiForm.soundEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  uiForm.soundEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  uiForm.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
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
            <span>{isLoading ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UICustomization;