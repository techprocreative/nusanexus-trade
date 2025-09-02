import React, { useEffect, useState } from 'react';
import { useHistoryStore } from '@/store/useHistoryStore';
import { cn } from '@/lib/utils';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';

// Custom UI components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pb-4">{children}</div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-400 mt-1">{children}</p>
);
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Button = ({ children, onClick, variant, size, className }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  size?: string;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === 'outline' ? 'border border-gray-600 bg-transparent hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
    } ${className}`}
  >
    {children}
  </button>
);
const Select = ({ children, value, onValueChange }: {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <div className="relative">{children}</div>
);
const SelectTrigger = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center px-3 py-2 rounded-md cursor-pointer bg-gray-700/50 border border-gray-600 text-white">{children}</div>
);
const SelectValue = () => <span>30 Days</span>;
const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute top-full left-0 mt-1 rounded-md shadow-lg z-10 bg-gray-800 border border-gray-700">{children}</div>
);
const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <div className="px-3 py-2 hover:bg-gray-700 cursor-pointer">{children}</div>
);
const Badge = ({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 ${className || ''}`}>
    {children}
  </span>
);
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Award,
  AlertTriangle,
  Download,
  RefreshCw,
} from 'lucide-react';
import { PerformanceMetrics, PerformanceChartData } from '@/types/orderManagement';

const PerformanceAnalytics: React.FC = () => {
  const {
    performanceMetrics,
    chartData,
    analysisDateRange,
    isLoading,
    error,
    calculatePerformanceMetrics,
    generateChartData,
    setAnalysisDateRange,
    exportPerformanceReport,
    clearError,
  } = useHistoryStore();

  const [chartType, setChartType] = useState<'pnl' | 'volume' | 'winRate'>('pnl');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    calculatePerformanceMetrics();
    generateChartData();
  }, [calculatePerformanceMetrics, generateChartData, analysisDateRange]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleExportReport = () => {
    exportPerformanceReport();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Chart colors
  const COLORS = {
    profit: '#10B981',
    loss: '#EF4444',
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
  };

  // Pie chart data for win/loss distribution
  const winLossData = [
    {
      name: 'Winning Trades',
      value: performanceMetrics.winningTrades,
      color: COLORS.profit,
    },
    {
      name: 'Losing Trades',
      value: performanceMetrics.losingTrades,
      color: COLORS.loss,
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('P&L') || entry.name.includes('$') ? 
                formatCurrency(entry.value) : 
                entry.name.includes('%') ? 
                  formatPercentage(entry.value) : 
                  entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
          <p className="text-gray-400 mt-1">
            Detailed analysis of your trading performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select 
            value="30d" 
            onValueChange={(value: string) => {
              const now = new Date();
              let from: Date;
              switch(value) {
                case '7d':
                  from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  break;
                case '30d':
                  from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                  break;
                case '90d':
                  from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                  break;
                default:
                  from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              }
              setAnalysisDateRange({ from, to: now });
            }}
          >
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExportReport}
            className="border border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-1 text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Total P&L</p>
                <p className={cn(
                  "text-2xl font-bold",
                  performanceMetrics.totalPnL >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {formatCurrency(performanceMetrics.totalPnL)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {performanceMetrics.totalTrades} trades
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-full",
                performanceMetrics.totalPnL >= 0 ? "bg-green-500/20" : "bg-red-500/20"
              )}>
                {performanceMetrics.totalPnL >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Win Rate</p>
                <p className="text-2xl font-bold text-white">
                  {performanceMetrics.winRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {performanceMetrics.winningTrades}W / {performanceMetrics.losingTrades}L
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Avg P&L</p>
                <p className={cn(
                  "text-2xl font-bold",
                  performanceMetrics.averageWin >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {formatCurrency(performanceMetrics.averageWin)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  per trade
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-medium">Best Trade</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(performanceMetrics.bestTrade)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Worst: {formatCurrency(performanceMetrics.worstTrade)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Chart */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">P&L Over Time</CardTitle>
                <CardDescription>Cumulative profit and loss</CardDescription>
              </div>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pnl">P&L</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="winRate">Win Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pnl' ? (
                  <AreaChart data={chartData?.equity || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      fontSize={12}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS.primary}
                      fill={`${COLORS.primary}20`}
                      strokeWidth={2}
                      name="Cumulative P&L"
                    />
                  </AreaChart>
                ) : chartType === 'volume' ? (
                  <BarChart data={chartData?.monthlyReturns || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      fill={COLORS.secondary}
                      name="Monthly Returns"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <LineChart data={chartData?.winRate || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS.accent}
                      strokeWidth={2}
                      dot={{ fill: COLORS.accent, strokeWidth: 2, r: 4 }}
                      name="Win Rate %"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Win/Loss Distribution
            </CardTitle>
            <CardDescription>Breakdown of winning vs losing trades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
                            <p className="text-white font-medium">{data.name}</p>
                            <p className="text-gray-300">{data.value} trades</p>
                            <p className="text-gray-300">
                              {((data.value / performanceMetrics.totalTrades) * 100).toFixed(1)}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-300">Winning ({performanceMetrics.winningTrades})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-300">Losing ({performanceMetrics.losingTrades})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Metrics */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
              Risk Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Max Drawdown</span>
              <span className="text-red-400 font-semibold">
                {formatCurrency(performanceMetrics.maxDrawdown)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Profit Factor</span>
              <span className={cn(
                "font-semibold",
                performanceMetrics.profitFactor >= 1 ? "text-green-400" : "text-red-400"
              )}>
                {performanceMetrics.profitFactor.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Sharpe Ratio</span>
              <span className={cn(
                "font-semibold",
                performanceMetrics.sharpeRatio >= 1 ? "text-green-400" : "text-yellow-400"
              )}>
                {performanceMetrics.sharpeRatio.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average Win</span>
              <span className="text-green-400 font-semibold">
                {formatCurrency(performanceMetrics.averageWin)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average Loss</span>
              <span className="text-red-400 font-semibold">
                {formatCurrency(Math.abs(performanceMetrics.averageLoss))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Trading Activity */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-400" />
              Trading Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Volume</span>
              <span className="text-white font-semibold">
                {performanceMetrics.totalVolume.toFixed(2)} lots
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Trade Duration</span>
              <span className="text-white font-semibold">
                {Math.round(performanceMetrics.averageTradeDuration / (1000 * 60))} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Commission</span>
              <span className="text-red-400 font-semibold">
                {formatCurrency(performanceMetrics.totalCommission)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Most Traded Symbol</span>
              <Badge className="border border-gray-600 text-gray-300">
                {performanceMetrics.mostTradedSymbol || 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Consecutive Wins</span>
              <span className="text-green-400 font-semibold">
                {performanceMetrics.maxConsecutiveWins}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;