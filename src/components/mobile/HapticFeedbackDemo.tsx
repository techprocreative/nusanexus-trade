import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Vibrate, 
  Settings, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Bell
} from 'lucide-react';
import { 
  useHapticFeedback, 
  TradingHaptics, 
  NavigationHaptics, 
  ChartHaptics,
  isHapticEnabled,
  setHapticEnabled,
  setHapticIntensity
} from '../../utils/hapticFeedback';

interface HapticDemoProps {
  className?: string;
}

const HapticFeedbackDemo: React.FC<HapticDemoProps> = ({ className = '' }) => {
  const [isEnabled, setIsEnabled] = useState(isHapticEnabled());
  const [intensity, setIntensity] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const haptic = useHapticFeedback();

  useEffect(() => {
    // Load saved intensity from localStorage
    const savedIntensity = localStorage.getItem('haptic-intensity') as 'light' | 'medium' | 'heavy';
    if (savedIntensity) {
      setIntensity(savedIntensity);
    }
  }, []);

  const handleToggleEnabled = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    setHapticEnabled(newEnabled);
    
    if (newEnabled) {
      NavigationHaptics.tap();
    }
  };

  const handleIntensityChange = (newIntensity: 'light' | 'medium' | 'heavy') => {
    setIntensity(newIntensity);
    setHapticIntensity(newIntensity);
    localStorage.setItem('haptic-intensity', newIntensity);
    
    // Test the new intensity
    NavigationHaptics.tap();
  };

  const handleDemoAction = (action: () => void, demoType: string) => {
    setActiveDemo(demoType);
    action();
    
    setTimeout(() => {
      setActiveDemo(null);
    }, 300);
  };

  const demoSections = [
    {
      title: 'Navigation Feedback',
      icon: <Smartphone className="w-5 h-5" />,
      items: [
        {
          label: 'Button Tap',
          action: NavigationHaptics.buttonPress,
          id: 'button-tap',
          description: 'Light feedback for button presses'
        },
        {
          label: 'Swipe Gesture',
          action: NavigationHaptics.swipe,
          id: 'swipe',
          description: 'Subtle feedback for swipe actions'
        },
        {
          label: 'Pull to Refresh',
          action: NavigationHaptics.pullToRefresh,
          id: 'pull-refresh',
          description: 'Multi-pulse feedback for refresh action'
        },
        {
          label: 'Long Press',
          action: NavigationHaptics.longPress,
          id: 'long-press',
          description: 'Medium feedback for long press'
        }
      ]
    },
    {
      title: 'Trading Actions',
      icon: <TrendingUp className="w-5 h-5" />,
      items: [
        {
          label: 'Order Placed',
          action: TradingHaptics.orderPlaced,
          id: 'order-placed',
          description: 'Confirmation feedback for order placement',
          color: 'text-blue-400'
        },
        {
          label: 'Order Filled',
          action: TradingHaptics.orderFilled,
          id: 'order-filled',
          description: 'Success feedback for filled orders',
          color: 'text-green-400'
        },
        {
          label: 'Order Cancelled',
          action: TradingHaptics.orderCancelled,
          id: 'order-cancelled',
          description: 'Neutral feedback for cancellation',
          color: 'text-yellow-400'
        },
        {
          label: 'Order Rejected',
          action: TradingHaptics.orderRejected,
          id: 'order-rejected',
          description: 'Strong feedback for rejection',
          color: 'text-red-400'
        }
      ]
    },
    {
      title: 'Alerts & Notifications',
      icon: <Bell className="w-5 h-5" />,
      items: [
        {
          label: 'Price Alert',
          action: TradingHaptics.priceAlert,
          id: 'price-alert',
          description: 'Attention-grabbing alert pattern',
          color: 'text-purple-400'
        },
        {
          label: 'Success',
          action: TradingHaptics.success,
          id: 'success',
          description: 'Positive confirmation feedback',
          color: 'text-green-400'
        },
        {
          label: 'Warning',
          action: TradingHaptics.warning,
          id: 'warning',
          description: 'Cautionary feedback pattern',
          color: 'text-yellow-400'
        },
        {
          label: 'Error',
          action: TradingHaptics.error,
          id: 'error',
          description: 'Strong error indication',
          color: 'text-red-400'
        }
      ]
    },
    {
      title: 'Chart Interactions',
      icon: <TrendingUp className="w-5 h-5" />,
      items: [
        {
          label: 'Zoom',
          action: ChartHaptics.zoom,
          id: 'chart-zoom',
          description: 'Light feedback for zoom gestures'
        },
        {
          label: 'Pan',
          action: ChartHaptics.pan,
          id: 'chart-pan',
          description: 'Subtle feedback for panning'
        },
        {
          label: 'Crosshair',
          action: ChartHaptics.crosshair,
          id: 'crosshair',
          description: 'Minimal feedback for crosshair movement'
        }
      ]
    }
  ];

  return (
    <div className={`bg-gray-900 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Vibrate className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Haptic Feedback</h2>
            <p className="text-gray-400 text-sm">Touch feedback settings and demo</p>
          </div>
        </div>
        <Settings className="w-5 h-5 text-gray-400" />
      </div>

      {/* Settings */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
        
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isEnabled ? (
              <Volume2 className="w-5 h-5 text-green-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-white font-medium">Haptic Feedback</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleEnabled}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              isEnabled ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: isEnabled ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
            />
          </motion.button>
        </div>

        {/* Intensity Settings */}
        {isEnabled && (
          <div>
            <label className="block text-white font-medium mb-2">Intensity</label>
            <div className="flex space-x-2">
              {(['light', 'medium', 'heavy'] as const).map((level) => (
                <motion.button
                  key={level}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDemoAction(() => handleIntensityChange(level), `intensity-${level}`)}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                    intensity === level
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${activeDemo === `intensity-${level}` ? 'ring-2 ring-purple-400' : ''}`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Demo Sections */}
      {isEnabled && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Try Different Patterns</h3>
          
          {demoSections.map((section) => (
            <div key={section.title} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                {section.icon}
                <h4 className="font-semibold text-white">{section.title}</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.items.map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDemoAction(item.action, item.id)}
                    className={`p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-left ${
                      activeDemo === item.id ? 'ring-2 ring-purple-400 bg-gray-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${item.color || 'text-white'}`}>
                        {item.label}
                      </span>
                      <Play className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disabled State */}
      {!isEnabled && (
        <div className="text-center py-8">
          <VolumeX className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">Haptic feedback is disabled</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleEnabled}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            Enable Haptic Feedback
          </motion.button>
        </div>
      )}

      {/* Device Support Info */}
      <div className="mt-6 p-3 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Smartphone className="w-4 h-4" />
          <span>
            {typeof navigator !== 'undefined' && 'vibrate' in navigator
              ? 'Haptic feedback supported on this device'
              : 'Haptic feedback may not be available on this device'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HapticFeedbackDemo;

// Export a simpler haptic button component for reuse
export const HapticButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  hapticType?: string;
  className?: string;
  disabled?: boolean;
}> = ({ 
  children, 
  onClick, 
  hapticType = 'buttonPress', 
  className = '', 
  disabled = false 
}) => {
  const handleClick = () => {
    if (!disabled) {
      NavigationHaptics.buttonPress();
      onClick?.();
    }
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      className={`transition-colors ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </motion.button>
  );
};

// Export a haptic-enabled trading button
export const HapticTradingButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant: 'buy' | 'sell' | 'cancel' | 'confirm';
  className?: string;
  disabled?: boolean;
}> = ({ 
  children, 
  onClick, 
  variant, 
  className = '', 
  disabled = false 
}) => {
  const handleClick = () => {
    if (!disabled) {
      switch (variant) {
        case 'buy':
        case 'sell':
          TradingHaptics.orderPlaced();
          break;
        case 'cancel':
          TradingHaptics.orderCancelled();
          break;
        case 'confirm':
          TradingHaptics.success();
          break;
      }
      onClick?.();
    }
  };

  const variantStyles = {
    buy: 'bg-green-500 hover:bg-green-600 text-white',
    sell: 'bg-red-500 hover:bg-red-600 text-white',
    cancel: 'bg-gray-500 hover:bg-gray-600 text-white',
    confirm: 'bg-blue-500 hover:bg-blue-600 text-white'
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        variantStyles[variant]
      } ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </motion.button>
  );
};