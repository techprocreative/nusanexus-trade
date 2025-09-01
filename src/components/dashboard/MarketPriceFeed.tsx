import React, { useState, useEffect, memo } from 'react';
import { TrendingUp, TrendingDown, Activity, Globe } from 'lucide-react';
import { useMajorPairs } from '../../store/useWebSocketStore';
import { MarketData } from '../../types';
import { cn } from '../../lib/utils';

interface MarketPriceFeedProps {
  className?: string;
  compact?: boolean;
}

interface PriceTickerProps {
  symbol: string;
  data: MarketData | undefined;
  className?: string;
}

const PriceTicker: React.FC<PriceTickerProps> = ({ symbol, data, className }) => {
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  
  useEffect(() => {
    if (data && previousPrice !== null && data.bid !== previousPrice) {
      setPriceDirection(data.bid > previousPrice ? 'up' : 'down');
      setFlashKey(prev => prev + 1);
      
      // Reset direction after animation
      const timer = setTimeout(() => setPriceDirection(null), 1000);
      return () => clearTimeout(timer);
    }
    if (data) {
      setPreviousPrice(data.bid);
    }
  }, [data, previousPrice]);
  
  if (!data) {
    return (
      <div className={cn(
        'bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4',
        'animate-pulse',
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-600 rounded w-16" />
            <div className="h-6 bg-gray-600 rounded w-20" />
          </div>
          <div className="h-8 w-8 bg-gray-600 rounded" />
        </div>
      </div>
    );
  }
  
  const isPositive = data.change >= 0;
  const spread = data.ask - data.bid;
  
  return (
    <div className={cn(
      'relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4',
      'hover:bg-white/10 transition-all duration-300',
      'overflow-hidden',
      className
    )}>
      {/* Flash Animation */}
      {priceDirection && (
        <div 
          key={flashKey}
          className={cn(
            'absolute inset-0 pointer-events-none',
            'animate-ping opacity-20 rounded-lg',
            priceDirection === 'up' ? 'bg-green-400' : 'bg-red-400'
          )}
          style={{ animationDuration: '0.5s', animationIterationCount: 1 }}
        />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white text-lg">{symbol}</h4>
            <div className={cn(
              'h-2 w-2 rounded-full animate-pulse',
              'bg-blue-400'
            )} />
          </div>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className={cn(
                'h-4 w-4 text-green-400',
                priceDirection === 'up' && 'animate-bounce'
              )} />
            ) : (
              <TrendingDown className={cn(
                'h-4 w-4 text-red-400',
                priceDirection === 'down' && 'animate-bounce'
              )} />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          {/* Bid/Ask Prices */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Bid</p>
              <p className={cn(
                'font-mono text-xl font-bold transition-all duration-300',
                priceDirection === 'up' ? 'text-green-400 scale-105' :
                priceDirection === 'down' ? 'text-red-400 scale-105' :
                'text-white'
              )}>
                {data.bid.toFixed(symbol === 'USDJPY' ? 2 : 4)}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Ask</p>
              <p className={cn(
                'font-mono text-xl font-bold transition-all duration-300',
                priceDirection === 'up' ? 'text-green-400 scale-105' :
                priceDirection === 'down' ? 'text-red-400 scale-105' :
                'text-white'
              )}>
                {data.ask.toFixed(symbol === 'USDJPY' ? 2 : 4)}
              </p>
            </div>
          </div>
          
          {/* Change and Spread */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm font-semibold',
                isPositive ? 'text-green-400' : 'text-red-400'
              )}>
                {isPositive ? '+' : ''}{data.change.toFixed(symbol === 'USDJPY' ? 2 : 4)}
              </span>
              <span className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded',
                isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              )}>
                {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Spread</p>
              <p className="text-sm font-mono text-white">
                {spread.toFixed(symbol === 'USDJPY' ? 2 : 4)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MarketPriceFeed: React.FC<MarketPriceFeedProps> = ({ 
  className, 
  compact = false 
}) => {
  const majorPairs = useMajorPairs();
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      setLastUpdateTime(new Date().toLocaleTimeString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (compact) {
    return (
      <div className={cn(
        'bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4',
        className
      )}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-400" />
            Major Pairs
          </h3>
          <Activity className="h-4 w-4 text-gray-400 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          {Object.entries(majorPairs).map(([symbol, data]) => (
            <div key={symbol} className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{symbol}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-white">
                  {data?.bid.toFixed(symbol === 'USDJPY' ? 2 : 4) || '---'}
                </span>
                {data && (
                  <span className={cn(
                    'text-xs',
                    data.change >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {data.change >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      'bg-gradient-to-br from-blue-900/20 to-purple-900/20',
      'backdrop-blur-sm border border-white/10 rounded-xl p-6',
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-400" />
          Market Price Feed
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Activity className="h-4 w-4 animate-pulse" />
          <span>Live • {lastUpdateTime}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PriceTicker symbol="EURUSD" data={majorPairs.EURUSD} />
        <PriceTicker symbol="GBPUSD" data={majorPairs.GBPUSD} />
        <PriceTicker symbol="USDJPY" data={majorPairs.USDJPY} />
      </div>
      
      {/* Market Status */}
      <div className="mt-6 flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-white">Market Open</span>
        </div>
        <div className="text-sm text-gray-400">
          Next update in real-time
        </div>
      </div>
    </div>
  );
};

export default memo(MarketPriceFeed);