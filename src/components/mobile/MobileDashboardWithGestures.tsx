import React, { useState, useCallback } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { animated } from '@react-spring/web';
import { usePullToRefresh, useSwipeNavigation } from '../../hooks/useGestures';

interface DashboardData {
  totalBalance: number;
  todayPnL: number;
  todayPnLPercent: number;
  positions: number;
  activeOrders: number;
  portfolioValue: number;
  dayChange: number;
  dayChangePercent: number;
}

interface MobileDashboardWithGesturesProps {
  onNavigate?: (section: string) => void;
}

const MobileDashboardWithGestures: React.FC<MobileDashboardWithGesturesProps> = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalBalance: 125430.50,
    todayPnL: 2340.75,
    todayPnLPercent: 1.87,
    positions: 8,
    activeOrders: 3,
    portfolioValue: 123089.75,
    dayChange: 1876.25,
    dayChangePercent: 1.55
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate data refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update with mock new data
    setDashboardData(prev => ({
      ...prev,
      totalBalance: prev.totalBalance + (Math.random() - 0.5) * 1000,
      todayPnL: prev.todayPnL + (Math.random() - 0.5) * 500,
      todayPnLPercent: prev.todayPnLPercent + (Math.random() - 0.5) * 2,
      dayChange: prev.dayChange + (Math.random() - 0.5) * 300,
      dayChangePercent: prev.dayChangePercent + (Math.random() - 0.5) * 1
    }));
    
    setIsRefreshing(false);
  }, []);

  // Handle swipe navigation between dashboard sections
  const handleSwipeLeft = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, 2));
  }, []);

  const handleSwipeRight = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  }, []);

  // Setup gestures
  const { bind: pullBind, refreshSpring, gestureState } = usePullToRefresh(handleRefresh);
  const { bind: swipeBind } = useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 80
  });

  // Combine gesture bindings
  const combinedBind = {
    ...pullBind(),
    ...swipeBind()
  };

  const pages = [
    {
      title: 'Portfolio Overview',
      content: (
        <div className="space-y-4">
          {/* Balance Card */}
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Total Balance</p>
              <h2 className="text-3xl font-bold text-white mb-4">
                ${dashboardData.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <div className={`flex items-center justify-center space-x-2 ${
                dashboardData.todayPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {dashboardData.todayPnL >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                <span className="font-semibold">
                  {dashboardData.todayPnL >= 0 ? '+' : ''}${Math.abs(dashboardData.todayPnL).toFixed(2)} 
                  ({dashboardData.todayPnLPercent >= 0 ? '+' : ''}{dashboardData.todayPnLPercent.toFixed(2)}%)
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-2">Today's P&L</p>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="glass-card p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={() => onNavigate?.('positions')}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <PieChart className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{dashboardData.positions}</p>
                  <p className="text-gray-400 text-sm">Positions</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="glass-card p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={() => onNavigate?.('orders')}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="text-orange-400" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{dashboardData.activeOrders}</p>
                  <p className="text-gray-400 text-sm">Active Orders</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: 'Performance',
      content: (
        <div className="space-y-4">
          <motion.div 
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-white font-semibold mb-4">Portfolio Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Portfolio Value</span>
                <span className="text-white font-semibold">
                  ${dashboardData.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Day Change</span>
                <span className={`font-semibold ${
                  dashboardData.dayChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {dashboardData.dayChange >= 0 ? '+' : ''}${Math.abs(dashboardData.dayChange).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Day Change %</span>
                <span className={`font-semibold ${
                  dashboardData.dayChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {dashboardData.dayChangePercent >= 0 ? '+' : ''}{dashboardData.dayChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: 'Quick Actions',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              className="glass-card p-6 text-center hover:bg-gray-800/50 transition-colors"
              onClick={() => onNavigate?.('trading')}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <TrendingUp className="text-green-400 mx-auto mb-3" size={32} />
              <p className="text-white font-semibold">Buy</p>
              <p className="text-gray-400 text-sm">Place buy order</p>
            </motion.button>

            <motion.button
              className="glass-card p-6 text-center hover:bg-gray-800/50 transition-colors"
              onClick={() => onNavigate?.('trading')}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <TrendingDown className="text-red-400 mx-auto mb-3" size={32} />
              <p className="text-white font-semibold">Sell</p>
              <p className="text-gray-400 text-sm">Place sell order</p>
            </motion.button>

            <motion.button
              className="glass-card p-6 text-center hover:bg-gray-800/50 transition-colors"
              onClick={() => onNavigate?.('portfolio')}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <PieChart className="text-blue-400 mx-auto mb-3" size={32} />
              <p className="text-white font-semibold">Portfolio</p>
              <p className="text-gray-400 text-sm">View holdings</p>
            </motion.button>

            <motion.button
              className="glass-card p-6 text-center hover:bg-gray-800/50 transition-colors"
              onClick={() => onNavigate?.('analysis')}
              whileTap={ { scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Activity className="text-purple-400 mx-auto mb-3" size={32} />
              <p className="text-white font-semibold">Analysis</p>
              <p className="text-gray-400 text-sm">Market insights</p>
            </motion.button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Pull to Refresh Indicator */}
      <animated.div
        style={refreshSpring}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg"
      >
        <RefreshCw 
          size={16} 
          className={`${gestureState.isRefreshing || isRefreshing ? 'animate-spin' : ''}`} 
        />
        <span className="text-sm font-medium">
          {gestureState.isRefreshing || isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </span>
      </animated.div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-gray-800 safe-top">
        <div className="mobile-container py-4">
          <h1 className="text-xl font-bold text-white">{pages[currentPage].title}</h1>
          
          {/* Page Indicators */}
          <div className="flex justify-center space-x-2 mt-3">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentPage ? 'bg-blue-500 w-6' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content with Gesture Support */}
      <div {...combinedBind} className="mobile-container pb-safe-bottom touch-pan-x">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="py-4"
          >
            {pages[currentPage].content}
          </motion.div>
        </AnimatePresence>
        
        {/* Swipe Hint */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Swipe left/right to navigate • Pull down to refresh
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboardWithGestures;