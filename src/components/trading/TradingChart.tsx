import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';
import { BarChart3, TrendingUp, TrendingDown, Maximize2, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TradingChartProps {
  symbol: string;
  className?: string;
}

type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

interface ChartData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({ symbol, className }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('5m');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  // Generate mock data for demonstration
  const generateMockData = (timeframe: TimeFrame, count: number = 100): ChartData[] => {
    const data: ChartData[] = [];
    let basePrice = 1.0850; // Base price for EURUSD
    const now = new Date();
    
    // Adjust time interval based on timeframe
    const intervals = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    
    const interval = intervals[timeframe];
    
    for (let i = count; i >= 0; i--) {
      const time = Math.floor((now.getTime() - i * interval) / 1000) as Time;
      const volatility = 0.001;
      const change = (Math.random() - 0.5) * volatility;
      
      const open = basePrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      data.push({
        time,
        open: Number(open.toFixed(5)),
        high: Number(high.toFixed(5)),
        low: Number(low.toFixed(5)),
        close: Number(close.toFixed(5)),
        volume: Math.floor(Math.random() * 1000) + 100
      });
      
      basePrice = close;
    }
    
    // Set current price and calculate change
    if (data.length > 1) {
      const latest = data[data.length - 1];
      const previous = data[data.length - 2];
      setCurrentPrice(latest.close);
      const change = latest.close - previous.close;
      setPriceChange(change);
      setPriceChangePercent((change / previous.close) * 100);
    }
    
    return data;
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#1f2937' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#4b5563',
      },
      timeScale: {
        borderColor: '#4b5563',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Load initial data
    const initialData = generateMockData(timeFrame);
    candlestickSeries.setData(initialData);
    setIsLoading(false);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update data when timeframe changes
  useEffect(() => {
    if (candlestickSeriesRef.current) {
      setIsLoading(true);
      const newData = generateMockData(timeFrame);
      candlestickSeriesRef.current.setData(newData);
      setIsLoading(false);
    }
  }, [timeFrame]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (candlestickSeriesRef.current) {
        const now = Math.floor(Date.now() / 1000) as Time;
        const lastPrice = currentPrice || 1.0850;
        const change = (Math.random() - 0.5) * 0.0001;
        const newPrice = Number((lastPrice + change).toFixed(5));
        
        // Update the last candle
        candlestickSeriesRef.current.update({
          time: now,
          open: lastPrice,
          high: Math.max(lastPrice, newPrice),
          low: Math.min(lastPrice, newPrice),
          close: newPrice,
        });
        
        setCurrentPrice(newPrice);
        setPriceChange(change);
        setPriceChangePercent((change / lastPrice) * 100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const timeFrames: { value: TimeFrame; label: string }[] = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '15m', label: '15M' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
  ];

  return (
    <div className={cn('bg-gray-800 rounded-lg border border-gray-700 p-4 flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-3 md:space-y-0">
        <div className="flex items-center justify-between md:justify-start md:space-x-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <h3 className="text-lg font-semibold text-white">{symbol}</h3>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
              <span className={cn(
                'text-lg font-mono',
                priceChange >= 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {currentPrice.toFixed(5)}
              </span>
              <span className={cn(
                'text-sm',
                priceChange >= 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(5)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          
          <button
            className="md:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-400 hover:text-white transition-colors touch-manipulation"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        
        <div className="hidden md:flex items-center space-x-3">
          <button
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center space-x-2 mb-4 bg-gray-900 rounded-lg p-2 overflow-x-auto">
        {timeFrames.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeFrame(tf.value)}
            className={cn(
              'px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap touch-manipulation',
              timeFrame === tf.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700 active:bg-gray-600'
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[300px] max-h-full bg-gray-900 rounded-lg border border-gray-600 relative overflow-hidden">
        <div ref={chartContainerRef} className="w-full h-full" />
        
        {/* Chart Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-400 text-xs md:text-sm">Loading chart...</p>
            </div>
          </div>
        )}
        
        {/* Mobile Chart Controls Overlay */}
        <div className="md:hidden absolute top-3 right-3 flex space-x-2">
          <button
            className="p-2 bg-gray-800/80 rounded-lg text-gray-400 hover:text-white transition-colors touch-manipulation"
            title="Chart Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chart Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-700 text-xs text-gray-400 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span>Volume: 1,234,567</span>
          <span>Spread: 0.3 pips</span>
          <span className="hidden md:inline">Last update: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>
    </div>
  );
};