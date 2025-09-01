import React, { memo } from 'react';
import { TrendingUp, TrendingDown, Clock, Target, DollarSign } from 'lucide-react';
import { Trade } from '../../types';
import { cn } from '../../lib/utils';
import VirtualScrollList from '../ui/VirtualScrollList';

interface LivePositionsPanelProps {
  positions: Trade[];
  loading?: boolean;
  className?: string;
  maxItems?: number;
  compact?: boolean;
  useVirtualScrolling?: boolean;
  containerHeight?: number;
}

interface PositionItemProps {
  position: Trade;
  compact?: boolean;
}

const PositionItem: React.FC<PositionItemProps> = memo(({ position, compact = false }) => {
  const isProfitable = position.currentPnL >= 0;
  const isBuy = position.tradeType === 'buy';
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number, symbol: string) => {
    // Different decimal places for different currency pairs
    const decimals = symbol.includes('JPY') ? 3 : 5;
    return price.toFixed(decimals);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'w-2 h-2 rounded-full',
            isBuy ? 'bg-green-500' : 'bg-red-500'
          )} />
          <div>
            <p className="text-sm font-medium text-gray-900">{position.symbol}</p>
            <p className="text-xs text-gray-500">
              {isBuy ? 'BUY' : 'SELL'} {position.volume}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            'text-sm font-medium',
            isProfitable ? 'text-green-600' : 'text-red-600'
          )}>
            {isProfitable ? '+' : ''}{formatCurrency(position.currentPnL)}
          </p>
        </div>
      </div>
    );
  }

  return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={cn(
            'px-2 py-1 rounded text-xs font-medium',
            isBuy 
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          )}>
            {isBuy ? 'BUY' : 'SELL'}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{position.symbol}</h3>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatTime(position.openTime)}</span>
        </div>
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Volume</p>
          <p className="text-sm font-medium text-gray-900">{position.volume}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Open Price</p>
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(position.openPrice, position.symbol)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Price</p>
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(position.currentPrice || position.openPrice, position.symbol)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">P&L</p>
          <p className={cn(
            'text-sm font-medium flex items-center space-x-1',
            isProfitable ? 'text-green-600' : 'text-red-600'
          )}>
            {isProfitable ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {isProfitable ? '+' : ''}{formatCurrency(position.currentPnL)}
            </span>
          </p>
        </div>
      </div>

      {/* Stop Loss & Take Profit */}
      {(position.stopLoss || position.takeProfit) && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          {position.stopLoss && (
            <div className="flex items-center space-x-1 text-xs">
              <Target className="w-3 h-3 text-red-600" />
              <span className="text-gray-500">SL:</span>
              <span className="text-red-600">
                {formatPrice(position.stopLoss, position.symbol)}
              </span>
            </div>
          )}
          {position.takeProfit && (
            <div className="flex items-center space-x-1 text-xs">
              <Target className="w-3 h-3 text-green-600" />
              <span className="text-gray-500">TP:</span>
              <span className="text-green-600">
                {formatPrice(position.takeProfit, position.symbol)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

PositionItem.displayName = 'PositionItem';

const LivePositionsPanel: React.FC<LivePositionsPanelProps> = ({
  positions,
  loading = false,
  className,
  maxItems = 10,
  compact = false,
  useVirtualScrolling = false,
  containerHeight = 400
}) => {
  
  const displayPositions = positions.slice(0, maxItems);
  const totalPnL = positions.reduce((sum, pos) => sum + pos.currentPnL, 0);
  const profitablePositions = positions.filter(pos => pos.currentPnL >= 0).length;

  if (loading) {
    return (
      <div className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 p-6',
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span>Live Positions</span>
          </h2>
          <div className="text-xs text-gray-500">
            Loading...
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 p-6',
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span>Live Positions</span>
          </h2>
          <div className="text-xs text-gray-500">
            0 Active
          </div>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No active positions</p>
          <p className="text-gray-400 text-xs mt-1">Open a trade to see live position updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white rounded-2xl shadow-sm border border-gray-100 p-6',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          <span>Live Positions</span>
        </h2>
        <div className="flex items-center space-x-4 text-xs">
          <div className="text-gray-500">
            {positions.length} Active
          </div>
          <div className={cn(
            'font-medium',
            totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {!compact && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-100 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Total Positions</p>
            <p className="text-lg font-semibold text-gray-900">{positions.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Profitable</p>
            <p className="text-lg font-semibold text-green-600">{profitablePositions}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Losing</p>
            <p className="text-lg font-semibold text-red-600">{positions.length - profitablePositions}</p>
          </div>
        </div>
      )}

      {/* Positions List */}
      {useVirtualScrolling && positions.length > 20 ? (
        <VirtualScrollList
          items={displayPositions}
          itemHeight={compact ? 80 : 160}
          containerHeight={containerHeight}
          renderItem={(position) => (
            <PositionItem
              key={position.id}
              position={position}
              compact={compact}
            />
          )}
          className="space-y-3"
          emptyComponent={
            <div className="text-center py-8">
              <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No positions found</p>
            </div>
          }
        />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {displayPositions.map((position) => (
            <PositionItem
              key={position.id}
              position={position}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Show More Indicator */}
      {positions.length > maxItems && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            +{positions.length - maxItems} more positions
          </p>
        </div>
      )}
    </div>
  );
};

export default memo(LivePositionsPanel);