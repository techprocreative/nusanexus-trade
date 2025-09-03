import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap } from 'lucide-react';
import { AccountBalance, QuickStats } from '../../types';

interface AccountOverviewProps {
  accountBalance: AccountBalance;
  quickStats: QuickStats;
  loading?: boolean;
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '', 
  decimals = 2 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(value * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
    <div className="h-8 bg-gray-700 rounded w-32"></div>
  </div>
);

const AccountOverview: React.FC<AccountOverviewProps> = ({ 
  accountBalance, 
  quickStats, 
  loading = false 
}) => {
  const isProfitable = accountBalance.dailyPnL >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Account Balance Card */}
      <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-gray-900/30 border border-gray-700/50 hover:bg-gray-900/40 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Balance</div>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-2xl font-bold text-white mb-1">
              <AnimatedNumber 
                value={accountBalance.balance} 
                prefix="$" 
                decimals={2}
              />
            </div>
            <div className="text-sm text-gray-400">
              Equity: ${accountBalance.equity.toFixed(2)}
            </div>
          </>
        )}
      </div>

      {/* Today's P&L Card */}
      <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-gray-900/30 border border-gray-700/50 hover:bg-gray-900/40 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${isProfitable ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {isProfitable ? (
              <TrendingUp className="w-6 h-6 text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Today's P&L</div>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className={`text-2xl font-bold mb-1 ${
              isProfitable ? 'text-green-400' : 'text-red-400'
            }`}>
              <AnimatedNumber 
                value={accountBalance.dailyPnL} 
                prefix={accountBalance.dailyPnL >= 0 ? '+$' : '-$'} 
                decimals={2}
              />
            </div>
            <div className={`text-sm ${
              isProfitable ? 'text-green-400/70' : 'text-red-400/70'
            }`}>
              {accountBalance.totalPnLPercentage >= 0 ? '+' : ''}
              {accountBalance.totalPnLPercentage.toFixed(2)}%
            </div>
          </>
        )}
      </div>

      {/* Open Positions Card */}
      <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-gray-900/30 border border-gray-700/50 hover:bg-gray-900/40 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Positions</div>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-2xl font-bold text-white mb-1">
              <AnimatedNumber 
                value={quickStats.openPositions} 
                decimals={0}
              />
            </div>
            <div className="text-sm text-gray-400">
              Active trades
            </div>
          </>
        )}
      </div>

      {/* Active Strategies Card */}
      <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-gray-900/30 border border-gray-700/50 hover:bg-gray-900/40 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Zap className="w-6 h-6 text-orange-400" />
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Strategies</div>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-2xl font-bold text-white mb-1">
              <AnimatedNumber 
                value={quickStats.activeStrategies} 
                decimals={0}
              />
            </div>
            <div className="text-sm text-gray-400">
              Running
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountOverview;