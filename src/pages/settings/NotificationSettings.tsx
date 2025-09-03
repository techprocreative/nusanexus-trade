import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  Volume2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Save,
  RotateCcw,
  Settings,
  Zap,
  Target,
  BarChart3,
  Info
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { NotificationPreferencesForm } from '../../types/settings';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';

const NotificationSettings: React.FC = () => {
  const {
    userSettings,
    isLoading,
    error,
    fetchUserSettings,
    updateNotificationPreferences,
    clearError
  } = useSettingsStore();

  const [notificationForm, setNotificationForm] = useState<NotificationPreferencesForm>({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    soundEnabled: true,
    tradeExecutions: true,
    priceAlerts: true,
    newsAlerts: false,
    systemAlerts: true,
    marketOpen: false,
    marketClose: false,
    dailySummary: true,
    weeklyReport: false,
    monthlyReport: false,
    profitLossAlerts: true,
    marginCallAlerts: true,
    connectionAlerts: true,
    frequency: 'immediate',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    weekendNotifications: false
  });

  const [hasChanges, setHasChanges] = useState(false);

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'every_5_minutes', label: 'Every 5 minutes' },
    { value: 'every_15_minutes', label: 'Every 15 minutes' },
    { value: 'every_30_minutes', label: 'Every 30 minutes' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily digest' }
  ];

  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  useEffect(() => {
    if (userSettings?.notification_preferences) {
      const notif = userSettings.notification_preferences;
      setNotificationForm({
        emailEnabled: notif.email_enabled !== false,
        pushEnabled: notif.push_enabled !== false,
        smsEnabled: notif.sms_enabled || false,
        soundEnabled: notif.sound_enabled !== false,
        tradeExecutions: notif.trade_executions !== false,
        priceAlerts: notif.price_alerts !== false,
        newsAlerts: notif.news_alerts || false,
        systemAlerts: notif.system_alerts !== false,
        marketOpen: notif.market_open || false,
        marketClose: notif.market_close || false,
        dailySummary: notif.daily_summary !== false,
        weeklyReport: notif.weekly_report || false,
        monthlyReport: notif.monthly_report || false,
        profitLossAlerts: notif.profit_loss_alerts !== false,
        marginCallAlerts: notif.margin_call_alerts !== false,
        connectionAlerts: notif.connection_alerts !== false,
        frequency: notif.frequency || 'immediate',
        quietHoursEnabled: notif.quiet_hours_enabled || false,
        quietHoursStart: notif.quiet_hours_start || '22:00',
        quietHoursEnd: notif.quiet_hours_end || '08:00',
        weekendNotifications: notif.weekend_notifications || false
      });
    }
  }, [userSettings]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleFormChange = (field: keyof NotificationPreferencesForm, value: any) => {
    setNotificationForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateNotificationPreferences({
        emailEnabled: notificationForm.emailEnabled,
        pushEnabled: notificationForm.pushEnabled,
        smsEnabled: notificationForm.smsEnabled,
        soundEnabled: notificationForm.soundEnabled,
        tradeExecutions: notificationForm.tradeExecutions,
        priceAlerts: notificationForm.priceAlerts,
        newsAlerts: notificationForm.newsAlerts,
        systemAlerts: notificationForm.systemAlerts,
        marketOpen: notificationForm.marketOpen,
        marketClose: notificationForm.marketClose,
        dailySummary: notificationForm.dailySummary,
        weeklyReport: notificationForm.weeklyReport,
        monthlyReport: notificationForm.monthlyReport,
        profitLossAlerts: notificationForm.profitLossAlerts,
        marginCallAlerts: notificationForm.marginCallAlerts,
        connectionAlerts: notificationForm.connectionAlerts,
        frequency: notificationForm.frequency,
        quietHoursEnabled: notificationForm.quietHoursEnabled,
        quietHoursStart: notificationForm.quietHoursStart,
        quietHoursEnd: notificationForm.quietHoursEnd,
        weekendNotifications: notificationForm.weekendNotifications
      });
      toast.success('Notification preferences updated successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update notification preferences');
    }
  };

  const handleReset = () => {
    if (userSettings?.notification_preferences) {
      const notif = userSettings.notification_preferences;
      setNotificationForm({
        emailEnabled: notif.email_enabled !== false,
        pushEnabled: notif.push_enabled !== false,
        smsEnabled: notif.sms_enabled || false,
        soundEnabled: notif.sound_enabled !== false,
        tradeExecutions: notif.trade_executions !== false,
        priceAlerts: notif.price_alerts !== false,
        newsAlerts: notif.news_alerts || false,
        systemAlerts: notif.system_alerts !== false,
        marketOpen: notif.market_open || false,
        marketClose: notif.market_close || false,
        dailySummary: notif.daily_summary !== false,
        weeklyReport: notif.weekly_report || false,
        monthlyReport: notif.monthly_report || false,
        profitLossAlerts: notif.profit_loss_alerts !== false,
        marginCallAlerts: notif.margin_call_alerts !== false,
        connectionAlerts: notif.connection_alerts !== false,
        frequency: notif.frequency || 'immediate',
        quietHoursEnabled: notif.quiet_hours_enabled || false,
        quietHoursStart: notif.quiet_hours_start || '22:00',
        quietHoursEnd: notif.quiet_hours_end || '08:00',
        weekendNotifications: notif.weekend_notifications || false
      });
    }
    setHasChanges(false);
  };

  const testNotification = () => {
    toast.success('Test notification sent successfully!');
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Notification Channels */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notification Channels
                </h3>
              </div>
              <button
                type="button"
                onClick={testNotification}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Test</span>
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('emailEnabled', !notificationForm.emailEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.emailEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Push Notifications
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive push notifications on your device
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('pushEnabled', !notificationForm.pushEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.pushEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sound Alerts
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Play sound alerts for important events
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('soundEnabled', !notificationForm.soundEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.soundEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Trading Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trading Alerts
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trade Executions
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notify when trades are opened or closed
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('tradeExecutions', !notificationForm.tradeExecutions)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.tradeExecutions ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.tradeExecutions ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price Alerts
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notify when price targets are reached
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('priceAlerts', !notificationForm.priceAlerts)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.priceAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.priceAlerts ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-yellow-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profit/Loss Alerts
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notify on significant P&amp;L changes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('profitLossAlerts', !notificationForm.profitLossAlerts)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.profitLossAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.profitLossAlerts ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Margin Call Alerts
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Critical alerts for margin requirements
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('marginCallAlerts', !notificationForm.marginCallAlerts)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.marginCallAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.marginCallAlerts ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Market & System Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Market &amp; System Alerts
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Market Open/Close
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Notify when markets open or close
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationForm.marketOpen}
                    onChange={(e) => handleFormChange('marketOpen', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Open</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationForm.marketClose}
                    onChange={(e) => handleFormChange('marketClose', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Close</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    News Alerts
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    High-impact economic news and events
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('newsAlerts', !notificationForm.newsAlerts)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.newsAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.newsAlerts ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    System Alerts
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Platform updates and maintenance notices
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('systemAlerts', !notificationForm.systemAlerts)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.systemAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.systemAlerts ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Connection Alerts
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  MT5 connection status changes
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('connectionAlerts', !notificationForm.connectionAlerts)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.connectionAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.connectionAlerts ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Reports & Summaries */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reports &amp; Summaries
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Daily Summary
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Daily trading performance summary
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('dailySummary', !notificationForm.dailySummary)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.dailySummary ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.dailySummary ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weekly Report
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comprehensive weekly performance report
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('weeklyReport', !notificationForm.weeklyReport)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.weeklyReport ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monthly Report
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Detailed monthly analysis and insights
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('monthlyReport', !notificationForm.monthlyReport)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.monthlyReport ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.monthlyReport ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Timing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notification Timing
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notification Frequency
              </label>
              <select
                value={notificationForm.frequency}
                onChange={(e) => handleFormChange('frequency', e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quiet Hours
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Disable non-critical notifications during specified hours
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('quietHoursEnabled', !notificationForm.quietHoursEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.quietHoursEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.quietHoursEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            {notificationForm.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={notificationForm.quietHoursStart}
                    onChange={(e) => handleFormChange('quietHoursStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={notificationForm.quietHoursEnd}
                    onChange={(e) => handleFormChange('quietHoursEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weekend Notifications
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications during weekends
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('weekendNotifications', !notificationForm.weekendNotifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notificationForm.weekendNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notificationForm.weekendNotifications ? 'translate-x-6' : 'translate-x-1'
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

export default NotificationSettings;