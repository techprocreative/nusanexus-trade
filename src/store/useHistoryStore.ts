import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  TradeHistory,
  PerformanceMetrics,
  HistoryFilters,
  SortConfig,
  PaginationState,
  ExportOptions,
  ChartDataPoint,
  PerformanceChartData,
  OrderSide,
  OrderType
} from '../types/orderManagement';

interface HistoryState {
  // State
  tradeHistory: TradeHistory[];
  filteredHistory: TradeHistory[];
  performanceMetrics: PerformanceMetrics | null;
  chartData: PerformanceChartData | null;
  filters: HistoryFilters;
  sortConfig: SortConfig;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  
  // Date range for analysis
  analysisDateRange: {
    from: Date;
    to: Date;
  };
  
  // Actions
  fetchTradeHistory: () => Promise<void>;
  calculatePerformanceMetrics: () => void;
  generateChartData: () => void;
  
  // Filtering and Sorting
  setFilters: (filters: Partial<HistoryFilters>) => void;
  clearFilters: () => void;
  setSortConfig: (config: SortConfig) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setAnalysisDateRange: (range: { from: Date; to: Date }) => void;
  
  // Export
  exportHistory: (options: ExportOptions) => Promise<string>;
  exportPerformanceReport: () => Promise<string>;
  
  // Utility
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Mock trade history data
const mockTradeHistory: TradeHistory[] = [
  {
    id: '1',
    orderId: 'ORD001',
    symbol: 'EURUSD',
    side: 'BUY',
    volume: 0.1,
    openPrice: 1.0850,
    closePrice: 1.0875,
    pnl: 25.0,
    commission: 2.0,
    swap: -0.5,
    openTime: new Date('2024-01-15T08:30:00Z'),
    closeTime: new Date('2024-01-15T12:45:00Z'),
    duration: 4.25 * 60 * 60 * 1000, // 4.25 hours in milliseconds
    comment: 'EUR strength trade'
  },
  {
    id: '2',
    orderId: 'ORD002',
    symbol: 'GBPUSD',
    side: 'SELL',
    volume: 0.05,
    openPrice: 1.2650,
    closePrice: 1.2625,
    pnl: 12.5,
    commission: 1.5,
    swap: 0.3,
    openTime: new Date('2024-01-15T09:15:00Z'),
    closeTime: new Date('2024-01-15T14:30:00Z'),
    duration: 5.25 * 60 * 60 * 1000, // 5.25 hours in milliseconds
    comment: 'Brexit concerns short'
  },
  {
    id: '3',
    orderId: 'ORD003',
    symbol: 'USDJPY',
    side: 'BUY',
    volume: 0.2,
    openPrice: 148.50,
    closePrice: 148.25,
    pnl: -33.6,
    commission: 3.0,
    swap: 1.2,
    openTime: new Date('2024-01-14T07:45:00Z'),
    closeTime: new Date('2024-01-14T16:20:00Z'),
    duration: 8.58 * 60 * 60 * 1000, // 8.58 hours in milliseconds
    comment: 'JPY weakness play'
  },
  {
    id: '4',
    orderId: 'ORD004',
    symbol: 'AUDUSD',
    side: 'SELL',
    volume: 0.15,
    openPrice: 0.6750,
    closePrice: 0.6735,
    pnl: 22.5,
    commission: 2.5,
    swap: -0.8,
    openTime: new Date('2024-01-14T06:20:00Z'),
    closeTime: new Date('2024-01-14T11:45:00Z'),
    duration: 5.42 * 60 * 60 * 1000, // 5.42 hours in milliseconds
    comment: 'AUD commodity weakness'
  },
  {
    id: '5',
    orderId: 'ORD005',
    symbol: 'EURUSD',
    side: 'SELL',
    volume: 0.08,
    openPrice: 1.0820,
    closePrice: 1.0840,
    pnl: -16.0,
    commission: 1.8,
    swap: 0.2,
    openTime: new Date('2024-01-13T14:10:00Z'),
    closeTime: new Date('2024-01-13T18:25:00Z'),
    duration: 4.25 * 60 * 60 * 1000, // 4.25 hours in milliseconds
    comment: 'Failed breakout trade'
  },
  {
    id: '6',
    orderId: 'ORD006',
    symbol: 'GBPUSD',
    side: 'BUY',
    volume: 0.12,
    openPrice: 1.2580,
    closePrice: 1.2620,
    pnl: 48.0,
    commission: 2.2,
    swap: -1.1,
    openTime: new Date('2024-01-13T10:30:00Z'),
    closeTime: new Date('2024-01-13T15:45:00Z'),
    duration: 5.25 * 60 * 60 * 1000, // 5.25 hours in milliseconds
    comment: 'GBP recovery bounce'
  }
];

// Utility functions
const applyHistoryFilters = (history: TradeHistory[], filters: HistoryFilters): TradeHistory[] => {
  return history.filter(trade => {
    if (filters.symbol && !trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
      return false;
    }
    if (filters.side && trade.side !== filters.side) {
      return false;
    }
    if (filters.dateFrom && trade.closeTime < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && trade.closeTime > filters.dateTo) {
      return false;
    }
    if (filters.minPnL && trade.pnl < filters.minPnL) {
      return false;
    }
    if (filters.maxPnL && trade.pnl > filters.maxPnL) {
      return false;
    }
    return true;
  });
};

const applyHistorySorting = (history: TradeHistory[], sortConfig: SortConfig): TradeHistory[] => {
  return [...history].sort((a, b) => {
    const aValue = (a as any)[sortConfig.key];
    const bValue = (b as any)[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

const calculateMetrics = (trades: TradeHistory[]): PerformanceMetrics => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      recoveryFactor: 0
    };
  }
  
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const losingTrades = trades.filter(t => t.pnl < 0).length;
  const winRate = (winningTrades / totalTrades) * 100;
  
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const wins = trades.filter(t => t.pnl > 0).map(t => t.pnl);
  const losses = trades.filter(t => t.pnl < 0).map(t => Math.abs(t.pnl));
  
  const averageWin = wins.length > 0 ? wins.reduce((sum, w) => sum + w, 0) / wins.length : 0;
  const averageLoss = losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / losses.length : 0;
  const largestWin = wins.length > 0 ? Math.max(...wins) : 0;
  const largestLoss = losses.length > 0 ? Math.max(...losses) : 0;
  
  const grossProfit = wins.reduce((sum, w) => sum + w, 0);
  const grossLoss = losses.reduce((sum, l) => sum + l, 0);
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
  
  // Calculate running equity for drawdown
  let runningEquity = 10000; // Starting balance
  let peak = runningEquity;
  let maxDrawdown = 0;
  
  const equityCurve = trades.map(trade => {
    runningEquity += trade.pnl;
    if (runningEquity > peak) {
      peak = runningEquity;
    }
    const drawdown = ((peak - runningEquity) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
    return runningEquity;
  });
  
  // Simple Sharpe ratio calculation (assuming risk-free rate of 2%)
  const returns = trades.map(t => (t.pnl / 10000) * 100); // Convert to percentage returns
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const returnStdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );
  const sharpeRatio = returnStdDev > 0 ? (avgReturn - 0.02) / returnStdDev : 0;
  
  const recoveryFactor = maxDrawdown > 0 ? (totalPnL / 10000) * 100 / maxDrawdown : 0;
  
  return {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    totalPnL,
    averageWin,
    averageLoss,
    largestWin,
    largestLoss,
    profitFactor,
    sharpeRatio,
    maxDrawdown,
    recoveryFactor
  };
};

const generateChartDataFromTrades = (trades: TradeHistory[]): PerformanceChartData => {
  const sortedTrades = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
  
  let runningEquity = 10000;
  let peak = runningEquity;
  
  const equity: ChartDataPoint[] = [{ date: new Date(), value: runningEquity }];
  const drawdown: ChartDataPoint[] = [{ date: new Date(), value: 0 }];
  
  sortedTrades.forEach(trade => {
    runningEquity += trade.pnl;
    if (runningEquity > peak) {
      peak = runningEquity;
    }
    
    const drawdownValue = ((peak - runningEquity) / peak) * 100;
    
    equity.push({ date: trade.closeTime, value: runningEquity });
    drawdown.push({ date: trade.closeTime, value: drawdownValue });
  });
  
  // Generate monthly returns
  const monthlyReturns: ChartDataPoint[] = [];
  const monthlyGroups = new Map<string, TradeHistory[]>();
  
  sortedTrades.forEach(trade => {
    const monthKey = `${trade.closeTime.getFullYear()}-${trade.closeTime.getMonth()}`;
    if (!monthlyGroups.has(monthKey)) {
      monthlyGroups.set(monthKey, []);
    }
    monthlyGroups.get(monthKey)!.push(trade);
  });
  
  monthlyGroups.forEach((trades, monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    const monthlyPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const monthlyReturn = (monthlyPnL / 10000) * 100;
    
    monthlyReturns.push({
      date: new Date(year, month, 1),
      value: monthlyReturn,
      label: `${year}-${String(month + 1).padStart(2, '0')}`
    });
  });
  
  // Generate win rate over time
  const winRate: ChartDataPoint[] = [];
  let cumulativeWins = 0;
  let cumulativeTrades = 0;
  
  sortedTrades.forEach(trade => {
    cumulativeTrades++;
    if (trade.pnl > 0) {
      cumulativeWins++;
    }
    
    winRate.push({
      date: trade.closeTime,
      value: (cumulativeWins / cumulativeTrades) * 100
    });
  });
  
  return {
    equity,
    drawdown,
    monthlyReturns,
    winRate
  };
};

const generateHistoryCSV = (trades: TradeHistory[]): string => {
  const headers = [
    'Trade ID', 'Order ID', 'Symbol', 'Side', 'Volume', 'Open Price', 'Close Price',
    'P&L', 'Commission', 'Swap', 'Open Time', 'Close Time', 'Duration (hours)', 'Comment'
  ];
  
  const rows = trades.map(trade => [
    trade.id,
    trade.orderId,
    trade.symbol,
    trade.side,
    trade.volume.toString(),
    trade.openPrice.toString(),
    trade.closePrice.toString(),
    trade.pnl.toFixed(2),
    trade.commission.toFixed(2),
    trade.swap.toFixed(2),
    trade.openTime.toISOString(),
    trade.closeTime.toISOString(),
    (trade.duration / (1000 * 60 * 60)).toFixed(2),
    trade.comment || ''
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

const generatePerformanceReportCSV = (metrics: PerformanceMetrics, chartData: PerformanceChartData): string => {
  const report = [
    ['Performance Report', ''],
    ['Generated', new Date().toISOString()],
    ['', ''],
    ['SUMMARY METRICS', ''],
    ['Total Trades', metrics.totalTrades.toString()],
    ['Winning Trades', metrics.winningTrades.toString()],
    ['Losing Trades', metrics.losingTrades.toString()],
    ['Win Rate (%)', metrics.winRate.toFixed(2)],
    ['Total P&L', metrics.totalPnL.toFixed(2)],
    ['Average Win', metrics.averageWin.toFixed(2)],
    ['Average Loss', metrics.averageLoss.toFixed(2)],
    ['Largest Win', metrics.largestWin.toFixed(2)],
    ['Largest Loss', metrics.largestLoss.toFixed(2)],
    ['Profit Factor', metrics.profitFactor.toFixed(2)],
    ['Sharpe Ratio', metrics.sharpeRatio.toFixed(2)],
    ['Max Drawdown (%)', metrics.maxDrawdown.toFixed(2)],
    ['Recovery Factor', metrics.recoveryFactor.toFixed(2)],
    ['', ''],
    ['MONTHLY RETURNS', ''],
    ['Month', 'Return (%)'],
    ...chartData.monthlyReturns.map(point => [
      point.label || point.date.toISOString().substring(0, 7),
      point.value.toFixed(2)
    ])
  ];
  
  return report.map(row => row.join(',')).join('\n');
};

export const useHistoryStore = create<HistoryState>()(devtools(
  (set, get) => ({
    // Initial state
    tradeHistory: mockTradeHistory,
    filteredHistory: mockTradeHistory,
    performanceMetrics: null,
    chartData: null,
    filters: {},
    sortConfig: { key: 'closeTime', direction: 'desc' },
    pagination: {
      page: 1,
      limit: 20,
      total: mockTradeHistory.length,
      totalPages: Math.ceil(mockTradeHistory.length / 20)
    },
    isLoading: false,
    error: null,
    analysisDateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date()
    },
    
    // Actions
    fetchTradeHistory: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const state = get();
        const filtered = applyHistoryFilters(mockTradeHistory, state.filters);
        const sorted = applyHistorySorting(filtered, state.sortConfig);
        
        set({
          tradeHistory: mockTradeHistory,
          filteredHistory: sorted,
          pagination: {
            ...state.pagination,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / state.pagination.limit)
          },
          isLoading: false
        });
        
        // Auto-calculate metrics and chart data
        get().calculatePerformanceMetrics();
        get().generateChartData();
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch trade history',
          isLoading: false 
        });
      }
    },
    
    calculatePerformanceMetrics: () => {
      const state = get();
      const trades = state.filteredHistory.filter(trade => 
        trade.closeTime >= state.analysisDateRange.from &&
        trade.closeTime <= state.analysisDateRange.to
      );
      
      const metrics = calculateMetrics(trades);
      set({ performanceMetrics: metrics });
    },
    
    generateChartData: () => {
      const state = get();
      const trades = state.filteredHistory.filter(trade => 
        trade.closeTime >= state.analysisDateRange.from &&
        trade.closeTime <= state.analysisDateRange.to
      );
      
      const chartData = generateChartDataFromTrades(trades);
      set({ chartData });
    },
    
    // Filtering and sorting
    setFilters: (newFilters: Partial<HistoryFilters>) => {
      set(state => {
        const filters = { ...state.filters, ...newFilters };
        const filtered = applyHistoryFilters(state.tradeHistory, filters);
        const sorted = applyHistorySorting(filtered, state.sortConfig);
        
        return {
          filters,
          filteredHistory: sorted,
          pagination: {
            ...state.pagination,
            page: 1,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / state.pagination.limit)
          }
        };
      });
      
      // Recalculate metrics and chart data
      get().calculatePerformanceMetrics();
      get().generateChartData();
    },
    
    clearFilters: () => {
      set(state => {
        const sorted = applyHistorySorting(state.tradeHistory, state.sortConfig);
        return {
          filters: {},
          filteredHistory: sorted,
          pagination: {
            ...state.pagination,
            page: 1,
            total: state.tradeHistory.length,
            totalPages: Math.ceil(state.tradeHistory.length / state.pagination.limit)
          }
        };
      });
      
      // Recalculate metrics and chart data
      get().calculatePerformanceMetrics();
      get().generateChartData();
    },
    
    setSortConfig: (config: SortConfig) => {
      set(state => {
        const sorted = applyHistorySorting(state.filteredHistory, config);
        return {
          sortConfig: config,
          filteredHistory: sorted
        };
      });
    },
    
    setPagination: (newPagination: Partial<PaginationState>) => {
      set(state => ({
        pagination: { ...state.pagination, ...newPagination }
      }));
    },
    
    setAnalysisDateRange: (range: { from: Date; to: Date }) => {
      set({ analysisDateRange: range });
      
      // Recalculate metrics and chart data with new date range
      get().calculatePerformanceMetrics();
      get().generateChartData();
    },
    
    // Export functionality
    exportHistory: async (options: ExportOptions) => {
      try {
        const state = get();
        let tradesToExport = state.filteredHistory;
        
        // Apply date range filter if specified
        if (options.dateRange) {
          tradesToExport = tradesToExport.filter(t => 
            t.closeTime >= options.dateRange!.from && 
            t.closeTime <= options.dateRange!.to
          );
        }
        
        const csv = generateHistoryCSV(tradesToExport);
        
        if (options.format === 'csv') {
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `trade_history_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        
        return csv;
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Export failed' });
        throw error;
      }
    },
    
    exportPerformanceReport: async () => {
      try {
        const state = get();
        if (!state.performanceMetrics || !state.chartData) {
          throw new Error('Performance data not available');
        }
        
        const csv = generatePerformanceReportCSV(state.performanceMetrics, state.chartData);
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return csv;
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Export failed' });
        throw error;
      }
    },
    
    // Utility
    clearError: () => set({ error: null }),
    
    refreshData: async () => {
      await get().fetchTradeHistory();
    }
  }),
  { name: 'history-store' }
));