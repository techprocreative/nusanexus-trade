import React, { useState, useEffect, memo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useRealTimeBalance } from '../../store/useWebSocketStore';
import { cn } from '../../lib/utils';

interface RealTimeBalanceProps {
  className?: string;
}

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  colorChange?: boolean;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
  colorChange = false,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isIncreasing, setIsIncreasing] = useState<boolean | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsIncreasing(value > displayValue);
      setIsAnimating(true);
      
      // Smooth animation to new value
      const startValue = displayValue;
      const difference = value - startValue;
      const duration = 800; // ms
      const steps = 30;
      const stepValue = difference / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const newValue = startValue + (stepValue * currentStep);
        
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(interval);
          setTimeout(() => {
            setIsAnimating(false);
            setTimeout(() => setIsIncreasing(null), 1000);
          }, 200);
        } else {
          setDisplayValue(newValue);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [value, displayValue]);

  return (
    <span className={cn(
      'font-mono transition-all duration-300',
      isAnimating && 'scale-105',
      colorChange && isIncreasing === true && 'text-green-400',
      colorChange && isIncreasing === false && 'text-red-400',
      className
    )}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

export const RealTimeBalance: React.FC<RealTimeBalanceProps> = ({ className }) => {
  const balance = useRealTimeBalance();
  const [previousBalance, setPreviousBalance] = useState(balance);
  
  useEffect(() => {
    if (balance.balance !== previousBalance.balance) {
      setPreviousBalance(balance);
    }
  }, [balance, previousBalance]);
  
  const pnlColor = balance.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400';
  const pnlIcon = balance.dailyPnL >= 0 ? TrendingUp : TrendingDown;
  const PnLIcon = pnlIcon;
  
  return (
    <div className={cn(
      'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6',
      'hover:bg-white/10 transition-all duration-300',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-400" />
          Account Balance
        </h3>
        <Activity className="h-5 w-5 text-gray-400 animate-pulse" />
      </div>
      
      <div className="space-y-4">
        {/* Main Balance */}
        <div className="space-y-1">
          <p className="text-sm text-gray-400">Total Balance</p>
          <p className="text-3xl font-bold text-white">
            <AnimatedNumber 
              value={balance.balance} 
              prefix="$" 
              decimals={2}
              colorChange
            />
          </p>
        </div>
        
        {/* Equity and Margin */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Equity</p>
            <p className="text-xl font-semibold text-white">
              <AnimatedNumber 
                value={balance.equity} 
                prefix="$" 
                decimals={2}
              />
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Free Margin</p>
            <p className="text-xl font-semibold text-white">
              <AnimatedNumber 
                value={balance.freeMargin} 
                prefix="$" 
                decimals={2}
              />
            </p>
          </div>
        </div>
        
        {/* P&L Section */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Daily P&L</p>
              <p className={cn('text-xl font-semibold flex items-center gap-2', pnlColor)}>
                <PnLIcon className="h-5 w-5" />
                <AnimatedNumber 
                  value={balance.dailyPnL} 
                  prefix={balance.dailyPnL >= 0 ? '+$' : '-$'} 
                  decimals={2}
                  colorChange
                />
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-gray-400">Percentage</p>
              <p className={cn('text-lg font-semibold', pnlColor)}>
                <AnimatedNumber 
                  value={Math.abs(balance.totalPnLPercentage)} 
                  prefix={balance.totalPnLPercentage >= 0 ? '+' : '-'} 
                  suffix="%" 
                  decimals={2}
                  colorChange
                />
              </p>
            </div>
          </div>
        </div>
        
        {/* Margin Level */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Margin Level</p>
            <p className="text-sm font-semibold text-white">
              <AnimatedNumber 
                value={balance.marginLevel} 
                suffix="%" 
                decimals={1}
              />
            </p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={cn(
                'h-2 rounded-full transition-all duration-1000 ease-out',
                balance.marginLevel >= 200 ? 'bg-green-500' :
                balance.marginLevel >= 100 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ 
                width: `${Math.min(Math.max(balance.marginLevel / 5, 0), 100)}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(RealTimeBalance);