import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
// import { Badge } from '@/components/ui/badge';

// Custom Badge component
const Badge = ({ children, variant, className }: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    variant === 'destructive' ? 'bg-red-500 text-white' :
    variant === 'outline' ? 'border' : 'bg-gray-700'
  } ${className}`}>
    {children}
  </span>
);
import {
  TrendingUp,
  BarChart3,
  History,
  Settings,
  Plus,
  Wallet,
  Bell,
  User,
  Home,
  Activity,
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { usePositionStore } from '@/store/usePositionStore';
import { useHistoryStore } from '@/store/useHistoryStore';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  const { pendingOrders } = useOrderStore();
  const { positions } = usePositionStore();
  const { tradeHistory } = useHistoryStore();
  const [notifications, setNotifications] = useState(0);

  // Simulate notifications (in real app, this would come from a notification store)
  useEffect(() => {
    const interval = setInterval(() => {
      // Random notification updates for demo
      if (Math.random() > 0.8) {
        setNotifications(prev => prev + 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      badge: null,
    },
    {
      id: 'positions',
      label: 'Positions',
      icon: TrendingUp,
      badge: positions.length || null,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Plus,
      badge: pendingOrders.length || null,
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
  ];

  const handleTabPress = (tabId: string) => {
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onTabChange(tabId);
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700",
      "safe-area-pb", // Handles iPhone home indicator
      className
    )}>
      {/* Tab Bar */}
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200",
                "active:scale-95 active:bg-gray-700/50", // Touch feedback
                isActive 
                  ? "text-blue-400 bg-blue-500/10" 
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 mb-1 transition-all duration-200",
                  isActive && "scale-110"
                )} />
                
                {/* Badge for notifications/counts */}
                {tab.badge && tab.badge > 0 && (
                  <Badge 
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-4"
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Badge>
                )}
              </div>
              
              <span className={cn(
                "text-xs font-medium truncate max-w-full transition-all duration-200",
                isActive ? "text-blue-400" : "text-gray-400"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
    </div>
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