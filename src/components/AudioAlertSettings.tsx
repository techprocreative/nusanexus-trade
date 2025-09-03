import React from 'react';
import { Volume2, Settings } from 'lucide-react';
import { cn } from '../utils/cn';

interface AudioAlertSetting {
  enabled: boolean;
  volume: number;
  alerts: Record<string, boolean>;
}

interface AudioAlertSettingsProps {
  isVisible: boolean;
  onClose: () => void;
  settings: AudioAlertSetting;
  onUpdateSetting: (key: string, value: string | number | boolean) => void;
  onUpdateAlertSetting: (alertType: string, enabled: boolean) => void;
  onToggleAllAlerts: (enabled: boolean) => void;
}

export const AudioAlertSettings: React.FC<AudioAlertSettingsProps> = ({
  isVisible,
  onClose,
  settings,
  onUpdateSetting,
  onUpdateAlertSetting,
  onToggleAllAlerts
}) => {
  if (!isVisible) return null;

  const alertTypes = [
    { key: 'order_fill', label: 'Order Filled' },
    { key: 'stop_loss', label: 'Stop Loss Hit' },
    { key: 'take_profit', label: 'Take Profit Hit' },
    { key: 'connection_lost', label: 'Connection Lost' },
    { key: 'connection_restored', label: 'Connection Restored' },
    { key: 'new_position', label: 'New Position' },
    { key: 'position_closed', label: 'Position Closed' },
    { key: 'error', label: 'Error Alert' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Audio Alert Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        {/* Master Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Enable Audio Alerts</span>
            <button
              onClick={() => onUpdateSetting('enabled', !settings.enabled)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.enabled ? 'bg-blue-600' : 'bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => onUpdateSetting('volume', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>{Math.round(settings.volume * 100)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
        
        {/* Individual Alert Settings */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 font-medium">Alert Types</span>
            <button
              onClick={() => onToggleAllAlerts(!Object.values(settings.alerts).every(Boolean))}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {Object.values(settings.alerts).every(Boolean) ? 'Disable All' : 'Enable All'}
            </button>
          </div>
          
          {alertTypes.map((alertType) => (
            <div
              key={alertType.key}
              className="flex items-center justify-between py-2 px-3 bg-gray-900 rounded border border-gray-600"
            >
              <span className="text-gray-300 text-sm">{alertType.label}</span>
              <button
                onClick={() => onUpdateAlertSetting(alertType.key, !settings.alerts[alertType.key])}
                className={cn(
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                  settings.alerts[alertType.key] ? 'bg-blue-600' : 'bg-gray-600'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                    settings.alerts[alertType.key] ? 'translate-x-5' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};