import React, { useState } from 'react';
import { TrendingUp, TrendingDown, RotateCcw, Zap, DollarSign, Percent } from 'lucide-react';
import { motion, PanInfo } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { TradingHaptics, NavigationHaptics } from '../../utils/hapticFeedback';

interface MobileTradingInterfaceProps {
  symbol: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  onPlaceOrder: (order: {
    type: 'buy' | 'sell';
    amount: number;
    orderType: 'market' | 'limit';
    limitPrice?: number;
  }) => void;
}

const MobileTradingInterface: React.FC<MobileTradingInterfaceProps> = ({
  symbol,
  currentPrice,
  priceChange,
  priceChangePercent,
  onPlaceOrder
}) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState<string>('100');
  const [limitPrice, setLimitPrice] = useState<string>(currentPrice.toString());
  const [quickAmounts] = useState([50, 100, 250, 500, 1000]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickAmount = (value: number) => {
    NavigationHaptics.buttonPress();
    setAmount(value.toString());
  };

  const handleOrderTypeToggle = () => {
    NavigationHaptics.tap();
    setOrderType(orderType === 'market' ? 'limit' : 'market');
  };

  const handlePlaceOrder = async (type: 'buy' | 'sell') => {
    TradingHaptics.orderPlaced();
    setIsProcessing(true);
    
    try {
      await onPlaceOrder({
        type,
        amount: parseFloat(amount),
        orderType,
        limitPrice: orderType === 'limit' ? parseFloat(limitPrice) : undefined
      });
      
      // Success feedback
      TradingHaptics.orderFilled();
    } catch (error) {
      // Error feedback
      TradingHaptics.orderRejected();
    } finally {
      setIsProcessing(false);
    }
  };

  // Swipe gesture for quick buy/sell
  const bind = useGesture({
    onDrag: ({ movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
      const threshold = 100;
      const velocityThreshold = 0.5;
      
      if (Math.abs(mx) > threshold || Math.abs(vx) > velocityThreshold) {
        cancel();
        NavigationHaptics.swipe();
        
        if (mx > 0) {
          // Swipe right - Buy
          handlePlaceOrder('buy');
        } else {
          // Swipe left - Sell
          handlePlaceOrder('sell');
        }
      }
    }
  }, {
    drag: {
      axis: 'x'
    }
  });

  const isPositive = priceChange >= 0;

  return (
    <div className="mobile-container py-4 space-y-6">
      {/* Price Display */}
      <motion.div 
        className="glass-card p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">{symbol}</h2>
        <div className="text-4xl font-bold text-white mb-2">
          ${currentPrice.toFixed(2)}
        </div>
        <div className={`flex items-center justify-center space-x-2 ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          <span className="font-semibold">
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
          </span>
        </div>
      </motion.div>

      {/* Order Type Toggle */}
      <motion.div 
        className="flex bg-gray-800 rounded-xl p-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <button
          onClick={handleOrderTypeToggle}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            orderType === 'market'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap size={16} className="inline mr-2" />
          Market
        </button>
        <button
          onClick={handleOrderTypeToggle}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            orderType === 'limit'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <DollarSign size={16} className="inline mr-2" />
          Limit
        </button>
      </motion.div>

      {/* Amount Input */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <label className="block text-gray-300 font-medium mb-2">
          Amount (USD)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mobile-input w-full bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder="Enter amount"
        />
        
        {/* Quick Amount Buttons */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {quickAmounts.map((value) => (
            <motion.button
              key={value}
              onClick={() => handleQuickAmount(value)}
              className={`touch-button flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                amount === value.toString()
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              ${value}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Limit Price Input (if limit order) */}
      {orderType === 'limit' && (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className="block text-gray-300 font-medium mb-2">
            Limit Price
          </label>
          <input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="mobile-input w-full bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter limit price"
            step="0.01"
          />
        </motion.div>
      )}

      {/* Swipe Trading Area */}
      <motion.div 

        className="glass-card p-6 cursor-grab active:cursor-grabbing touch-pan-x"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-center text-gray-300 mb-4">
          <RotateCcw size={24} className="mx-auto mb-2" />
          <p className="text-sm font-medium">Swipe left to sell, right to buy</p>
          <p className="text-xs text-gray-500 mt-1">Or use buttons below</p>
        </div>
        
        <div className="flex space-x-4">
          {/* Sell Button */}
          <motion.button
            onClick={() => handlePlaceOrder('sell')}
            disabled={isProcessing}
            className="touch-button flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            <TrendingDown size={20} />
            <span>{isProcessing ? 'Processing...' : 'SELL'}</span>
          </motion.button>
          
          {/* Buy Button */}
          <motion.button
            onClick={() => handlePlaceOrder('buy')}
            disabled={isProcessing}
            className="touch-button flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            <TrendingUp size={20} />
            <span>{isProcessing ? 'Processing...' : 'BUY'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Order Summary */}
      <motion.div 
        className="glass-card p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <h3 className="text-white font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Type:</span>
            <span className="capitalize">{orderType}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Amount:</span>
            <span>${amount || '0'}</span>
          </div>
          {orderType === 'limit' && (
            <div className="flex justify-between text-gray-300">
              <span>Limit Price:</span>
              <span>${limitPrice || '0'}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-300 pt-2 border-t border-gray-700">
            <span>Est. Shares:</span>
            <span>
              {amount && currentPrice ? 
                (parseFloat(amount) / (orderType === 'limit' ? parseFloat(limitPrice) || currentPrice : currentPrice)).toFixed(4)
                : '0'
              }
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileTradingInterface;