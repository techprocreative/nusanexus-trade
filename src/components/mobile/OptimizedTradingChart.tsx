import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Maximize2, Minimize2, Activity } from 'lucide-react';
import { usePerformanceMonitoring, PerformanceMeasurer } from '../../utils/mobilePerformance';
import { ChartHaptics } from '../../utils/hapticFeedback';

interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  priceChange?: number;
  formattedTime?: string;
}

interface OptimizedTradingChartProps {
  data: ChartDataPoint[];
  symbol: string;
  className?: string;
  height?: number;
  showVolume?: boolean;
  showGrid?: boolean;
  autoUpdate?: boolean;
  updateInterval?: number;
  onPriceClick?: (price: number, timestamp: number) => void;
}

export const OptimizedTradingChart: React.FC<OptimizedTradingChartProps> = ({
  data,
  symbol,
  className = '',
  height = 300,
  showVolume = false,
  showGrid = true,
  autoUpdate = true,
  updateInterval = 1000,
  onPriceClick
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isAnimating, setIsAnimating] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const { shouldOptimize, isLowPower, isSlowNetwork } = usePerformanceMonitoring();

  // Optimize data based on performance conditions
  const optimizedData = useMemo(() => {
    PerformanceMeasurer.start('chart-data-optimization');
    
    let processedData = [...data];
    
    // Reduce data points on low performance devices
    if (shouldOptimize) {
      const maxPoints = isLowPower ? 50 : isSlowNetwork ? 100 : 200;
      if (processedData.length > maxPoints) {
        const step = Math.ceil(processedData.length / maxPoints);
        processedData = processedData.filter((_, index) => index % step === 0);
      }
    }
    
    // Add derived data for chart rendering
    processedData = processedData.map((point, index) => ({
      ...point,
      formattedTime: new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      priceChange: index > 0 ? point.price - processedData[index - 1].price : 0
    }));
    
    PerformanceMeasurer.end('chart-data-optimization');
    return processedData;
  }, [data, shouldOptimize, isLowPower, isSlowNetwork]);

  // Optimize update frequency based on performance
  const effectiveUpdateInterval = useMemo(() => {
    if (isLowPower) return updateInterval * 3; // Slower updates on low battery
    if (isSlowNetwork) return updateInterval * 2; // Slower updates on slow network
    return updateInterval;
  }, [updateInterval, isLowPower, isSlowNetwork]);

  // Auto-update logic
  useEffect(() => {
    if (!autoUpdate) return;
    
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, effectiveUpdateInterval);
    
    return () => clearInterval(interval);
  }, [autoUpdate, effectiveUpdateInterval]);

  // Chart configuration based on performance
  const chartConfig = useMemo(() => {
    const baseConfig = {
      strokeWidth: shouldOptimize ? 1 : 2,
      dot: shouldOptimize ? false : { r: 2 },
      animationDuration: shouldOptimize ? 0 : 300,
      isAnimationActive: !shouldOptimize
    };
    
    return baseConfig;
  }, [shouldOptimize]);

  // Price trend calculation
  const priceTrend = useMemo(() => {
    if (optimizedData.length < 2) return 'neutral';
    const current = optimizedData[optimizedData.length - 1].price;
    const previous = optimizedData[optimizedData.length - 2].price;
    return current > previous ? 'up' : current < previous ? 'down' : 'neutral';
  }, [optimizedData]);

  const currentPrice = optimizedData[optimizedData.length - 1]?.price || 0;
  const priceChange = optimizedData[optimizedData.length - 1]?.priceChange || 0;
  const priceChangePercent = optimizedData.length > 1 
    ? ((priceChange / (currentPrice - priceChange)) * 100)
    : 0;

  const handleFullscreenToggle = () => {
    ChartHaptics.zoomIn();
    setIsFullscreen(!isFullscreen);
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const point = data.activePayload[0].payload;
      ChartHaptics.dataPointSelect();
      onPriceClick?.(point.price, point.timestamp);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.1 }}
        >
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            ${data.price.toFixed(4)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {data.formattedTime}
          </p>
          {data.volume && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Vol: {data.volume.toLocaleString()}
            </p>
          )}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      ref={chartRef}
      className={`relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      } ${className}`}
      layout
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 ${
            isAnimating ? 'animate-pulse' : ''
          }`}>
            {priceTrend === 'up' ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : priceTrend === 'down' ? (
              <TrendingDown className="w-5 h-5 text-red-500" />
            ) : (
              <Activity className="w-5 h-5 text-gray-500" />
            )}
            <span className="font-semibold text-gray-900 dark:text-white">
              {symbol}
            </span>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ${currentPrice.toFixed(4)}
            </div>
            <div className={`text-sm ${
              priceChange > 0 ? 'text-green-500' : priceChange < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(4)} ({priceChangePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
        
        <motion.button
          onClick={handleFullscreenToggle}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </motion.button>
      </div>

      {/* Chart */}
      <div className="p-4">
        <div style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={optimizedData}
              onClick={handleChartClick}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={priceTrend === 'up' ? '#10B981' : priceTrend === 'down' ? '#EF4444' : '#6B7280'} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={priceTrend === 'up' ? '#10B981' : priceTrend === 'down' ? '#EF4444' : '#6B7280'} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              
              {showGrid && (
                <>
                  <XAxis 
                    dataKey="formattedTime"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    interval={shouldOptimize ? 'preserveStartEnd' : 'preserveStart'}
                  />
                  <YAxis 
                    domain={['dataMin - 0.001', 'dataMax + 0.001']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(value) => `$${value.toFixed(3)}`}
                  />
                </>
              )}
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="price"
                stroke={priceTrend === 'up' ? '#10B981' : priceTrend === 'down' ? '#EF4444' : '#6B7280'}
                strokeWidth={chartConfig.strokeWidth}
                fill="url(#priceGradient)"
                dot={chartConfig.dot}
                isAnimationActive={chartConfig.isAnimationActive}
                animationDuration={chartConfig.animationDuration}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance indicator */}
      {shouldOptimize && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-xs text-yellow-700 dark:text-yellow-300">
              {isLowPower ? 'Battery' : 'Network'} Optimized
            </span>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default OptimizedTradingChart;