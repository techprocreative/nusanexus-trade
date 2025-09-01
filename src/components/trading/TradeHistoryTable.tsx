import React, { useEffect, useState } from 'react';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useTradingStore } from '@/store/useTradingStore';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { TradeHistory, HistoryFilters, SortConfig, OrderSide } from '@/types/orderManagement';

const TradeHistoryTable: React.FC = () => {
  const {
    tradeHistory,
    filteredHistory,
    performanceMetrics,
    filters,
    sortConfig,
    pagination,
    isLoading,
    error,
    fetchTradeHistory,
    setFilters,
    setSortConfig,
    setPagination,
    exportHistory,
    clearError,
    refreshData,
  } = useHistoryStore();

  const { selectedSymbol } = useTradingStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'profitable' | 'losing'>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchTradeHistory();
  }, [fetchTradeHistory]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    const newFilters: HistoryFilters = {
      symbol: searchTerm || undefined,
      side: filterType === 'all' ? undefined : filterType as OrderSide,
    };
    setFilters(newFilters);
  }, [searchTerm, filterType, dateRange, setFilters]);

  const handleSort = (field: keyof TradeHistory) => {
    const newDirection = 
      sortConfig?.key === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key: field, direction: newDirection });
  };

  const handleExport = () => {
    exportHistory({
      format: 'csv',
      dateRange: dateRange === 'all' ? undefined : { from: new Date(), to: new Date() },
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (openTime: number, closeTime: number) => {
    const duration = closeTime - openTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getSortIcon = (field: keyof TradeHistory) => {
    if (sortConfig?.key !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Trade History</h2>
          <p className="text-gray-400 mt-1">
            {filteredHistory.length} trades • Total P&L: 
            <span className={cn(
              "ml-1 font-semibold",
              performanceMetrics.totalPnL >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {performanceMetrics.totalPnL >= 0 ? '+' : ''}${performanceMetrics.totalPnL.toFixed(2)}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-700/50 border-gray-600 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Trades</SelectItem>
                <SelectItem value="profitable">Profitable Only</SelectItem>
                <SelectItem value="losing">Losing Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-full sm:w-32 bg-gray-700/50 border-gray-600 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Trades</p>
                <p className="text-2xl font-bold text-white">{performanceMetrics.totalTrades}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Win Rate</p>
                <p className="text-2xl font-bold text-white">{performanceMetrics.winRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Avg Win</p>
                <p className={cn(
                  "text-2xl font-bold",
                  performanceMetrics.averageWin >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {performanceMetrics.averageWin >= 0 ? '+' : ''}${performanceMetrics.averageWin.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Best Trade</p>
                <p className="text-2xl font-bold text-green-400">
                  +${performanceMetrics.largestWin.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade History Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-400">Loading trade history...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">No trades found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or date range</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-9 gap-4 items-center py-4 px-6 border-b border-gray-700 bg-gray-800/30">
                  <button
                    onClick={() => handleSort('symbol')}
                    className="flex items-center space-x-2 text-left text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="font-semibold">Symbol</span>
                    {getSortIcon('symbol')}
                  </button>
                  <button
                    onClick={() => handleSort('side')}
                    className="flex items-center space-x-2 text-left text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="font-semibold">Side</span>
                    {getSortIcon('side')}
                  </button>
                  <button
                    onClick={() => handleSort('pnl')}
                    className="flex items-center space-x-2 text-center text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="font-semibold">P&L</span>
                    {getSortIcon('pnl')}
                  </button>
                  <button
                    onClick={() => handleSort('volume')}
                    className="flex items-center space-x-2 text-center text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="font-semibold">Volume</span>
                    {getSortIcon('volume')}
                  </button>
                  <button
                    onClick={() => handleSort('openPrice')}
                    className="flex items-center space-x-2 text-center text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="font-semibold">Open Price</span>
                    {getSortIcon('openPrice')}
                  </button>
                  <button
                    onClick={() => handleSort('closePrice')}
                    className="flex items-center space-x-2 text-center text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="font-semibold">Close Price</span>
                    {getSortIcon('closePrice')}
                  </button>
                  <button
                    onClick={() => handleSort('commission')}
                    className="flex items-center space-x-2 text-center text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="font-semibold">Commission</span>
                    {getSortIcon('commission')}
                  </button>
                  <span className="text-center text-gray-300 font-semibold">Duration</span>
                  <button
                    onClick={() => handleSort('closeTime')}
                    className="flex items-center space-x-2 text-center text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="font-semibold">Closed</span>
                    {getSortIcon('closeTime')}
                  </button>
                </div>
                
                <div className="divide-y divide-gray-700">
                  {filteredHistory.map((trade) => (
                    <div key={trade.id} className="grid grid-cols-9 gap-4 items-center py-4 px-6 hover:bg-gray-700/20 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-white">{trade.symbol}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                          trade.side === 'BUY' 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        )}>
                          {trade.side === 'BUY' ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          <span>{trade.side}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={cn(
                          "flex items-center justify-center space-x-1 px-3 py-1 rounded-md text-sm font-bold",
                          trade.pnl >= 0 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        )}>
                          {trade.pnl >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span>{trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-center text-gray-300 font-medium">
                        {trade.volume} lots
                      </div>
                      <div className="text-center text-gray-300 font-medium">
                        ${trade.openPrice.toFixed(5)}
                      </div>
                      <div className="text-center text-gray-300 font-medium">
                        ${trade.closePrice.toFixed(5)}
                      </div>
                      <div className="text-center text-gray-300 font-medium">
                        ${trade.commission.toFixed(2)}
                      </div>
                      <div className="text-center text-gray-400 text-sm">
                        {formatDuration(trade.openTime.getTime(), trade.closeTime.getTime())}
                      </div>
                      <div className="text-center text-gray-400 text-sm">
                        {formatTime(trade.closeTime.getTime())}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredHistory.map((trade) => (
                  <Card key={trade.id} className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg text-white">{trade.symbol}</span>
                          <Badge className={cn(
                            "text-xs",
                            trade.side === 'BUY' 
                              ? "bg-green-500/20 text-green-400 border-green-500/40" 
                              : "bg-red-500/20 text-red-400 border-red-500/40"
                          )}>
                            {trade.side}
                          </Badge>
                        </div>
                        <div className={cn(
                          "text-right font-bold text-lg",
                          trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400">Volume</p>
                          <p className="text-white font-medium">{trade.volume} lots</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Commission</p>
                          <p className="text-white font-medium">${trade.commission.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Open Price</p>
                          <p className="text-white font-medium">${trade.openPrice.toFixed(5)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Close Price</p>
                          <p className="text-white font-medium">${trade.closePrice.toFixed(5)}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-600">
                        <div className="flex items-center space-x-1 text-gray-400 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(trade.openTime.getTime(), trade.closeTime.getTime())}</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {formatTime(trade.closeTime.getTime())}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeHistoryTable;