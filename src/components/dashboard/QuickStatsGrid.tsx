import React from 'react';
import { TrendingUp, BarChart3, Award, AlertTriangle } from 'lucide-react';
import { DashboardStats } from '../../types';

interface QuickStatsGridProps {
  stats: DashboardStats;
  loading?: boolean;
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  percentage, 
  size = 80, 
  strokeWidth = 8, 
  color = '#10b981' 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
    <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
    <div className="h-3 bg-gray-700 rounded w-20"></div>
  </div>
);

const QuickStatsGrid: React.FC<QuickStatsGridProps> = ({ stats, loading = false }) => {
  const getDrawdownColor = (drawdown: number) => {
    if (drawdown <= 5) return 'text-green-400';
    if (drawdown <= 15) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return '#10b981'; // green
    if (winRate >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Win Rate Card */}
      <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-gray-900/30 border border-gray-700/50 hover:bg-gray-900/40 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-green-500/20">
            <Award className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Win Rate</div>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex items-center justify-center">
            <CircularProgress 
              percentage={stats.winRate} 
              color={getWinRateColor(stats.winRate)}
            />
          </div>
        )}
      </div>

      {/* Total Trades Card */}
      <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-gray-900/30 border border-gray-700/50 hover:bg-gray-900/40 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">This Month</div>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalTrades}
            </div>
            <div className="text-sm text-gray-400">
              Total trades
            </div>
          </>
        )}
      </div>

      {/* Best Performing Pair Card */}
      <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-gray-900/30 border border-gray-700/50 hover:bg-gray-900/40 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Best Pair</div>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.bestPerformingPair}
            </div>
            <div className="text-sm text-green-400">
              Top performer
            </div>
          </>
        )}
      </div>

      {/* Current Drawdown Card */}
      <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-gray-900/30 border border-gray-700/50 hover:bg-gray-900/40 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-red-500/20">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Drawdown</div>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className={`text-3xl font-bold mb-1 ${getDrawdownColor(stats.currentDrawdown)}`}>
              {stats.currentDrawdown.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">
              Current level
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuickStatsGrid;