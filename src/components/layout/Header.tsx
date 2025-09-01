import React from 'react';
import { 
  Bell, 
  User, 
  ChevronDown,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  useAccountBalance, 
  useUnreadNotifications, 
  useUser,
  useSidebarCollapsed 
} from '../../store';
import { useRealTimeBalance } from '../../store/useWebSocketStore';
import { ConnectionStatus } from '../ui/ConnectionStatus';
import { cn } from '../../utils/cn';

export const Header: React.FC = () => {
  const user = useUser();
  const accountBalance = useAccountBalance();
  const realTimeBalance = useRealTimeBalance();
  const unreadNotifications = useUnreadNotifications();
  const sidebarCollapsed = useSidebarCollapsed();

  // Use real-time balance if available, fallback to static balance
  const currentBalance = realTimeBalance || accountBalance;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-background-secondary border-b border-gray-700 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Account Balance Section */}
        <div className="flex items-center space-x-6">
          {currentBalance && (
            <>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(currentBalance.balance)}
                  </p>
                  <p className="text-xs text-gray-400">Account Balance</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {currentBalance.dailyPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <div>
                  <p className={cn(
                    'text-sm font-medium',
                    currentBalance.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {formatCurrency(currentBalance.dailyPnL)}
                  </p>
                  <p className="text-xs text-gray-400">Daily P&L</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div>
                  <p className={cn(
                    'text-sm font-medium',
                    currentBalance.totalPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {formatPercentage(currentBalance.totalPnLPercentage)}
                  </p>
                  <p className="text-xs text-gray-400">Total Return</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <ConnectionStatus showText={true} />

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {user?.name || 'Guest User'}
              </p>
              <p className="text-xs text-gray-400">
                {user?.email || 'guest@example.com'}
              </p>
            </div>
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};