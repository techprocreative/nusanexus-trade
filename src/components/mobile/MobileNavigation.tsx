import React, { useState, useEffect } from 'react';
import { Home, TrendingUp, PieChart, BarChart3, Settings, Plus, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { usePositionStore } from '../../store/usePositionStore';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  badges?: {
    positions?: number;
    orders?: number;
  };
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  badges = {} 
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'trading', label: 'Trading', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabPress = (tabId: string) => {
    // Haptic feedback for supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate([10]); // Short, subtle vibration
    }
    onTabChange(tabId);
  };

  const handleQuickAction = () => {
    // Haptic feedback for quick action
    if ('vibrate' in navigator) {
      navigator.vibrate([20]); // Slightly longer vibration for action
    }
    onTabChange('quick-trade');
  };

  return (
    <>
      {/* Bottom Tab Navigation */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 z-50 bottom-nav-safe"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-around items-center py-2 px-2 relative">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badge = tab.id === 'trading' ? badges.positions : 
                         tab.id === 'portfolio' ? badges.orders : undefined;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className={`touch-button relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-400 bg-blue-400/10 scale-105' 
                    : 'text-gray-400 hover:text-gray-300 active:scale-95'
                }`}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {badge && badge > 0 && (
                    <motion.div 
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {badge > 99 ? '99+' : badge}
                    </motion.div>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div 
                    className="absolute -bottom-1 left-1/2 w-1 h-1 bg-blue-400 rounded-full"
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ x: '-50%' }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Action Floating Button */}
      <motion.button
        onClick={handleQuickAction}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center z-40"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          delay: 0.2 
        }}
      >
        <Plus size={24} className="text-white" strokeWidth={2.5} />
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 0], opacity: [0, 0.5, 0] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 1 
          }}
        />
      </motion.button>
    </>
  );
};

// Quick Action Floating Button Component
interface QuickActionButtonProps {
  onNewOrder: () => void;
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  onNewOrder,
  className,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
    onNewOrder();
  };

  return (
    <button
      onClick={handlePress}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        "fixed bottom-20 right-4 z-40",
        "w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full",
        "flex items-center justify-center",
        "shadow-lg shadow-blue-500/25",
        "transition-all duration-200",
        "active:scale-95",
        isPressed && "scale-95 bg-blue-600",
        className
      )}
    >
      <Plus className="h-6 w-6 text-white" />
    </button>
  );
};

// Status Bar Component for Mobile
interface MobileStatusBarProps {
  className?: string;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({ className }) => {
  const { positions } = usePositionStore();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setConnectionStatus('connecting');
        setTimeout(() => setConnectionStatus('connected'), 2000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const totalPnL = positions
    .reduce((sum, p) => sum + p.pnl, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '●';
      case 'connecting': return '◐';
      case 'disconnected': return '○';
      default: return '○';
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700",
      "safe-area-pt", // Handles iPhone notch
      className
    )}>
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <span className={cn("text-sm", getConnectionColor())}>
          {getConnectionIcon()}
        </span>
        <span className="text-xs text-gray-400 capitalize">
          {connectionStatus}
        </span>
      </div>

      {/* Current Time */}
      <div className="text-xs text-gray-400 font-mono">
        {currentTime.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>

      {/* Total P&L */}
      <div className="flex items-center space-x-1">
        <Wallet className="h-3 w-3 text-gray-400" />
        <span className={cn(
          "text-xs font-medium",
          totalPnL >= 0 ? "text-green-400" : "text-red-400"
        )}>
          {formatCurrency(totalPnL)}
        </span>
      </div>
    </div>
  );
};

// Safe Area CSS classes (add to your global CSS)
/*
.safe-area-pt {
  padding-top: env(safe-area-inset-top);
}

.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-pl {
  padding-left: env(safe-area-inset-left);
}

.safe-area-pr {
  padding-right: env(safe-area-inset-right);
}
*/

export default MobileNavigation;