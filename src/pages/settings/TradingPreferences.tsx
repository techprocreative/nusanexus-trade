import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Percent,
  AlertTriangle,
  Save,
  RotateCcw,
  Info,
  Target,
  StopCircle,
  Timer,
  Calculator
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { TradingPreferencesForm } from '../../types/settings';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';

const TradingPreferences: React.FC = () => {
  const {
    tradingPreferences,
    isLoading,
    error,
    fetchSettings,
    updateTradingPreferences,
    clearError
  } = useSettingsStore();

  const [tradingForm, setTradingForm] = useState<TradingPreferencesForm>({
    defaultOrderType: 'market',
    defaultLotSize: 0.01,
    maxLotSize: 1.0,
    defaultStopLoss: 50,
    defaultTakeProfit: 100,
    maxSpread: 3,
    slippage: 2,
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
    newsFilterEnabled: false,
    highImpactNewsBuffer: 30,
    maxRiskPerTrade: 5,
    autoCloseOnProfit: false,
    autoCloseOnLoss: false,
    profitTarget: 100,
    stopLossPercentage: 2,
    trailingStop: false,
    confirmOrders: true,
    oneClickTrading: false,
    showSpread: true,
    allowHedging: false
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings('trading');
  }, [fetchSettings]);

  useEffect(() => {
    if (tradingPreferences) {
      setTradingForm({
        defaultOrderType: tradingPreferences.defaultOrderType || 'market',
        defaultLotSize: tradingPreferences.defaultLotSize || 0.01,
        maxLotSize: tradingPreferences.maxLotSize || 1.0,
        defaultStopLoss: tradingPreferences.defaultStopLoss || 50,
        defaultTakeProfit: tradingPreferences.defaultTakeProfit || 100,
        maxSpread: tradingPreferences.maxSpread || 3,
        slippage: tradingPreferences.slippage || 2,
        maxDailyLoss: tradingPreferences.maxDailyLoss || 1000,
        maxDailyTrades: tradingPreferences.maxDailyTrades || 10,
        riskPerTrade: tradingPreferences.riskPerTrade || 2,
        autoCloseEnabled: tradingPreferences.autoCloseEnabled || false,
        autoCloseTime: tradingPreferences.autoCloseTime || '17:00',
        weekendCloseEnabled: tradingPreferences.weekendCloseEnabled || true,
        trailingStopEnabled: tradingPreferences.trailingStopEnabled || false,
        trailingStopDistance: tradingPreferences.trailingStopDistance || 20,
        partialCloseEnabled: tradingPreferences.partialCloseEnabled || false,
        partialClosePercent: tradingPreferences.partialClosePercent || 50,
        newsFilterEnabled: tradingPreferences.newsFilterEnabled || false,
        highImpactNewsBuffer: tradingPreferences.highImpactNewsBuffer || 30,
        maxRiskPerTrade: tradingPreferences.maxRiskPerTrade || 5,
        autoCloseOnProfit: tradingPreferences.autoCloseOnProfit || false,
        autoCloseOnLoss: tradingPreferences.autoCloseOnLoss || false,
        profitTarget: tradingPreferences.profitTarget || 100,
        stopLossPercentage: tradingPreferences.stopLossPercentage || 2,
        trailingStop: tradingPreferences.trailingStop || false,
        confirmOrders: tradingPreferences.confirmOrders || true,
        oneClickTrading: tradingPreferences.oneClickTrading || false,
        showSpread: tradingPreferences.showSpread || true,
        allowHedging: tradingPreferences.allowHedging || false
      });
    }
  }, [tradingPreferences]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleFormChange = (field: keyof TradingPreferencesForm, value: any) => {
    setTradingForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateTradingPreferences({
        defaultOrderType: tradingForm.defaultOrderType,
        defaultLotSize: tradingForm.defaultLotSize,
        maxLotSize: tradingForm.maxLotSize,
        defaultStopLoss: tradingForm.defaultStopLoss,
        defaultTakeProfit: tradingForm.defaultTakeProfit,
        maxSpread: tradingForm.maxSpread,
        slippage: tradingForm.slippage,
        maxDailyLoss: tradingForm.maxDailyLoss,
        maxDailyTrades: tradingForm.maxDailyTrades,
        riskPerTrade: tradingForm.riskPerTrade,
        autoCloseEnabled: tradingForm.autoCloseEnabled,
        autoCloseTime: tradingForm.autoCloseTime,
        weekendCloseEnabled: tradingForm.weekendCloseEnabled,
        trailingStopEnabled: tradingForm.trailingStopEnabled,
        trailingStopDistance: tradingForm.trailingStopDistance,
        partialCloseEnabled: tradingForm.partialCloseEnabled,
        partialClosePercent: tradingForm.partialClosePercent,
        newsFilterEnabled: tradingForm.newsFilterEnabled,
        highImpactNewsBuffer: tradingForm.highImpactNewsBuffer,
        maxRiskPerTrade: tradingForm.maxRiskPerTrade,
        autoCloseOnProfit: tradingForm.autoCloseOnProfit,
        autoCloseOnLoss: tradingForm.autoCloseOnLoss,
        profitTarget: tradingForm.profitTarget,
        stopLossPercentage: tradingForm.stopLossPercentage,
        trailingStop: tradingForm.trailingStop,
        confirmOrders: tradingForm.confirmOrders,
        oneClickTrading: tradingForm.oneClickTrading,
        showSpread: tradingForm.showSpread,
        allowHedging: tradingForm.allowHedging
      });
      toast.success('Trading preferences updated successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update trading preferences');
    }
  };

  const handleReset = () => {
    if (tradingPreferences) {
      setTradingForm({
        defaultOrderType: tradingPreferences.defaultOrderType || 'market',
        defaultLotSize: tradingPreferences.defaultLotSize || 0.01,
        maxLotSize: tradingPreferences.maxLotSize || 1.0,
        defaultStopLoss: tradingPreferences.defaultStopLoss || 50,
        defaultTakeProfit: tradingPreferences.defaultTakeProfit || 100,
        maxSpread: tradingPreferences.maxSpread || 3,
        slippage: tradingPreferences.slippage || 2,
        maxDailyLoss: tradingPreferences.maxDailyLoss || 1000,
        maxDailyTrades: tradingPreferences.maxDailyTrades || 10,
        riskPerTrade: tradingPreferences.riskPerTrade || 2,
        autoCloseEnabled: tradingPreferences.autoCloseEnabled || false,
        autoCloseTime: tradingPreferences.autoCloseTime || '17:00',
        weekendCloseEnabled: tradingPreferences.weekendCloseEnabled || true,
        trailingStopEnabled: tradingPreferences.trailingStopEnabled || false,
        trailingStopDistance: tradingPreferences.trailingStopDistance || 20,
        partialCloseEnabled: tradingPreferences.partialCloseEnabled || false,
        partialClosePercent: tradingPreferences.partialClosePercent || 50,
        newsFilterEnabled: tradingPreferences.newsFilterEnabled || false,
        highImpactNewsBuffer: tradingPreferences.highImpactNewsBuffer || 30,
        maxRiskPerTrade: tradingPreferences.maxRiskPerTrade || 5,
        autoCloseOnProfit: tradingPreferences.autoCloseOnProfit || false,
        autoCloseOnLoss: tradingPreferences.autoCloseOnLoss || false,
        profitTarget: tradingPreferences.profitTarget || 100,
        stopLossPercentage: tradingPreferences.stopLossPercentage || 2,
        trailingStop: tradingPreferences.trailingStop || false,
        confirmOrders: tradingPreferences.confirmOrders || true,
        oneClickTrading: tradingPreferences.oneClickTrading || false,
        showSpread: tradingPreferences.showSpread || true,
        allowHedging: tradingPreferences.allowHedging || false
      });
    }
    setHasChanges(false);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Order Defaults */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Defaults
              </h3>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Lot Size
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={tradingForm.defaultLotSize}
                onChange={(e) => handleFormChange('defaultLotSize', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Lot Size
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={tradingForm.maxLotSize}
                onChange={(e) => handleFormChange('maxLotSize', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Stop Loss (pips)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={tradingForm.defaultStopLoss}
                onChange={(e) => handleFormChange('defaultStopLoss', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Take Profit (pips)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={tradingForm.defaultTakeProfit}
                onChange={(e) => handleFormChange('defaultTakeProfit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Spread (pips)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={tradingForm.maxSpread}
                onChange={(e) => handleFormChange('maxSpread', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slippage (pips)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={tradingForm.slippage}
                onChange={(e) => handleFormChange('slippage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Risk Management
              </h3>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Daily Loss ($)
              </label>
              <input
                type="number"
                min="1"
                max="100000"
                value={tradingForm.maxDailyLoss}
                onChange={(e) => handleFormChange('maxDailyLoss', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Daily Trades
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={tradingForm.maxDailyTrades}
                onChange={(e) => handleFormChange('maxDailyTrades', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Risk Per Trade (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={tradingForm.riskPerTrade}
                onChange={(e) => handleFormChange('riskPerTrade', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Auto-Close Rules */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Auto-Close Rules
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Auto-Close
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically close all positions at a specific time
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('autoCloseEnabled', !tradingForm.autoCloseEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  tradingForm.autoCloseEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  tradingForm.autoCloseEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            {tradingForm.autoCloseEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auto-Close Time
                </label>
                <input
                  type="time"
                  value={tradingForm.autoCloseTime}
                  onChange={(e) => handleFormChange('autoCloseTime', e.target.value)}
                  className="w-full md:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weekend Close
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Close all positions before weekend
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('weekendCloseEnabled', !tradingForm.weekendCloseEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  tradingForm.weekendCloseEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  tradingForm.weekendCloseEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Advanced Features
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trailing Stop
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically adjust stop loss as price moves favorably
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('trailingStopEnabled', !tradingForm.trailingStopEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  tradingForm.trailingStopEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  tradingForm.trailingStopEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            {tradingForm.trailingStopEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trailing Stop Distance (pips)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={tradingForm.trailingStopDistance}
                  onChange={(e) => handleFormChange('trailingStopDistance', parseInt(e.target.value))}
                  className="w-full md:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Partial Close
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Close part of profitable positions to secure profits
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('partialCloseEnabled', !tradingForm.partialCloseEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  tradingForm.partialCloseEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  tradingForm.partialCloseEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            {tradingForm.partialCloseEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Partial Close Percentage (%)
                </label>
                <input
                  type="number"
                  min="10"
                  max="90"
                  step="5"
                  value={tradingForm.partialClosePercent}
                  onChange={(e) => handleFormChange('partialClosePercent', parseInt(e.target.value))}
                  className="w-full md:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  News Filter
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avoid trading during high-impact news events
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('newsFilterEnabled', !tradingForm.newsFilterEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  tradingForm.newsFilterEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  tradingForm.newsFilterEnabled ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            {tradingForm.newsFilterEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  High Impact News Buffer (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={tradingForm.highImpactNewsBuffer}
                  onChange={(e) => handleFormChange('highImpactNewsBuffer', parseInt(e.target.value))}
                  className="w-full md:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
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

      {/* Risk Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Risk Warning
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Trading involves substantial risk and may result in loss of capital</li>
              <li>• Always test your settings on a demo account first</li>
              <li>• Risk management settings are crucial for protecting your account</li>
              <li>• Consider your risk tolerance when setting position sizes and stop losses</li>
              <li>• Past performance does not guarantee future results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPreferences;