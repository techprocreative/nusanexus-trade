import React, { useState, useEffect, useRef } from 'react';
import { useHistoryStore } from '@/store/useHistoryStore';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Custom Sheet components
const Sheet = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
  <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
    <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 shadow-lg">
      {children}
    </div>
  </div>
);

const SheetContent = ({ children, className = '', side }: { children: React.ReactNode; className?: string; side?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const SheetHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const SheetTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-lg font-semibold ${className || 'text-white'}`}>{children}</h2>
);

const SheetDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm ${className || 'text-gray-400'}`}>{children}</p>
);

const SheetTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
  <div>{children}</div>
);
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  Download,
  ChevronDown,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { TradeHistory } from '@/types/orderManagement';

const MobileTradeHistory: React.FC = () => {
  const {
    tradeHistory: trades,
    filteredHistory: filteredTrades,
    filters,
    isLoading: loading,
    error,
    fetchTradeHistory: fetchTrades,
    setFilters: updateFilter,
    exportHistory: exportTrades,
    clearError,
  } = useHistoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [touchStart, setTouchStart] = useState<{ y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshThreshold = 80;

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      const touch = e.touches[0];
      setTouchStart({
        y: touch.clientY,
        time: Date.now(),
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || containerRef.current?.scrollTop !== 0) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStart.y;

    if (deltaY > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(deltaY * 0.5, refreshThreshold * 1.5));
      
      // Prevent default scrolling when pulling
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);
    setTouchStart(null);

    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      try {
        await fetchTrades();
      } finally {
        setIsRefreshing(false);
      }
    }

    // Animate back to 0
    const animate = () => {
      setPullDistance(prev => {
        const newDistance = prev * 0.8;
        if (newDistance < 1) {
          return 0;
        }
        requestAnimationFrame(animate);
        return newDistance;
      });
    };
    requestAnimationFrame(animate);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilter({ symbol: value });
  };

  const handleExport = async () => {
    try {
      await exportTrades({
        format: 'csv',
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date()
        },
        filters: { profitability: filters.profitability },
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPnLBgColor = (pnl: number) => {
    if (pnl > 0) return 'bg-green-500/10 border-green-500/20';
    if (pnl < 0) return 'bg-red-500/10 border-red-500/20';
    return 'bg-gray-500/10 border-gray-500/20';
  };

  // Calculate summary stats
  const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = filteredTrades.filter(trade => trade.pnl > 0).length;
  const totalTrades = filteredTrades.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="flex items-center justify-center bg-blue-500/10 border-b border-blue-500/20 transition-all duration-200"
          style={{ height: Math.max(0, pullDistance) }}
        >
          <div className="flex items-center space-x-2 text-blue-400">
            <RefreshCw className={cn(
              "h-4 w-4",
              (isRefreshing || pullDistance >= refreshThreshold) && "animate-spin"
            )} />
            <span className="text-sm">
              {isRefreshing ? 'Refreshing...' : 
               pullDistance >= refreshThreshold ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Trade History</h1>
            <p className="text-sm text-gray-400">{totalTrades} trades</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-gray-900 border-gray-700">
                <SheetHeader>
                  <SheetTitle className="text-white">Filter Trades</SheetTitle>
                  <SheetDescription className="text-gray-400">
                    Filter your trade history by various criteria
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profitability
                    </label>
                    <Select 
                      value={filters.profitability || 'all'} 
                      onValueChange={(value) => updateFilter({ profitability: value === 'all' ? undefined : value as any })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all">All Trades</SelectItem>
                        <SelectItem value="profitable">Profitable Only</SelectItem>
                        <SelectItem value="losing">Losing Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date Range
                    </label>
                    <Select 
                      value={filters.dateRange || '30d'} 
                      onValueChange={(value) => updateFilter({ dateRange: value as any })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="90d">Last 90 Days</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by symbol..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Total P&L</p>
            <p className={cn("text-sm font-bold", getPnLColor(totalPnL))}>
              {formatCurrency(totalPnL)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Win Rate</p>
            <p className="text-sm font-bold text-white">{winRate.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Trades</p>
            <p className="text-sm font-bold text-white">{totalTrades}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Trade List */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {loading && filteredTrades.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-gray-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading trades...</span>
            </div>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No trades found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search or filters' : 'Your trade history will appear here'}
            </p>
          </div>
        ) : (
          filteredTrades.map((trade) => (
            <TradeCard key={trade.id} trade={trade} />
          ))
        )}
      </div>
    </div>
  );
};

// Individual Trade Card Component
interface TradeCardProps {
  trade: TradeHistory;
}

const TradeCard: React.FC<TradeCardProps> = ({ trade }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPnLBgColor = (pnl: number) => {
    if (pnl > 0) return 'bg-green-500/10 border-green-500/20';
    if (pnl < 0) return 'bg-red-500/10 border-red-500/20';
    return 'bg-gray-500/10 border-gray-500/20';
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-full",
              trade.side === 'BUY' ? "bg-green-500/20" : "bg-red-500/20"
            )}>
              {trade.side === 'BUY' ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{trade.symbol}</h3>
              <p className="text-xs text-gray-400">
                {trade.volume} lots • {formatTime(typeof trade.openTime === 'number' ? trade.openTime : trade.openTime.getTime())}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-lg font-bold", getPnLColor(trade.pnl))}>
              {formatCurrency(trade.pnl)}
            </p>
            <Badge 
              variant="outline"
              className={cn(
                "text-xs",
                trade.side === 'BUY' 
                  ? "border-green-500 text-green-400" 
                  : "border-red-500 text-red-400"
              )}
            >
              {trade.side}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <p className="text-xs text-gray-400">Open</p>
            <p className="text-sm font-medium text-white">{trade.openPrice.toFixed(5)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Close</p>
            <p className="text-sm font-medium text-white">{trade.closePrice.toFixed(5)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Duration</p>
            <p className="text-sm font-medium text-white">
              {formatDuration(
                (typeof trade.closeTime === 'number' ? trade.closeTime : trade.closeTime.getTime()) - 
                (typeof trade.openTime === 'number' ? trade.openTime : trade.openTime.getTime())
              )}
            </p>
          </div>
        </div>

        {/* Expand/Collapse Details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full h-8 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50"
        >
          <span>{showDetails ? 'Hide' : 'Show'} Details</span>
          <ChevronDown className={cn(
            "h-3 w-3 ml-2 transition-transform",
            showDetails && "rotate-180"
          )} />
        </Button>

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400">Commission</p>
                <p className="text-red-400 font-medium">{formatCurrency(trade.commission)}</p>
              </div>
              <div>
                <p className="text-gray-400">Swap</p>
                <p className={cn(
                  "font-medium",
                  trade.swap >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {formatCurrency(trade.swap)}
                </p>
              </div>
              {trade.stopLoss && (
                <div>
                  <p className="text-gray-400">Stop Loss</p>
                  <p className="text-red-400 font-medium">{trade.stopLoss.toFixed(5)}</p>
                </div>
              )}
              {trade.takeProfit && (
                <div>
                  <p className="text-gray-400">Take Profit</p>
                  <p className="text-green-400 font-medium">{trade.takeProfit.toFixed(5)}</p>
                </div>
              )}
            </div>
            
            {trade.comment && (
              <div>
                <p className="text-gray-400 text-xs">Comment</p>
                <p className="text-white text-xs bg-gray-700/50 rounded p-2 mt-1">
                  {trade.comment}
                </p>
              </div>
            )}
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>Closed: {formatTime(typeof trade.closeTime === 'number' ? trade.closeTime : trade.closeTime.getTime())}</span>
              <span>ID: {trade.id}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileTradeHistory;