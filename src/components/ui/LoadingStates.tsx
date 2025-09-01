import React from 'react';
import { Loader2, Wifi, WifiOff, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Size variants for loading components */
type ComponentSize = 'sm' | 'md' | 'lg';

/** Connection status types */
type ConnectionStatus = 'connecting' | 'reconnecting' | 'failed';

/** Skeleton variant types */
type SkeletonVariant = 'text' | 'rectangular' | 'circular';

/** Base props interface for all loading components */
interface BaseLoadingProps {
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

interface LoadingSpinnerProps extends BaseLoadingProps {
  /** Size of the spinner */
  size?: ComponentSize;
  /** Custom color class */
  color?: string;
}

/**
 * A customizable loading spinner component
 * @param size - Size variant of the spinner
 * @param className - Additional CSS classes
 * @param color - Custom color class (defaults to text-blue-500)
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  color = 'text-blue-500'
}) => {
  const sizeClasses: Record<ComponentSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  } as const;

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        color,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

interface SkeletonProps extends BaseLoadingProps {
  /** Visual variant of the skeleton */
  variant?: SkeletonVariant;
  /** Width of the skeleton (string or number in pixels) */
  width?: string | number;
  /** Height of the skeleton (string or number in pixels) */
  height?: string | number;
  /** Whether to show pulse animation */
  animate?: boolean;
}

/**
 * A skeleton loading placeholder component
 * @param className - Additional CSS classes
 * @param variant - Visual style variant
 * @param width - Width of the skeleton
 * @param height - Height of the skeleton
 * @param animate - Whether to show pulse animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  animate = true
}) => {
  const baseClasses = 'bg-gray-700';
  
  const variantClasses: Record<SkeletonVariant, string> = {
    text: 'rounded h-4',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  } as const;

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div 
      className={cn(
        baseClasses,
        animate && 'animate-pulse',
        variantClasses[variant],
        className
      )}
      style={style}
      role="status"
      aria-label="Loading content"
    />
  );
};

// ============================================================================
// CONNECTION LOADING COMPONENT
// ============================================================================

interface ConnectionLoadingProps extends BaseLoadingProps {
  /** Current connection status */
  status: ConnectionStatus;
  /** Show status text alongside icon */
  showText?: boolean;
}

/**
 * Connection status indicator with loading states
 * @param status - Current connection status
 * @param className - Additional CSS classes
 * @param showText - Whether to display status text
 */
export const ConnectionLoading: React.FC<ConnectionLoadingProps> = ({ 
  status, 
  className,
  showText = true
}) => {
  const statusConfig: Record<ConnectionStatus, {
    icon: React.ReactNode;
    message: string;
    colorClass: string;
  }> = {
    connecting: {
      icon: <Wifi className="h-4 w-4 animate-pulse" />,
      message: 'Connecting...',
      colorClass: 'text-yellow-400'
    },
    reconnecting: {
      icon: <Wifi className="h-4 w-4 animate-pulse" />,
      message: 'Reconnecting...',
      colorClass: 'text-yellow-400'
    },
    failed: {
      icon: <WifiOff className="h-4 w-4" />,
      message: 'Connection failed',
      colorClass: 'text-red-400'
    }
  } as const;

  const config = statusConfig[status];

  return (
    <div 
      className={cn('flex items-center space-x-2', className)}
      role="status"
      aria-label={config.message}
    >
      <div className={config.colorClass}>
        {config.icon}
      </div>
      {showText && (
        <span className={cn('text-sm', config.colorClass)}>
          {config.message}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// DATA LOADING CARD COMPONENTS
// ============================================================================

interface DataLoadingCardProps extends BaseLoadingProps {
  /** Card title */
  title: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Whether to show pulse animation */
  showPulse?: boolean;
  /** Number of skeleton lines to show */
  skeletonLines?: number;
}

/**
 * Generic data loading card with customizable content
 * @param title - Card title
 * @param icon - Optional icon
 * @param className - Additional CSS classes
 * @param showPulse - Whether to show pulse animation
 * @param skeletonLines - Number of skeleton lines to display
 */
export const DataLoadingCard: React.FC<DataLoadingCardProps> = ({ 
  title, 
  icon, 
  className,
  showPulse = true,
  skeletonLines = 2
}) => {
  return (
    <div 
      className={cn(
        'bg-gray-800 rounded-lg border border-gray-700 p-4',
        showPulse && 'animate-pulse',
        className
      )}
      role="status"
      aria-label={`Loading ${title}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        {icon && (
          <div className="text-gray-500" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {Array.from({ length: skeletonLines }, (_, index) => (
          <Skeleton 
            key={index}
            className={index === 0 ? "h-6 w-3/4" : "h-4 w-1/2"}
            animate={false} // Parent handles animation
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Loading state for account balance display
 */
export const BalanceLoading: React.FC<BaseLoadingProps> = ({ className }) => {
  return (
    <DataLoadingCard
      title="Account Balance"
      icon={<DollarSign className="h-4 w-4" />}
      className={className}
    />
  );
};

/**
 * Loading state for profit and loss display
 */
export const PnLLoading: React.FC<BaseLoadingProps> = ({ className }) => {
  return (
    <DataLoadingCard
      title="P&L"
      icon={<TrendingUp className="h-4 w-4" />}
      className={className}
    />
  );
};

// ============================================================================
// MARKET DATA LOADING COMPONENT
// ============================================================================

interface MarketDataLoadingProps extends BaseLoadingProps {
  /** Currency pairs to display */
  pairs?: string[];
}

/**
 * Loading state for market data display
 * @param className - Additional CSS classes
 * @param pairs - Currency pairs to show loading states for
 */
export const MarketDataLoading: React.FC<MarketDataLoadingProps> = ({ 
  className,
  pairs = ['EURUSD', 'GBPUSD', 'USDJPY']
}) => {
  return (
    <div 
      className={cn('bg-gray-800 rounded-lg border border-gray-700 p-4', className)}
      role="status"
      aria-label="Loading market prices"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Market Prices</h3>
        <BarChart3 className="h-4 w-4 text-gray-500" aria-hidden="true" />
      </div>
      
      <div className="space-y-3">
        {pairs.map((pair) => (
          <div key={pair} className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{pair}</span>
            <div className="flex space-x-2">
              <Skeleton className="h-4 w-16" animate />
              <Skeleton className="h-4 w-12" animate />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// POSITIONS LOADING COMPONENT
// ============================================================================

interface PositionsLoadingProps extends BaseLoadingProps {
  /** Number of position items to show */
  itemCount?: number;
}

/**
 * Loading state for trading positions display
 * @param className - Additional CSS classes
 * @param itemCount - Number of position placeholders to show
 */
export const PositionsLoading: React.FC<PositionsLoadingProps> = ({ 
  className, 
  itemCount = 3 
}) => {
  return (
    <div 
      className={cn('bg-gray-800 rounded-lg border border-gray-700 p-4', className)}
      role="status"
      aria-label="Loading active positions"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Active Positions</h3>
        <LoadingSpinner size="sm" />
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: itemCount }, (_, index) => (
          <div key={index} className="border border-gray-700 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-20" animate />
              <Skeleton className="h-4 w-16" animate />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-3 w-full" animate />
              <Skeleton className="h-3 w-full" animate />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// CHART LOADING COMPONENT
// ============================================================================

interface ChartLoadingProps extends BaseLoadingProps {
  /** Height of the chart area in pixels */
  height?: number;
  /** Chart title (optional) */
  title?: string;
}

/**
 * Loading state for chart components
 * @param className - Additional CSS classes
 * @param height - Height of the chart area
 * @param title - Optional chart title
 */
export const ChartLoading: React.FC<ChartLoadingProps> = ({ 
  className, 
  height = 200,
  title
}) => {
  return (
    <div 
      className={cn('bg-gray-800 rounded-lg border border-gray-700 p-4', className)}
      role="status"
      aria-label={title ? `Loading ${title} chart` : "Loading chart"}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" animate />
        <Skeleton className="h-4 w-20" animate />
      </div>
      
      <div className="relative">
        <Skeleton 
          className="w-full" 
          height={height}
          animate
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-500">
            <BarChart3 className="h-6 w-6 animate-pulse" aria-hidden="true" />
            <span className="text-sm">Loading chart...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DASHBOARD LOADING COMPONENT
// ============================================================================

/**
 * Comprehensive loading state for the entire dashboard
 * @param className - Additional CSS classes
 */
export const DashboardLoading: React.FC<BaseLoadingProps> = ({ className }) => {
  return (
    <div 
      className={cn('space-y-6', className)}
      role="status"
      aria-label="Loading dashboard"
    >
      {/* Header loading */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" animate />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-24" animate />
          <Skeleton className="h-6 w-32" animate />
        </div>
      </div>
      
      {/* Stats grid loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceLoading />
        <PnLLoading />
        <DataLoadingCard 
          title="Margin" 
          icon={<DollarSign className="h-4 w-4" />} 
        />
        <DataLoadingCard 
          title="Equity" 
          icon={<TrendingUp className="h-4 w-4" />} 
        />
      </div>
      
      {/* Main content loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <MarketDataLoading />
          <PositionsLoading />
        </div>
        <div className="space-y-4">
          <ChartLoading title="Price Chart" />
          <DataLoadingCard title="Recent Activity" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Collection of all loading state components
 * Provides consistent loading experiences across the trading application
 */
const LoadingStates = {
  LoadingSpinner,
  Skeleton,
  ConnectionLoading,
  DataLoadingCard,
  BalanceLoading,
  PnLLoading,
  MarketDataLoading,
  PositionsLoading,
  ChartLoading,
  DashboardLoading
} as const;

export default LoadingStates;

// Named exports for individual components
export {
  type ComponentSize,
  type ConnectionStatus,
  type SkeletonVariant,
  type BaseLoadingProps
};