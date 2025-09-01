import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit, 
  X, 
  Search,
  Filter,
  ChevronDown,
  Download,
  MoreHorizontal,
  CheckSquare,
  Square,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Trash2,
  Settings
} from 'lucide-react';
import { useTradingStore } from '@/store/useTradingStore';
import { usePositionStore } from '@/store/usePositionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PositionsLoading } from '@/components/ui/LoadingStates';

interface Position {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: Date;
  pnl: number;
  pnlPercent: number;
  commission: number;
  swap: number;
}

interface PositionManagerProps {
  className?: string;
  isLoading?: boolean;
}

export const PositionManager: React.FC<PositionManagerProps> = ({ className }) => {
  const { symbols } = useTradingStore();
  const {
      positions,
      filteredPositions,
      filters,
      sortConfig,
      pagination,
      isLoading,
    error,
    fetchPositions,
    closePosition,
    modifyPosition,
    setFilters,
    setSortConfig,
    exportPositions
  } = usePositionStore();
  
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [showClosedPositions, setShowClosedPositions] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Initialize positions on component mount
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);
  
  // Update filters when search term or filter type changes
  useEffect(() => {
    setFilters({
      ...filters,
      // search: searchTerm,
       // status: filterType === 'all' ? undefined : filterType as any
    });
  }, [searchTerm, filterType, setFilters]);
  
  // Handle bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedPositions.length > 0);
  }, [selectedPositions]);
  
  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        // clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Handle sorting
  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };
  
  // Handle bulk export
  const handleBulkExport = async () => {
    if (selectedPositions.length > 0) {
      await exportPositions({
        format: 'csv',
        // positionIds: selectedPositions
      });
    }
  };
  
  // Handle bulk close
  const handleBulkClose = async () => {
    if (selectedPositions.length > 0) {
      // await bulkClosePositions(selectedPositions);
      // clearSelection();
    }
  };

  const totalPnL = filteredPositions.reduce((sum, pos) => sum + pos.pnl + pos.commission + pos.swap, 0);
  const totalVolume = filteredPositions.reduce((sum, pos) => sum + pos.volume, 0);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m ago`;
    }
    return `${diffMins}m ago`;
  };

  // Show loading state
  if (isLoading) {
    return <PositionsLoading className={className} itemCount={3} />;
  }

  return (
    <div className={cn('bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-600/50 shadow-2xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 p-5 md:p-6 border-b border-gray-600/50 bg-gradient-to-r from-gray-800/40 to-gray-700/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">Open Positions</h2>
                <p className="text-xs md:text-sm text-gray-400 font-medium">Manage your active trades</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPositions({ format: 'csv' })}
              className="border-gray-600 hover:border-gray-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClosedPositions(!showClosedPositions)}
              className="border-gray-600 hover:border-gray-500"
            >
              {showClosedPositions ? 'Hide' : 'Show'} Closed
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/60 border-gray-600 focus:border-blue-500"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48 bg-gray-800/60 border-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="open">Open Only</SelectItem>
              <SelectItem value="profitable">Profitable</SelectItem>
              <SelectItem value="losing">Losing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                {selectedPositions.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPositions([])}
                className="text-gray-400 hover:text-white"
              >
                Clear
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
                className="border-blue-500/30 hover:border-blue-500/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkClose}
                className="bg-red-600/90 hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Close All
              </Button>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Enhanced Summary */}
      {positions.length > 0 && (
        <div className="p-5 md:p-6 border-b border-gray-600/50 bg-gradient-to-r from-gray-800/60 to-gray-700/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="flex items-center space-x-2 p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-800/60 border border-gray-600/30">
              <div className={cn(
                'p-3 rounded-xl border',
                totalPnL >= 0 ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'
              )}>
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total P&L</p>
                <p className={cn(
                  'text-sm md:text-base font-bold mt-1',
                  totalPnL >= 0 ? 'text-green-300' : 'text-red-300'
                )}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-800/60 border border-gray-600/30">
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-blue-500/20 border border-blue-500/30">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Volume</p>
                <p className="text-sm md:text-base font-bold text-white mt-1">{totalVolume.toFixed(2)} lots</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-800/60 border border-gray-600/30">
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-purple-500/20 border border-purple-500/30">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Active</p>
                <p className="text-sm md:text-base font-bold text-white mt-1">{positions.length} positions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-800/60 border border-gray-600/30">
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                <Percent className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Avg P&L%</p>
                <p className={cn(
                  'text-sm md:text-base font-bold mt-1',
                  positions.length > 0 && positions.reduce((sum, pos) => sum + pos.pnlPercent, 0) / positions.length >= 0
                    ? 'text-green-300' : 'text-red-300'
                )}>
                  {positions.length > 0 
                    ? `${(positions.reduce((sum, pos) => sum + pos.pnlPercent, 0) / positions.length).toFixed(1)}%`
                    : '0.0%'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop header moved inside the scroll container as sticky */}

      {/* Positions List */}
      <div className="max-h-[60vh] overflow-y-auto">
        {filteredPositions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-2xl p-6 mb-6 border border-gray-600/30">
              <Activity className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-3">No Open Positions</h3>
            <p className="text-gray-400 max-w-md leading-relaxed">
              You don't have any open positions yet. Start trading to see your positions here.
            </p>
            <div className="mt-6 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm font-medium">Ready to start trading?</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-2 md:p-4">
            {/* Mobile Layout */}
            <div className="md:hidden space-y-3">
              {filteredPositions.map((position) => (
                <div key={position.id} className="bg-gradient-to-br from-gray-800/70 to-gray-900/50 border border-gray-600/40 rounded-lg p-3 shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={false}
                          onCheckedChange={(checked) => {
                            // togglePositionSelection(position.id);
                          }}
                          className="border-gray-500"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-base text-white">{position.symbol}</span>
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-semibold border',
                              position.side === 'BUY' 
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : 'bg-red-500/20 text-red-300 border-red-500/30'
                            )}>
                              {position.side.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 font-medium">{position.volume} lots</p>
                        </div>
                      </div>
                    <div className="text-right">
                      <p className={cn(
                        'font-bold text-base',
                        position.pnl >= 0 ? 'text-green-300' : 'text-red-300'
                      )}>
                        {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                      </p>
                      <p className={cn(
                        'text-xs font-medium flex items-center justify-end space-x-1',
                        position.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {position.pnlPercent >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="p-2 rounded-lg bg-gray-800/60 border border-gray-600/30">
                      <p className="text-gray-400 font-medium mb-1 text-xs">Open Price</p>
                      <p className="text-white font-semibold text-sm">${position.openPrice.toFixed(5)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-800/60 border border-gray-600/30">
                      <p className="text-gray-400 font-medium mb-1 text-xs">Current Price</p>
                      <p className="text-white font-semibold text-sm">${position.currentPrice.toFixed(5)}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => modifyPosition(position.id, {})}
                      className="flex-1 px-3 py-2 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 border border-blue-500/30"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Modify</span>
                    </button>
                    <button 
                      onClick={() => closePosition(position.id)}
                      className="flex-1 px-3 py-2 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 border border-red-500/30"
                    >
                      <X className="h-3 w-3" />
                      <span>Close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Layout (sticky header + body in one scroll area) */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[1100px]">
                {/* Sticky Header */}
                <div
                  className="grid gap-2 items-center py-3 px-3 text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur sticky top-0 z-10"
                  style={{ gridTemplateColumns: '28px 1.4fr 1fr 0.9fr 0.9fr 0.7fr 0.7fr 0.7fr 0.7fr 0.9fr 1fr' }}
                >
                  <div className="flex items-center space-x-1">
                    <Checkbox
                      checked={selectedPositions.length === filteredPositions.length && filteredPositions.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          // selectAllPositions();
                        } else {
                          setSelectedPositions([]);
                        }
                      }}
                      className="border-gray-500"
                    />
                    <span>Select</span>
                  </div>
                  <button onClick={() => handleSort('symbol')} className="flex items-center space-x-1 hover:text-white transition-colors">
                    <span>Position</span>
                    {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </button>
                  <button onClick={() => handleSort('pnl')} className="text-center flex items-center justify-center space-x-1 hover:text-white transition-colors">
                    <span>P&L</span>
                    {sortConfig.key === 'pnl' && (sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </button>
                  <button onClick={() => handleSort('openPrice')} className="text-center flex items-center justify-center space-x-1 hover:text-white transition-colors">
                    <span>Entry</span>
                    {sortConfig.key === 'openPrice' && (sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </button>
                  <button onClick={() => handleSort('currentPrice')} className="text-center flex items-center justify-center space-x-1 hover:text-white transition-colors">
                    <span>Current</span>
                    {sortConfig.key === 'currentPrice' && (sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </button>
                  <div className="text-center flex items-center justify-center space-x-1">
                    <span>SL</span>
                  </div>
                  <div className="text-center flex items-center justify-center space-x-1">
                    <span>TP</span>
                  </div>
                  <button onClick={() => handleSort('commission')} className="text-center flex items-center justify-center space-x-1 hover:text-white transition-colors">
                    <span>Comm</span>
                    {sortConfig.key === 'commission' && (sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </button>
                  <button onClick={() => handleSort('swap')} className="text-center flex items-center justify-center space-x-1 hover:text-white transition-colors">
                    <span>Swap</span>
                    {sortConfig.key === 'swap' && (sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </button>
                  <button onClick={() => handleSort('openTime')} className="text-center flex items-center justify-center space-x-1 hover:text-white transition-colors">
                    <span>Time</span>
                    {sortConfig.key === 'openTime' && (sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </button>
                  <div className="text-center flex items-center justify-center">
                    <span>Actions</span>
                  </div>
                </div>

                {/* Rows */}
                <div className="space-y-0.5">
                  {filteredPositions.map((position) => (
                    <div key={position.id} className="hover:bg-gray-700/20 transition-all duration-200 rounded-md border border-transparent hover:border-gray-600/30">
                      <div
                        className="grid gap-2 items-center py-2 px-3"
                        style={{ gridTemplateColumns: '28px 1.4fr 1fr 0.9fr 0.9fr 0.7fr 0.7fr 0.7fr 0.7fr 0.9fr 1fr' }}
                      >
                    {/* Checkbox */}
                    <div className="flex items-center">
                      <Checkbox
                        checked={false}
                        onCheckedChange={(checked) => {
                          // togglePositionSelection(position.id);
                        }}
                        className="border-gray-500"
                      />
                    </div>
                    {/* Symbol & Side */}
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        'flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-md border',
                        position.side === 'BUY' 
                          ? 'bg-green-500/20 text-green-300 border-green-500/40' 
                          : 'bg-red-500/20 text-red-300 border-red-500/40'
                      )}>
                        {position.side === 'BUY' ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        <span>{position.side.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{position.symbol}</p>
                        <p className="text-gray-400 text-xs font-medium">{position.volume} lots</p>
                      </div>
                    </div>
                    
                    {/* P&L */}
                    <div className="text-center min-w-0">
                      <div className={cn(
                        'flex items-center justify-center space-x-1 px-2 py-1 rounded-md text-xs font-bold border',
                        position.pnl >= 0 
                          ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      )}>
                        {position.pnl >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span className="truncate">{position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}</span>
                      </div>
                      <p className={cn(
                        'text-xs mt-1 font-medium truncate',
                        position.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                      </p>
                    </div>
                    
                    {/* Open Price */}
                    <div className="text-center min-w-0">
                      <p className="text-white font-semibold text-xs truncate">${position.openPrice.toFixed(5)}</p>
                      <p className="text-xs text-gray-500">Open</p>
                    </div>
                    
                    {/* Current Price */}
                    <div className="text-center min-w-0">
                      <p className="text-white font-semibold text-xs truncate">${position.currentPrice.toFixed(5)}</p>
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                    
                    {/* Stop Loss */}
                    <div className="text-center min-w-0">
                      <p className="text-gray-300 font-medium text-xs truncate">
                        {position.stopLoss ? `$${position.stopLoss.toFixed(5)}` : '-'}
                      </p>
                      <p className="text-xs text-gray-500">SL</p>
                    </div>
                    
                    {/* Take Profit */}
                    <div className="text-center min-w-0">
                      <p className="text-gray-300 font-medium text-xs truncate">
                        {position.takeProfit ? `$${position.takeProfit.toFixed(5)}` : '-'}
                      </p>
                      <p className="text-xs text-gray-500">TP</p>
                    </div>
                    
                    {/* Commission */}
                    <div className="text-center min-w-0">
                      <p className="text-gray-300 font-medium text-xs truncate">${position.commission.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Comm</p>
                    </div>
                    
                    {/* Swap */}
                    <div className="text-center min-w-0">
                      <span className={cn(
                        'text-xs font-semibold px-1.5 py-0.5 rounded-md truncate',
                        position.swap >= 0 ? 'text-green-300 bg-green-500/10' : 'text-red-300 bg-red-500/10'
                      )}>
                        {position.swap >= 0 ? '+' : ''}${position.swap.toFixed(2)}
                      </span>
                      <p className="text-xs text-gray-500">Swap</p>
                    </div>
                    
                    {/* Time */}
                    <div className="text-center min-w-0">
                      <p className="text-gray-400 text-xs font-medium truncate">{formatTime(position.openTime)}</p>
                      <p className="text-xs text-gray-500">Time</p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-1 justify-center">
                      <button 
                        onClick={() => modifyPosition(position.id, {})}
                        className="flex items-center space-x-1 bg-blue-600/90 hover:bg-blue-600 border border-blue-500/30 text-white text-xs py-1.5 px-2 rounded-md transition-all duration-200 font-semibold"
                      >
                        <Edit className="h-3 w-3" />
                        <span className="hidden sm:inline">Modify</span>
                      </button>
                      <button 
                        onClick={() => closePosition(position.id)}
                        className="flex items-center space-x-1 bg-red-600/90 hover:bg-red-600 border border-red-500/30 text-white text-xs py-1.5 px-2 rounded-md transition-all duration-200 font-semibold"
                      >
                        <X className="h-3 w-3" />
                        <span className="hidden sm:inline">Close</span>
                      </button>
                    </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
