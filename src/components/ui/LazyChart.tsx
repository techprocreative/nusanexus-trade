import React, { Suspense, lazy, useEffect, useState, useRef, memo } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple chart component that imports recharts directly
const ChartComponent = lazy(() => 
  import('recharts').then(module => ({
    default: ({ data, xAxisKey = 'date', yAxisKey = 'value', height = 300, color = '#3b82f6' }: any) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = module;
      
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              opacity={0.3} 
            />
            <XAxis 
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Line 
              type="monotone"
              dataKey={yAxisKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  }))
);

interface LazyLineChartProps {
  data: any[];
  xAxisKey?: string;
  yAxisKey?: string;
  className?: string;
  height?: number;
  color?: string;
}

// Hook for intersection observer
const useIntersectionObserver = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// Loading skeleton component
const ChartLoadingSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div 
    className="bg-gray-800 rounded-lg border border-gray-700 p-4 animate-pulse"
    style={{ height }}
  >
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center space-x-2 text-gray-500">
        <BarChart3 className="h-6 w-6 animate-pulse" />
        <span className="text-sm">Loading chart...</span>
      </div>
    </div>
  </div>
);

// Error fallback component
const ChartErrorFallback: React.FC<{ height: number; onRetry?: () => void }> = ({ 
  height, 
  onRetry 
}) => (
  <div 
    className="bg-gray-800 rounded-lg border border-red-500/30 p-4"
    style={{ height }}
  >
    <div className="flex flex-col items-center justify-center h-full space-y-2">
      <TrendingUp className="h-6 w-6 text-red-400" />
      <span className="text-sm text-red-400">Failed to load chart</span>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

const LazyLineChart: React.FC<LazyLineChartProps> = memo(({ 
  data, 
  xAxisKey = 'date', 
  yAxisKey = 'value',
  className,
  height = 300,
  color = '#3b82f6'
}) => {
  const { ref, isVisible } = useIntersectionObserver(0.1);
  const [hasError, setHasError] = useState(false);

  const handleRetry = () => {
    setHasError(false);
  };

  if (!isVisible) {
    return (
      <div ref={ref} className={cn('w-full', className)}>
        <ChartLoadingSkeleton height={height} />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={cn('w-full', className)}>
        <ChartErrorFallback height={height} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className={cn('bg-gray-800 rounded-lg border border-gray-700 p-4', className)}>
      <Suspense fallback={<ChartLoadingSkeleton height={height} />}>
        <ChartComponent 
          data={data}
          xAxisKey={xAxisKey}
          yAxisKey={yAxisKey}
          height={height}
          color={color}
        />
      </Suspense>
    </div>
  );
});

LazyLineChart.displayName = 'LazyLineChart';

interface LazyChartProps {
  data: any[];
  type?: 'line' | 'bar' | 'area';
  xAxisKey?: string;
  yAxisKey?: string;
  className?: string;
  height?: number;
  color?: string;
  title?: string;
}

// Main LazyChart component
const LazyChart: React.FC<LazyChartProps> = memo(({ 
  data,
  type = 'line',
  xAxisKey,
  yAxisKey,
  className,
  height,
  color,
  title
}) => {
  // For now, only support line charts
  // Can be extended to support other chart types
  if (type === 'line') {
    return (
      <div className={className}>
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        )}
        <LazyLineChart 
          data={data}
          xAxisKey={xAxisKey}
          yAxisKey={yAxisKey}
          height={height}
          color={color}
        />
      </div>
    );
  }

  return (
    <div className={cn('bg-gray-800 rounded-lg border border-gray-700 p-4', className)}>
      <div className="flex items-center justify-center h-32">
        <span className="text-gray-400">Chart type not supported yet</span>
      </div>
    </div>
  );
});

LazyChart.displayName = 'LazyChart';

export default LazyChart;
export { LazyLineChart, ChartLoadingSkeleton, ChartErrorFallback };