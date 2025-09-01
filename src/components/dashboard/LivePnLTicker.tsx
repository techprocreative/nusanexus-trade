import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { useRealTimeBalance } from '../../store/useWebSocketStore';
import { cn } from '../../lib/utils';

interface LivePnLTickerProps {
  className?: string;
  compact?: boolean;
}

interface PnLChangeIndicatorProps {
  value: number;
  previousValue: number;
  className?: string;
}

const PnLChangeIndicator: React.FC<PnLChangeIndicatorProps> = ({ 
  value, 
  previousValue, 
  className 
}) => {
  const [showChange, setShowChange] = useState(false);
  const isPositive = value >= 0;
  const hasChanged = value !== previousValue;
  const changeAmount = value - previousValue;
  
  useEffect(() => {
    if (hasChanged) {
      setShowChange(true);
      const timer = setTimeout(() => setShowChange(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasChanged]);
  
  return (
    <div className={cn('relative', className)}>
      {/* Main P&L Value */}
      <div className={cn(
        'flex items-center gap-2 transition-all duration-500',
        isPositive ? 'text-green-400' : 'text-red-400',
        hasChanged && 'scale-105'
      )}>
        {isPositive ? (
          <TrendingUp className="h-5 w-5 animate-pulse" />
        ) : (
          <TrendingDown className="h-5 w-5 animate-pulse" />
        )}
        <span className="font-mono text-2xl font-bold">
          {isPositive ? '+' : ''}${Math.abs(value).toFixed(2)}
        </span>
      </div>
      
      {/* Change Animation */}
      {showChange && changeAmount !== 0 && (
        <div className={cn(
          'absolute -top-8 left-0 flex items-center gap-1',
          'animate-bounce text-sm font-semibold',
          changeAmount > 0 ? 'text-green-300' : 'text-red-300'
        )}>
          <span>{changeAmount > 0 ? '+' : ''}${changeAmount.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

export const LivePnLTicker: React.FC<LivePnLTickerProps> = ({ 
  className, 
  compact = false 
}) => {
  const balance = useRealTimeBalance();
  const [previousBalance, setPreviousBalance] = useState(balance);
  const [pulseKey, setPulseKey] = useState(0);
  
  useEffect(() => {
    if (balance.dailyPnL !== previousBalance.dailyPnL) {
      setPreviousBalance(balance);
      setPulseKey(prev => prev + 1);
    }
  }, [balance, previousBalance]);
  
  const isPositive = balance.dailyPnL >= 0;
  const totalPnLPositive = balance.totalPnL >= 0;
  
  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-lg',
        'bg-white/5 backdrop-blur-sm border border-white/10',
        'hover:bg-white/10 transition-all duration-300',
        className
      )}>
        <Activity className="h-4 w-4 text-gray-400 animate-pulse" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">P&L:</span>
          <PnLChangeIndicator 
            value={balance.dailyPnL}
            previousValue={previousBalance.dailyPnL}
            className="text-lg"
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      'bg-gradient-to-r from-gray-900/50 to-gray-800/50',
      'backdrop-blur-sm border border-white/10 rounded-xl p-6',
      'hover:from-gray-900/70 hover:to-gray-800/70 transition-all duration-300',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          Live P&L
        </h3>
        <div className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          'bg-white/10 text-white animate-pulse'
        )}>
          LIVE
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Daily P&L */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Daily P&L</p>
            <div className={cn(
              'h-2 w-2 rounded-full animate-pulse',
              isPositive ? 'bg-green-400' : 'bg-red-400'
            )} />
          </div>
          <PnLChangeIndicator 
            value={balance.dailyPnL}
            previousValue={previousBalance.dailyPnL}
          />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Percentage:</span>
            <span className={cn(
              'font-semibold',
              balance.totalPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {balance.totalPnLPercentage >= 0 ? '+' : ''}{balance.totalPnLPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
        
        {/* Total P&L */}
        <div className="border-t border-white/10 pt-4 space-y-2">
          <p className="text-sm text-gray-400">Total P&L</p>
          <div className={cn(
            'flex items-center gap-2 transition-all duration-500',
            totalPnLPositive ? 'text-green-400' : 'text-red-400'
          )}>
            {totalPnLPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-mono text-lg font-semibold">
              {totalPnLPositive ? '+' : ''}${Math.abs(balance.totalPnL).toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Performance Indicator */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Performance</p>
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              isPositive ? 'text-green-400' : 'text-red-400'
            )}>
              <div className={cn(
                'h-1.5 w-1.5 rounded-full animate-pulse',
                isPositive ? 'bg-green-400' : 'bg-red-400'
              )} />
              {isPositive ? 'PROFIT' : 'LOSS'}
            </div>
          </div>
          
          {/* Performance Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={cn(
                'h-2 rounded-full transition-all duration-1000 ease-out',
                isPositive ? 'bg-gradient-to-r from-green-500 to-green-400' :
                'bg-gradient-to-r from-red-500 to-red-400'
              )}
              style={{ 
                width: `${Math.min(Math.abs(balance.totalPnLPercentage) * 2, 100)}%` 
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Pulse Animation Overlay */}
      <div 
        key={pulseKey}
        className={cn(
          'absolute inset-0 rounded-xl pointer-events-none',
          'animate-ping opacity-20',
          isPositive ? 'bg-green-400' : 'bg-red-400'
        )}
        style={{ animationDuration: '1s', animationIterationCount: 1 }}
      />
    </div>
  );
};

export default LivePnLTicker;