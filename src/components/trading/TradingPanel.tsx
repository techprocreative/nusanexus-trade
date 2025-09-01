import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Shield,
  Target,
  AlertTriangle,
  DollarSign,
  Percent,
  BarChart3
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface TradingPanelProps {
  symbol: string;
  className?: string;
  symbolInputRef?: React.RefObject<HTMLInputElement>;
  volumeInputRef?: React.RefObject<HTMLInputElement>;
}

type OrderType = 'market' | 'limit' | 'stop';
type OrderSide = 'buy' | 'sell';

const orderSchema = z.object({
  orderType: z.enum(['market', 'limit', 'stop']),
  side: z.enum(['buy', 'sell']),
  volume: z.number().min(0.01).max(100),
  price: z.number().optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  riskPercent: z.number().min(0.1).max(10).optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export interface TradingPanelRef {
  executeBuy: () => void;
  executeSell: () => void;
  cancelOrder: () => void;
}

export const TradingPanel = forwardRef<TradingPanelRef, TradingPanelProps>(({ 
  symbol, 
  className, 
  symbolInputRef, 
  volumeInputRef 
}, ref) => {
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [oneClickTrading, setOneClickTrading] = useState(false);
  const [riskCalculatorOpen, setRiskCalculatorOpen] = useState(false);
  const [currentPrice] = useState(1.08542); // Mock current price
  const [accountBalance] = useState(10000); // Mock account balance

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderType: 'market',
      side: 'buy',
      volume: 0.01,
      riskPercent: 2
    }
  });

  const watchedValues = watch();

  // Calculate position size based on risk percentage
  const calculatePositionSize = (riskPercent: number, stopLossPips: number) => {
    if (!riskPercent || !stopLossPips) return 0;
    const riskAmount = accountBalance * (riskPercent / 100);
    const pipValue = 10; // Assuming standard lot for EURUSD
    return Number((riskAmount / (stopLossPips * pipValue)).toFixed(2));
  };

  // Calculate stop loss in pips
  const calculateStopLossPips = () => {
    if (!watchedValues.stopLoss) return 0;
    const pips = Math.abs(currentPrice - watchedValues.stopLoss) * 10000;
    return Number(pips.toFixed(1));
  };

  // Calculate potential profit/loss
  const calculatePnL = () => {
    const volume = watchedValues.volume || 0;
    const pipValue = volume * 10;
    const stopLossPips = calculateStopLossPips();
    const takeProfitPips = watchedValues.takeProfit 
      ? Math.abs(watchedValues.takeProfit - currentPrice) * 10000 
      : 0;

    return {
      maxLoss: stopLossPips * pipValue,
      maxProfit: takeProfitPips * pipValue,
      riskReward: takeProfitPips && stopLossPips ? (takeProfitPips / stopLossPips).toFixed(2) : '0'
    };
  };

  const pnl = calculatePnL();

  const onSubmit = (data: OrderFormData) => {
    console.log('Order submitted:', data);
    // Here you would integrate with your trading API
  };

  const executeBuy = () => {
    setOrderSide('buy');
    setValue('side', 'buy');
    if (oneClickTrading) {
      handleSubmit(onSubmit)();
    }
  };

  const executeSell = () => {
    setOrderSide('sell');
    setValue('side', 'sell');
    if (oneClickTrading) {
      handleSubmit(onSubmit)();
    }
  };

  const cancelOrder = () => {
    // Reset form or cancel pending orders
    console.log('Order cancelled');
  };

  useImperativeHandle(ref, () => ({
    executeBuy,
    executeSell,
    cancelOrder
  }));

  const currencyPairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP'
  ];

  return (
    <div className={cn('bg-gray-800 rounded-lg border border-gray-700 p-3 md:p-4 h-full flex flex-col', className)}>
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-semibold text-white">Trading Panel</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRiskCalculatorOpen(!riskCalculatorOpen)}
            className={cn(
              'p-1.5 md:p-2 rounded-lg transition-colors touch-manipulation',
              riskCalculatorOpen ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            )}
            title="Risk Calculator"
          >
            <Calculator className="h-3 w-3 md:h-4 md:w-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col space-y-3 md:space-y-4 overflow-y-auto">
        {/* Currency Pair Selector */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-400 mb-1.5">
            Currency Pair
          </label>
          <input
            ref={symbolInputRef}
            type="text"
            defaultValue={symbol}
            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 touch-manipulation"
            placeholder="EURUSD"
          />
        </div>

        {/* Order Type Selector */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-400 mb-1.5">
            Order Type
          </label>
          <div className="grid grid-cols-3 gap-1.5 md:gap-2">
            {(['market', 'limit', 'stop'] as OrderType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setOrderType(type);
                  setValue('orderType', type);
                }}
                className={cn(
                  'py-1.5 md:py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-colors capitalize touch-manipulation',
                  orderType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Price Input (for limit/stop orders) */}
        {orderType !== 'market' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Price
            </label>
            <input
              type="number"
              step="0.00001"
              placeholder={currentPrice.toFixed(5)}
              {...register('price', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            {errors.price && (
              <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
            )}
          </div>
        )}

        {/* Volume Input */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-400 mb-1.5">
            Volume (Lots)
          </label>
          <input
              ref={volumeInputRef}
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              {...register('volume', { valueAsNumber: true })}
              className="w-full px-2.5 md:px-3 py-1.5 md:py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 touch-manipulation"
            />
          {errors.volume && (
            <p className="text-red-400 text-xs mt-1">{errors.volume.message}</p>
          )}
        </div>

        {/* Risk Management */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-400">Risk Management</span>
          </div>

          {/* Risk Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Risk % of Account
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              {...register('riskPercent', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Stop Loss */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Stop Loss
            </label>
            <input
              type="number"
              step="0.00001"
              placeholder="0.00000"
              {...register('stopLoss', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Take Profit */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Take Profit
            </label>
            <input
              type="number"
              step="0.00001"
              placeholder="0.00000"
              {...register('takeProfit', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Risk Calculator */}
        {riskCalculatorOpen && (
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Risk Analysis
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Stop Loss (pips):</span>
                <span className="text-white">{calculateStopLossPips()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Loss:</span>
                <span className="text-red-400">-${pnl.maxLoss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Profit:</span>
                <span className="text-green-400">+${pnl.maxProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk:Reward:</span>
                <span className="text-white">1:{pnl.riskReward}</span>
              </div>
            </div>
          </div>
        )}

        {/* One-Click Trading Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-400">One-Click Trading</span>
          </div>
          <button
            type="button"
            onClick={() => setOneClickTrading(!oneClickTrading)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              oneClickTrading ? 'bg-blue-600' : 'bg-gray-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                oneClickTrading ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Buy/Sell Buttons */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mt-auto">
          <button
            type="button"
            onClick={executeBuy}
            disabled={isSubmitting}
            className="flex items-center justify-center space-x-1.5 md:space-x-2 py-3 md:py-4 px-3 md:px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors touch-manipulation min-h-[48px] md:min-h-[60px]"
          >
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-sm md:text-base">BUY</span>
          </button>
          
          <button
            type="button"
            onClick={executeSell}
            disabled={isSubmitting}
            className="flex items-center justify-center space-x-1.5 md:space-x-2 py-3 md:py-4 px-3 md:px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors touch-manipulation min-h-[48px] md:min-h-[60px]"
          >
            <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-sm md:text-base">SELL</span>
          </button>
        </div>

        {/* Submit Button (for non-one-click trading) */}
        {!oneClickTrading && (
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-medium transition-colors',
              orderSide === 'buy'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Processing...' : `Execute ${orderSide.toUpperCase()} Order`}
          </button>
        )}
      </form>

      {/* Current Market Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400">Current Price:</span>
            <p className="text-white font-medium">{currentPrice.toFixed(5)}</p>
          </div>
          <div>
            <span className="text-gray-400">Spread:</span>
            <p className="text-white font-medium">0.3 pips</p>
          </div>
          <div>
            <span className="text-gray-400">Account Balance:</span>
            <p className="text-white font-medium">{accountBalance.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-400">Free Margin:</span>
            <p className="text-white font-medium">{(accountBalance * 0.8).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

TradingPanel.displayName = 'TradingPanel';